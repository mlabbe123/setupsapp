'use strict';

/* Services */

var setupsSharingAppServices = angular.module('setupsSharingAppServices', []);

setupsSharingAppServices.service('SimService', ['$http', '$q',
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
                    sims.push({
                        name: sim.name,
                        id: sim._id,
                        cars: _.filter(values[1].data, {'sim': sim._id}),
                        tracks: _.filter(values[2].data, {'sim': sim._id})
                    });
                });

                return sims;
            });
        }

        return SimService;
    }
]);