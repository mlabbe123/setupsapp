var setupsSharingApp = angular.module('setupsSharingApp', [
    'ngRoute',
    'setupsSharingAppControllers'
]);

setupsSharingApp.config(['$routeProvider', function($routeProvider) {
    $routeProvider
        .when('/:simName', {
            templateUrl: 'partials/simpage.html',
            controller: 'setupListCtrl'
        })
        .otherwise({
            redirectTo: '/'
        })
}]);
