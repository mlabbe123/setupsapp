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
    $http.get('/api/get-setups-filters/').
        success(function(data, status, headers, config) {
            console.log(data)
        }).
        error(function(data, status, headers, config) {
            console.log(status)
        });

    $scope.sim_name = $routeParams.simName;
});