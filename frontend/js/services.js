(function() {
    'use strict';

    /* Services */

    angular.module('setupsSharingAppServices', [])

        .service('SimService', ['$http', '$q',
            function($http, $q){

                var SimService = {};

                SimService.returnSimsFullData = function() {
                    // Get all the sims.
                    var allSims = $http.get('/api/get-all-sims/');

                    // Get all the cars.
                    var allCars = $http.get('/api/get-all-cars/');

                    // Get all the tracks.
                    var allTracks = $http.get('/api/get-all-tracks/');

                    return $q.all([allSims, allCars, allTracks]).then(function(values) {
                        var sims = [];

                        values[0].data.forEach(function(sim) {
                            // Searching for every cars that matches the sim id.
                            var simCars = [];

                            values[1].data.forEach(function(car) {
                                if(car.sim._id === sim._id) {
                                    simCars.push(car);
                                }
                            });

                            // Searching for every tracks that matches the sim id.
                            var simTracks = [];

                            values[2].data.forEach(function(track) {
                                if(track.sim._id === sim._id) {
                                    simTracks.push(track);
                                }
                            });

                            sims.push({
                                display_name: sim.display_name,
                                id: sim._id,
                                versions: sim.versions,
                                cars: simCars,
                                tracks: simTracks
                            });
                        });

                        return sims;
                    });
                }

                SimService.getAllTracks = function() {
                    return $http.get('/api/get-all-tracks/');
                }

                return SimService;
            }
        ])

        .service('userSession', function() {
            var NotificationStatus = '',
                NotificationMsg = '';

            return {
                setNotificationStatus: function (status) {
                    NotificationStatus = status;
                },
                setNotificationMsg: function (msg) {
                    NotificationMsg = msg;
                },
                getNotificationStatus: function () {
                    return NotificationStatus;
                },
                getNotificationMsg: function() {
                    return NotificationMsg;
                }
            };
        })

        .service('uploadSetupService', ['$http', '$location', 'userSession', function($http, $location, userSession) {
            this.upload = function(setup) {
                // FormDate object to store file.
                var fd = new FormData();

                // Append info to fd.
                fd.append('file', setup.file);
                fd.append('file_name', setup.file.name);
                fd.append('sim_id', setup.sim.id)
                fd.append('sim_version', setup.sim.versions[setup.sim.versions.length - 1]);
                fd.append('user_id', setup.author_userid);
                fd.append('car_id', setup.car._id);
                fd.append('track_id', setup.track._id);
                fd.append('trim', setup.trim);
                fd.append('best_laptime', setup.best_laptime || '');
                fd.append('comments', setup.comments || '');

                // Ajax call to API.
                $http.post('/api/create-setup/', fd, {
                    transformRequest: angular.identity,
                    headers: {'Content-Type': undefined}
                })
                .success(function(data, status, headers, config) {
                    // Inform user of operation success.
                    userSession.setNotificationStatus(data.status);
                    userSession.setNotificationMsg(data.msg);

                    // Redirect to profile page.
                    $location.path('/profile/' + setup.author_userid);
                })
                .error(function(data, status, headers, config) {
                    // Inform user of operation success.
                    userSession.setNotificationStatus(data.status);
                    userSession.setNotificationMsg(data.msg);

                    // Remove loading state from submit button.
                    angular.element(document.getElementById('submit-button')).prop('disabled', false).removeClass('is-loading icon-loading');
                });
            };

            this.update = function(setup) {
                if (setup.file) {
                    var fd = new FormData();

                    // Append file to FormData object.
                    fd.append('file', setup.file);
                    fd.append('file_name', setup.file.name);
                    fd.append('setup_id', setup._id);
                    fd.append('trim', setup.type);
                    fd.append('sim_version', setup.sim_version);
                    fd.append('best_laptime', setup.best_time || '');
                    fd.append('comments', setup.comments || '');
                    fd.append('sim_id', setup.sim._id);
                    fd.append('track_id', setup.track._id);
                    
                    // Set the ajax url for file upload.
                    var url = '/api/update-setup-with-file/';
                    // Set ajax params for file upload.
                    var params = {
                        transformRequest: angular.identity,
                        headers: {'Content-Type': undefined}
                    };
                } else {
                    var fd = {
                        setup_id: setup._id,
                        trim: setup.type,
                        sim_version: setup.sim_version,
                        best_laptime: setup.best_time,
                        comments: setup.comments,
                        track_id: setup.track._id
                    };
                    // Set the ajax url for file upload.
                    var url = '/api/update-setup/';
                    // Set ajax params for file upload.
                    var params = {};
                }

                $http.post(url, fd, params)
                .success(function(data, status, headers, config) {
                    // Inform user of operation success.
                    userSession.setNotificationStatus(data.status);
                    userSession.setNotificationMsg(data.msg);

                    // Redirect to profile page.
                    $location.path('/profile/' + setup.author._id);
                })
                .error(function(data, status, headers, config) {
                    // Inform user of operation success.
                    userSession.setNotificationStatus(data.status);
                    userSession.setNotificationMsg(data.msg);

                    // Remove loading state from submit button.
                    angular.element(document.getElementById('submit-button')).prop('disabled', false).removeClass('is-loading icon-loading');
                });
            };
        }]);
})();