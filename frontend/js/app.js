(function () {

    angular
        .module('setupsSharingApp', [
            'ngRoute',
            'setupsSharingAppControllers',
            'setupsSharingAppServices',
            'setupsSharingAppDirectives'
        ])
        .config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
            $routeProvider
                .when('/', {
                    templateUrl: 'templates/partials/home.html',
                    controller: 'homeCtrl'
                })
                .when('/setups/:simName', {
                    templateUrl: 'templates/partials/setup_listing.html',
                    controller: 'setupListCtrl'
                })
                // Setup detail page.
                .when('/setups/:simName/:setupId', {
                    templateUrl: 'templates/partials/setup_detail.html',
                    controller: 'setupDetailCtrl'
                })
                .when('/profile/:userid', {
                    templateUrl: 'templates/partials/profile.html',
                    controller: 'userProfileCtrl'
                })
                .when('/admin', {
                    templateUrl: 'templates/partials/admin/home.html'
                })
                .when('/admin/manage/users', {
                    templateUrl: 'templates/partials/admin/manage_users.html',
                    controller: 'manageUsersCtrl'
                })
                .when('/admin/manage/cars', {
                    templateUrl: 'templates/partials/admin/manage_cars.html',
                    controller: 'manageCarsCtrl'
                })
                .when('/admin/manage/tracks', {
                    templateUrl: 'templates/partials/admin/manage_tracks.html',
                    controller: 'manageTracksCtrl'
                })
                .when('/admin/add/sims', {
                    templateUrl: 'templates/partials/admin/add_sims.html',
                    controller: 'addSimsCtrl'
                })
                .when('/admin/add/cars', {
                    templateUrl: 'templates/partials/admin/add_cars.html',
                    controller: 'addCarsCtrl'
                })
                .when('/admin/add/tracks', {
                    templateUrl: 'templates/partials/admin/add_tracks.html',
                    controller: 'addTracksCtrl'
                })
                .otherwise({
                    redirectTo: '/'
                })

            //$locationProvider.html5Mode(true);
        }]);
})();