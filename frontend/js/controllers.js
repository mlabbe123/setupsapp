'use strict';

/* Controllers */

var setupsSharingAppControllers = angular.module('setupsSharingAppControllers', []);


setupsSharingAppControllers.controller('setupListCtrl', function($scope, $routeParams, $http) {

    // Get the sim id.
    $http.get('/api/get-sim-id/' + $routeParams.simName).
        success(function(data, status, headers, config) {
            console.log(data)
            $scope.simId = data;
        }).
        error(function(data, status, headers, config) {
            console.log(status);
        });

    // Get all the setups for the current sim.
    $http.get('/api/get-setups/' + $routeParams.simName).
        success(function(data, status, headers, config) {
            console.log(data)
            $scope.setups = data;
        }).
        error(function(data, status, headers, config) {
            console.log(status)
        });

    // Get all the filters.
    $http.get('/api/get-setups-filters/' + $routeParams.simName).
        success(function(data, status, headers, config) {
            console.log(data)
            $scope.setup_filters = data;
        }).
        error(function(data, status, headers, config) {
            console.log(status)
        });

    $scope.sim_name = $routeParams.simName;
});

setupsSharingAppControllers.controller('userProfileCtrl', function($scope, $routeParams, $http) {
console.log('in the userProfileCtrl yeah')
    // Get all the setups for the current user.
    // $http.get('/api/get-setups/' + $routeParams.simName).
    //     success(function(data, status, headers, config) {
    //         console.log(data)
    //         $scope.setups = data;
    //     }).
    //     error(function(data, status, headers, config) {
    //         console.log(status)
    //     });

    // Get all the filters.
    // $http.get('/api/get-setups-filters/' + $routeParams.simName).
    //     success(function(data, status, headers, config) {
    //         console.log(data)
    //         $scope.setup_filters = data;
    //     }).
    //     error(function(data, status, headers, config) {
    //         console.log(status)
    //     });

    $scope.sim_name = $routeParams.simName;
});

setupsSharingAppControllers.controller('submitSetupCtrl', function($scope, $routeParams, SimService) {

    SimService.returnSimsFullData().then(function(result) {
        console.log('result', result);
        $scope.sims = result;
    });

    $scope.handleCarsTracksSelects = function(sim) {
        if(sim !== 'undefined') {

        }
    }

    //Setting first option as selected in configuration select
    // $scope.setup.sim = $scope.setup.sims[0];

    // Get all the filters.
    // $http.get('/api/get-setups-filters/' + $routeParams.simName).
    //     success(function(data, status, headers, config) {
    //         console.log(data)
    //         $scope.setup_filters = data;
    //     }).
    //     error(function(data, status, headers, config) {
    //         console.log(status)
    //     });

    $scope.sim_name = $routeParams.simName;
});