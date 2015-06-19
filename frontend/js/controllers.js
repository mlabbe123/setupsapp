var setupsSharingAppControllers = angular.module('setupsSharingAppControllers', []);


setupsSharingAppControllers.controller('setupListCtrl', function($scope, $routeParams, $http) {

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

setupsSharingAppControllers.controller('submitSetupCtrl', function($scope, $routeParams, $http, $q) {

    // Get all the sims.
    $scope.allsims = $http.get('/api/get-all-sims/');

    // Get all the cars.
    $scope.allcars = $http.get('/api/get-all-cars/');

    // Get all the tracks.
    $scope.alltracks = $http.get('/api/get-all-tracks/');

    $q.all([$scope.allsims, $scope.allcars, $scope.alltracks]).then(function(values) {
        console.log(values[0].data);
        console.log(values[1].data);
        console.log(values[2].data);

        $scope.sims = [];

        _.forEach(values[0].data, function(sim) {
            $scope.sims.push({
                name: sim.name,
                cars: _.filter(values[1].data, {'sim': sim._id}),
                tracks: _.filter(values[2].data, {'sim': sim._id})
            });
        });
    });

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