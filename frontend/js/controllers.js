'use strict';

/* Controllers */

var setupsSharingAppControllers = angular.module('setupsSharingAppControllers', []);


setupsSharingAppControllers.controller('setupListCtrl', function($scope, $routeParams, $http) {

    // Get the sim id.
    $http.get('/api/get-sim-id/' + $routeParams.simName).
        success(function(data, status, headers, config) {
            $scope.simId = data;
        }).
        error(function(data, status, headers, config) {
            console.log(status);
        });

    // Get all the setups for the current sim.
    $http.get('/api/get-setups/' + $routeParams.simName).
        success(function(data, status, headers, config) {
            _.forEach(data, function(setup) {
                setup.car = setup.car.name;
                setup.track = setup.track.name;
                setup.author = setup.author.display_name;
            });

            $scope.setups = data;
        }).
        error(function(data, status, headers, config) {
            console.log(status)
        });

    // Get all the filters.
    $http.get('/api/get-setups-filters/' + $routeParams.simName).
        success(function(data, status, headers, config) {
            $scope.setup_filters = data;
        }).
        error(function(data, status, headers, config) {
            console.log(status)
        });

    $scope.sim_name = $routeParams.simName;

    $scope.selectItem = function(event) {
        var srcElement = event.srcElement,
            parentElement = event.srcElement.parentNode;

        angular.element(parentElement.querySelector('.filter-selectable-element')).removeClass('is-selected');

        angular.element(srcElement).addClass('is-selected');
    }
});

setupsSharingAppControllers.controller('setupDetailCtrl', function($scope, $routeParams, $http) {

    // Get the sim id.
    $http.get('/api/get-sim-id/' + $routeParams.simName).
        success(function(data, status, headers, config) {
            $scope.simId = data;
        }).
        error(function(data, status, headers, config) {
            console.log(status);
        });

    // Get the setup info.
    $http.get('/api/get-setup/' + $routeParams.setupId).
        success(function(data, status, headers, config) {
            $scope.setup = data;
        }).
        error(function(data, status, headers, config) {
            console.log(status);
        });

    // Get the setup file details.
    $http.get('/api/get-setup-file-details/' + $routeParams.setupId).
        success(function(data, status, headers, config) {

            // For Assetto Corsa

            // Remove all linebreaks
            data = data.replace(/\n/g, '').split('[');

            data.shift();

            var setupDetailsObj = {};

            _.forEach(data, function(setup_item) {
                var setupItemArray = setup_item.split(/]/g),
                    setupItemKey = setupItemArray[0],
                    setupItemValue = setupItemArray[1].replace('VALUE=', '');

                if(setupItemKey === 'FUEL') {
                    setupDetailsObj.fuel = setupItemValue;
                } else if(setupItemKey === 'PRESSURE_LF') {
                    setupDetailsObj.pressure_lf = setupItemValue;
                } else if(setupItemKey === 'PRESSURE_RF') {
                    setupDetailsObj.pressure_rf = setupItemValue;
                } else if(setupItemKey === 'PRESSURE_LR') {
                    setupDetailsObj.pressure_lr = setupItemValue;
                } else if(setupItemKey === 'PRESSURE_RR') {
                    setupDetailsObj.pressure_rr = setupItemValue;
                } else if(setupItemKey === 'TOE_OUT_LF') {
                    setupDetailsObj.toe_out_lf = setupItemValue;
                } else if(setupItemKey === 'TOE_OUT_LR') {
                    setupDetailsObj.toe_out_lr = setupItemValue;
                } else if(setupItemKey === 'TOE_OUT_RF') {
                    setupDetailsObj.toe_out_rf = setupItemValue;
                } else if(setupItemKey === 'TOE_OUT_RR') {
                    setupDetailsObj.toe_out_rr = setupItemValue;
                }
            });

            $scope.setup_details = setupDetailsObj;
        }).
        error(function(data, status, headers, config) {
            console.log(status);
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