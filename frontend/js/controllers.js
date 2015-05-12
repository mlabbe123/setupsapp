var setupsSharingAppControllers = angular.module('setupsSharingAppControllers', []);


setupsSharingAppControllers.controller('setupListCtrl', function($scope, $routeParams) {
    $scope.setups = [
        {
            'car': 'Ferrari 458 GT2',
            'track': 'Monza',
            'author': 'Mathieu Labbé',
            'Type': 'Q + R'
        },
        {
            'car': 'Ferrari 458 GT2',
            'track': 'Monza',
            'author': 'Un pas bon',
            'Type': 'Q + R'
        },
        {
            'car': 'Ferrari 458 GT2',
            'track': 'Monza',
            'author': 'Mathieu Labbé',
            'Type': 'Q + R'
        }
    ];

    $scope.sim_name = $routeParams.simName;
});