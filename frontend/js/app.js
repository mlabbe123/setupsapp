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
                    templateUrl: 'partials/home.html',
                    controller: 'homeCtrl'
                })
                .when('/setups/:simName', {
                    templateUrl: 'partials/setup_listing.html',
                    controller: 'setupListCtrl'
                })
                // Setup detail page.
                .when('/setups/:simName/:setupId', {
                    templateUrl: 'partials/setup_detail.html',
                    controller: 'setupDetailCtrl'
                })
                .when('/profile/:userid', {
                    templateUrl: 'partials/profile.html',
                    controller: 'userProfileCtrl'
                })
                .when('/admin', {
                    templateUrl: 'partials/admin/home.html'
                })
                .when('/admin/manage/users', {
                    templateUrl: 'partials/admin/manage_users.html',
                    controller: 'manageUsersCtrl'
                })
                .when('/admin/manage/cars', {
                    templateUrl: 'partials/admin/manage_cars.html',
                    controller: 'manageCarsCtrl'
                })
                .when('/admin/manage/tracks', {
                    templateUrl: 'partials/admin/manage_tracks.html',
                    controller: 'manageTracksCtrl'
                })
                .when('/admin/add/sims', {
                    templateUrl: 'partials/admin/add_sims.html',
                    controller: 'addSimsCtrl'
                })
                .when('/admin/add/cars', {
                    templateUrl: 'partials/admin/add_cars.html',
                    controller: 'addCarsCtrl'
                })
                .when('/admin/add/tracks', {
                    templateUrl: 'partials/admin/add_tracks.html',
                    controller: 'addTracksCtrl'
                })
                // .otherwise({
                //     redirectTo: '/'
                // })

            //$locationProvider.html5Mode(true);
        }]);
})();