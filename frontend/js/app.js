var setupsSharingApp = angular.module('setupsSharingApp', [
    'ngRoute',
    'setupsSharingAppControllers'
]);

setupsSharingApp.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'partials/home.html'
        })
        .when('/setups/:simName', {
            templateUrl: 'partials/simpage.html',
            controller: 'setupListCtrl'
        })
        // Setup detail page.
        .when('/setups/:simName/:setupId', {
            templateUrl: 'partials/simpage.html',
            controller: 'setupListCtrl'
        })
        // Author detail page.
        // .when('/setups/:simName/:setupId', {
        //     templateUrl: 'partials/simpage.html',
        //     controller: 'setupListCtrl'
        // })
        .otherwise({
            redirectTo: '/'
        })

    //$locationProvider.html5Mode(true);
}]);
