(function() {
    'use strict';

    /* Services */

    angular.module('setupsSharingAppServices', [])

        .service('SimService', ['$http', '$q',
            function($http, $q){

                var SimService = {};

                // Get all the sims.
                var allSims = $http.get('/api/get-all-sims/');

                // Get all the cars.
                var allCars = $http.get('/api/get-all-cars/');

                // Get all the tracks.
                var allTracks = $http.get('/api/get-all-tracks/');

                SimService.returnSimsFullData = function() {

                    return $q.all([allSims, allCars, allTracks]).then(function(values) {
                        var sims = [];

                        _.forEach(values[0].data, function(sim) {
                            // Searching for every cars that matches the sim id.
                            var simCars = [];

                            _.forEach(values[1].data, function(car) {
                                if(car.sim._id === sim._id) {
                                    simCars.push(car);
                                }
                            });

                            // Searching for every tracks that matches the sim id.
                            var simTracks = [];

                            _.forEach(values[2].data, function(track) {
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

                return SimService;
            }
        ])

        .service('uploadSetupService', ['$http', function($http) {
            this.upload = function(setup) {
                console.log(setup)
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
                .success(function() {

                })
                .error(function() {

                });
            }
        }]);
})();