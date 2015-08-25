(function () {
    'use strict';

    /* Controllers */

    angular.module('setupsSharingAppControllers', [])

        .controller('homeCtrl', function($scope, $http) {

            // Get every sims.
            $http.get('/api/get-all-sims/')
                .success(function(data, status, headers, config) {
                    $scope.sims = data;
                })
                .error(function(data, status, headers, config) {
                    console.log(status);
                });

            // Get users with most downloads.
            $http.get('/api/get-user-with-most-downloads/')
                .success(function(data, status, headers, config) {
                    $scope.user_stats = data;
                })
                .error(function(data, status, headers, config) {
                    console.log(status);
                });
        })

        .controller('setupListCtrl', function($scope, $routeParams, $http) {

            // Get the sim infos.
            $http.get('/api/get-sim-infos/' + $routeParams.simName).
                success(function(data, status, headers, config) {
                    console.log(data)
                    $scope.sim_infos = data;
                }).
                error(function(data, status, headers, config) {
                    console.log(status);
                });

            // Get all the setups for the current sim.
            $http.get('/api/get-setups/' + $routeParams.simName).
                success(function(data, status, headers, config) {
                    _.forEach(data, function(setup) {
                        setup.car_category = setup.car.category;
                        setup.car = setup.car.name;
                        setup.track = setup.track.name;
                        setup.authorid = setup.author._id;
                        setup.author = setup.author.display_name;
                    });

                    $scope.setups = data;
                }).
                error(function(data, status, headers, config) {
                    console.log(status)
                });

            // Get all the setup filters.
            $http.get('/api/get-setups-filters-by-simname/' + $routeParams.simName).
                success(function(data, status, headers, config) {
                    console.log(data)
                    $scope.setup_filters = data;
                }).
                error(function(data, status, headers, config) {
                    console.log(status)
                });

            $scope.sim_name = $routeParams.simName;

            $scope.predicate = 'added_date.timestamp';
            $scope.reverse = true;

            $scope.order = function(predicate) {
                $scope.reverse = ($scope.predicate === predicate) ? !$scope.reverse : false;
                $scope.predicate = predicate;
            };
        })

        .controller('setupDetailCtrl', function($scope, $routeParams, $http) {

            // Get the sim id.
            $http.get('/api/get-sim-infos/' + $routeParams.simName).
                success(function(data, status, headers, config) {
                    $scope.simId = data._id;
                }).
                error(function(data, status, headers, config) {
                    console.log(status);
                });

            // Get the setup info.
            $http.get('/api/get-setup/' + $routeParams.setupId).
                success(function(data, status, headers, config) {
                    $scope.setup = data;
                    $scope.setup.comments = $scope.setup.comments || "No comments."
                    $scope.setup.best_time = $scope.setup.best_time || "Not specified."
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
                        } else if(setupItemKey === 'FF_FEEDBACK') {
                            setupDetailsObj.ffb = setupItemValue;
                        } else if(setupItemKey === 'CAMBER_LF') {
                            setupDetailsObj.camber_lf = setupItemValue;
                        } else if(setupItemKey === 'CAMBER_RF') {
                            setupDetailsObj.camber_rf = setupItemValue;
                        } else if(setupItemKey === 'CAMBER_LR') {
                            setupDetailsObj.camber_lr = setupItemValue;
                        } else if(setupItemKey === 'CAMBER_RR') {
                            setupDetailsObj.camber_rr = setupItemValue;
                        } else if(setupItemKey === 'REAR_DIFF_PRELOAD') {
                            setupDetailsObj.rear_diff_preload = setupItemValue;
                        } else if(setupItemKey === 'CENTER_DIFF_PRELOAD') {
                            setupDetailsObj.center_diff_preload = setupItemValue;
                        } else if(setupItemKey === 'DIFF_POWER') {
                            setupDetailsObj.diff_power = setupItemValue;
                        } else if(setupItemKey === 'DIFF_COAST') {
                            setupDetailsObj.diff_coast = setupItemValue;
                        } else if(setupItemKey === 'ROD_LENGTH_LF') {
                            setupDetailsObj.rod_length_lf = setupItemValue;
                        } else if(setupItemKey === 'ROD_LENGTH_RF') {
                            setupDetailsObj.rod_length_rf = setupItemValue;
                        } else if(setupItemKey === 'ROD_LENGTH_LR') {
                            setupDetailsObj.rod_length_lr = setupItemValue;
                        } else if(setupItemKey === 'ROD_LENGTH_RR') {
                            setupDetailsObj.rod_length_rr = setupItemValue;
                        } else if(setupItemKey === 'DAMP_FAST_BUMP_LF') {
                            setupDetailsObj.damp_fast_bump_lf = setupItemValue;
                        } else if(setupItemKey === 'DAMP_FAST_BUMP_RF') {
                            setupDetailsObj.damp_fast_bump_rf = setupItemValue;
                        } else if(setupItemKey === 'DAMP_FAST_BUMP_LR') {
                            setupDetailsObj.damp_fast_bump_lr = setupItemValue;
                        } else if(setupItemKey === 'DAMP_FAST_BUMP_RR') {
                            setupDetailsObj.damp_fast_bump_rr = setupItemValue;
                        } else if(setupItemKey === 'DAMP_BUMP_LF') {
                            setupDetailsObj.damp_bump_lf = setupItemValue;
                        } else if(setupItemKey === 'DAMP_BUMP_RF') {
                            setupDetailsObj.damp_bump_rf = setupItemValue;
                        } else if(setupItemKey === 'DAMP_BUMP_LR') {
                            setupDetailsObj.damp_bump_lr = setupItemValue;
                        } else if(setupItemKey === 'DAMP_BUMP_RR') {
                            setupDetailsObj.damp_bump_rr = setupItemValue;
                        } else if(setupItemKey === 'DAMP_FAST_REBOUND_LF') {
                            setupDetailsObj.damp_fast_rebound_lf = setupItemValue;
                        } else if(setupItemKey === 'DAMP_FAST_REBOUND_RF') {
                            setupDetailsObj.damp_fast_rebound_rf = setupItemValue;
                        } else if(setupItemKey === 'DAMP_FAST_REBOUND_LR') {
                            setupDetailsObj.damp_fast_rebound_lr = setupItemValue;
                        } else if(setupItemKey === 'DAMP_FAST_REBOUND_RR') {
                            setupDetailsObj.damp_fast_rebound_rr = setupItemValue;
                        } else if(setupItemKey === 'DAMP_REBOUND_LF') {
                            setupDetailsObj.damp_rebound_lf = setupItemValue;
                        } else if(setupItemKey === 'DAMP_REBOUND_RF') {
                            setupDetailsObj.damp_rebound_rf = setupItemValue;
                        } else if(setupItemKey === 'DAMP_REBOUND_LR') {
                            setupDetailsObj.damp_rebound_lr = setupItemValue;
                        } else if(setupItemKey === 'DAMP_REBOUND_RR') {
                            setupDetailsObj.damp_rebound_rr = setupItemValue;
                        } else if(setupItemKey === 'WING_1') {
                            setupDetailsObj.front_wing = setupItemValue;
                        } else if(setupItemKey === 'WING_2') {
                            setupDetailsObj.rear_wing = setupItemValue;
                        } else if(setupItemKey === 'FRONT_BIAS') {
                            setupDetailsObj.front_bias = setupItemValue;
                        } else if(setupItemKey === 'ENGINE_LIMITER') {
                            setupDetailsObj.engine_limiter = setupItemValue;
                        } else if(setupItemKey === 'ARB_FRONT') {
                            setupDetailsObj.arb_front = setupItemValue;
                        } else if(setupItemKey === 'ARB_REAR') {
                            setupDetailsObj.arb_rear = setupItemValue;
                        } else if(setupItemKey === 'SPRING_RATE_LF') {
                            setupDetailsObj.spring_rate_lf = setupItemValue;
                        } else if(setupItemKey === 'SPRING_RATE_RF') {
                            setupDetailsObj.spring_rate_rf = setupItemValue;
                        } else if(setupItemKey === 'SPRING_RATE_LR') {
                            setupDetailsObj.spring_rate_lr = setupItemValue;
                        } else if(setupItemKey === 'SPRING_RATE_RR') {
                            setupDetailsObj.spring_rate_rr = setupItemValue;
                        }
                    });

                    $scope.setup_details = setupDetailsObj;
                    console.log($scope.setup_details)
                }).
                error(function(data, status, headers, config) {
                    console.log(status);
                });

            $scope.sim_name = $routeParams.simName;
        })

        .controller('submitSetupCtrl', function($scope, $routeParams, SimService) {

            SimService.returnSimsFullData().then(function(result) {
                console.log('result', result);
                $scope.sims = result;
            });

            $scope.uploadFile = function($scope) {
                var filename = event.target.files[0].name;
                angular.element(event.srcElement.parentElement.parentElement.querySelector('#setup-file-display-name')).html(filename);
                angular.element(event.srcElement.parentElement.querySelector('#setup-file-hidden')).val(filename);
            }

            $scope.sim_name = $routeParams.simName;
        })

        .controller('userProfileCtrl', function($scope, $routeParams, $http) {

            var logged_user_id = angular.element(document.querySelector('#logged-userid')).val();

            // Get user information.
            $http.get('/api/get-user-by-id/' + $routeParams.userid)
                .success(function(data, status, headers, config) {
                    $scope.user = data;

                    // If the user is logged in and on it's own profile page.
                    if(logged_user_id && logged_user_id === $routeParams.userid) {
                        $scope.user.own_profile = true;
                    } else {
                        $scope.user.own_profile = false;
                    }
                })
                .error(function(data, status, headers, config) {
                    console.log(status)
                });



            // Get every setups for the user.
            $http.get('/api/get-setups-by-user/' + $routeParams.userid)
                .success(function(data, status, headers, config) {

                    var total_downloads = 0;

                    _.forEach(data, function(setup) {
                        setup.car = setup.car.name;
                        setup.track = setup.track.name;
                        setup.author = setup.author.display_name;
                        setup.simid = setup.sim._id;
                        setup.sim = setup.sim.display_name;

                        total_downloads += setup.downloads;
                    });

                    $scope.setups = data;
                    $scope.setups_count = $scope.setups.length;
                    $scope.total_downloads = total_downloads;
                })
                .error(function(data, status, headers, config) {
                    console.log(status)
                });

            // Get all the setup filters.
            $http.get('/api/get-setups-filters-by-userid/' + $routeParams.userid).
                success(function(data, status, headers, config) {
                    $scope.setup_filters = data;
                }).
                error(function(data, status, headers, config) {
                    console.log(status)
                });

            $scope.updateUsername = function() {
                var newUsername = angular.element(event.srcElement.parentElement.querySelector('#profile-change-username')).val();

                // Verify if username is free to use.
                $http.get('/api/get-user-by-name/' + newUsername)
                    .success(function(data, status, headers, config) {
                        if(data) {
                            // Tell the user that this username is already in use.
                            angular.element(document.querySelector('.profile-change-username-msg-box')).html('This username is already in use, please try another one.')
                        } else {
                            // Update user display_name in db
                            $http.post('/api/update-user-displayname/', {userId: $routeParams.userid, newDisplayName: newUsername})
                                .success(function(data, status, headers, config) {
                                    console.log('User display_name updated successfully');
                                })
                                .error(function(data, status, headers, config) {
                                    console.log(status)
                                });
                            // Tell the user that his display_name has been change.
                            angular.element(document.querySelector('.profile-change-username-msg-box')).html('Username successfully updated.');
                        }
                    })
                    .error(function(data, status, headers, config) {
                        console.log(status)
                    });
            }

            $scope.predicate = 'added_date.timestamp';
            $scope.reverse = true;

            $scope.order = function(predicate) {
                $scope.reverse = ($scope.predicate === predicate) ? !$scope.reverse : false;
                $scope.predicate = predicate;
            };
        })

        .controller('manageUsersCtrl', function($scope, $routeParams, $http) {
            console.log('manage users');

            // Get every users in the db.
            $http.get('/api/get-all-users/')
                .success(function(data, status, headers, config) {
                    console.log(data);
                    $scope.users = data;
                })
                .error(function(data, status, headers, config) {
                    console.log(status)
                });
        })

        .controller('manageSimsCtrl', function($scope, $routeParams, $http) {
            console.log('manage sims')
        })

        .controller('manageCarsCtrl', function($scope, $routeParams, $http) {
            console.log('manage cars');

            // Get every cars in the db.
            $http.get('/api/get-all-cars/')
                .success(function(data, status, headers, config) {
                    console.log(data);
                    $scope.cars = data;
                })
                .error(function(data, status, headers, config) {
                    console.log(status)
                });
        })

        .controller('manageTracksCtrl', function($scope, $routeParams, $http) {
            console.log('manage tracks');

            // Get every tracks in the db.
            $http.get('/api/get-all-tracks/')
                .success(function(data, status, headers, config) {
                    console.log(data);
                    $scope.tracks = data;
                })
                .error(function(data, status, headers, config) {
                    console.log(status)
                });
        })

        .controller('addSimsCtrl', function($scope, $routeParams, $http) {
            console.log('add sims');

            // The POST reqeust is not triggering any callbacks since it is out of angular context (why?)
            // http://stackoverflow.com/questions/17701503/angularjs-http-not-firing-get-call

            $scope.addSim = function() {
                if($scope.simCode && $scope.simDisplayName) {
                    $http.post('/api/add-sim/', {simCode: $scope.simCode, simDisplayName: $scope.simDisplayName})
                        .success(function(data, status, headers, config) {
                            console.log('success')
                            angular.element(document.querySelector('#msg-box')).html('Sim successfully created.')
                        })
                        .error(function(data, status, headers, config) {
                            console.log(status)
                        })
                        .catch(function(error) {
                            console.log(error)
                        });
                }
            }
        })

        .controller('addCarsCtrl', function($scope, $routeParams, $http) {
            console.log('add cars');

            // The POST reqeust is not triggering any callbacks since it is out of angular context (why?)
            // http://stackoverflow.com/questions/17701503/angularjs-http-not-firing-get-call

            $scope.addCar = function() {
                if($scope.carName && $scope.carCategory) {
                    $http.post('/api/add-car/', {carName: $scope.carName, carCategory: $scope.carCategory, sim: '55c2cddddebcbba924bb2a34'})
                        .success(function(data, status, headers, config) {
                            console.log('success')
                            angular.element(document.querySelector('#msg-box')).html('Car successfully created.')
                        })
                        .error(function(data, status, headers, config) {
                            console.log(status)
                        })
                        .catch(function(error) {
                            console.log(error)
                        });
                }
            }
        })

        .controller('addTracksCtrl', function($scope, $routeParams, $http) {
            console.log('add tracks');

            // The POST reqeust is not triggering any callbacks since it is out of angular context (why?)
            // http://stackoverflow.com/questions/17701503/angularjs-http-not-firing-get-call

            $scope.addTrack = function() {
                if($scope.trackName) {
                    $http.post('/api/add-track/', {trackName: $scope.trackName, sim: '55c2cddddebcbba924bb2a34'})
                        .success(function(data, status, headers, config) {
                            console.log('success')
                            angular.element(document.querySelector('#msg-box')).html('Track successfully created.')
                        })
                        .error(function(data, status, headers, config) {
                            console.log(status)
                        })
                        .catch(function(error) {
                            console.log(error)
                        });
                }
            }
        })
})();