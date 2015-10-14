(function () {
    'use strict';

    /* Directives */

    angular.module('setupsSharingAppDirectives', [])

        .directive('fileModel', ['$parse', function ($parse) {
            return {
                restrict: 'A',
                link: function(scope, element, attrs) {
                    var model = $parse(attrs.fileModel);
                    var modelSetter = model.assign;
                    
                    element.bind('change', function(){
                        scope.$apply(function(){
                            modelSetter(scope, element[0].files[0]);
                        });
                    });
                }
            };
        }])

        .directive('formatLaptime', function($filter) {
            return {
                restrict: 'A',
                require: 'ngModel',
                link: function (scope, element, attrs, ngModelCtrl) {
 
                    var onBlurFunc = function(event) {
                        var ngElement = angular.element(event.srcElement),
                            laptimeValue = ngElement.val();

                        // Replace every , and : by dots and remove every non numeric char except dots.
                        laptimeValue = laptimeValue.replace(/[:,]/g,'.').replace(/[^0-9.]/g,'');

                        // Check if laptime begins with a zero.
                        while(laptimeValue.indexOf('0') === 0) {
                            // Remove the begining 0s.
                            laptimeValue = laptimeValue.substring(1);
                        }

                        // Check if laptime finishes with 3 digits. Then...
                        var laptimeSplitted = laptimeValue.split('.');

                        // ...Add an x if not 3 digits.
                        while (laptimeSplitted[laptimeSplitted.length - 1].length < 3) {
                            laptimeSplitted[laptimeSplitted.length - 1] += 'x';
                        }

                        // ...Keeps only the first 3 digits if there are more than 3.
                        if (laptimeSplitted[laptimeSplitted.length - 1].length > 3) {
                            laptimeSplitted[laptimeSplitted.length - 1] = laptimeSplitted[laptimeSplitted.length - 1].substring(0, 3);
                        }

                        // For any group that isnt the last, keep only 2 first digits if there are more than 2.
                        for (var i = 0; i < laptimeSplitted.length - 1; i++) {
                            if (laptimeSplitted[i] > 2) {
                                laptimeSplitted[i] = laptimeSplitted[i].substring(0, 2);
                            }
                        }

                        // Join the array into one string, the formatted laptime.
                        laptimeValue = laptimeSplitted.join('.');

                        // Put the formatteds laptime in the DOM.
                        ngElement.val(laptimeValue);

                        updateModel(laptimeValue);
                    };

                    var onKeyDownFunc = function(event) {
                        // Array of allowd char.
                        var allowedChar = [48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 190, 36, 37, 38, 39, 7, 8, 9, 46];

                        // Prevent key if not in the allowed keys array.
                        if (allowedChar.indexOf(event.keyCode) === -1) {
                            event.preventDefault();
                        }
                    };

                    var updateModel = function(laptimeValue) {
                        scope.$apply(function () {
                            ngModelCtrl.$setViewValue(laptimeValue);
                            ngModelCtrl.$render();
                        });
                    }

                    // Bind the event listener.
                    element.bind('change', onBlurFunc);
                    element.bind('keydown', onKeyDownFunc);
                }
            }
        })

        // .directive('fixedToTop', function($window) {
        //     return {
        //         restrict: 'A',
        //         link: function (scope, element, attrs) {
        //             angular.element($window).bind("scroll", function() {
        //                 console.log(element[0].scrollTop);
        //             });
        //         }
        //     }
        // })

        .directive('tooltip', function() {
            return {
                restrict: 'A',
                controller: function($scope, $http) {
                    $scope.deleteSetup = function(setupId, simId, event) {

                        var ngElement = angular.element(event.target);

                        if (ngElement.hasClass('is-ready-to-delete')) {
                            // Delete the setup.
                            $http.post('/api/delete-setup/', {setupId: setupId, simId: simId})
                                .success(function(data, status, headers, config) {

                                    // Tell the user the setup has been deleted.

                                    // Remove from the DOM.
                                    angular.element(ngElement[0].parentElement.parentElement).remove();
                                })
                                .error(function(data, status, headers, config) {
                                    // Tell the user an error occured.

                                    console.log(status)
                                });
                        } else {
                            if (ngElement.hasClass('tooltip-message')) {
                                // Remove class from every icon-error element form table.
                                angular.element(document.querySelector('.is-ready-to-delete')).removeClass('is-ready-to-delete').triggerHandler('mouseleave');

                                this.newToolTipValue = undefined;
                            } else {
                                // Remove class from every icon-error element form table.
                                angular.element(document.querySelector('.is-ready-to-delete')).removeClass('is-ready-to-delete').triggerHandler('mouseleave');

                                // Add class to source element.
                                ngElement.addClass('is-ready-to-delete');

                                this.newToolTipValue = 'Click again to confirm delete (or cancel)';
                            }
                        }
                    }
                },
                link: function(scope, element, attrs) {
                    var onMouseEnterFunc = function() {
                        var elementWidth = element[0].offsetWidth,
                            elementOffsetLeft = element[0].offsetLeft,
                            tooltipMessage = scope.newToolTipValue ? scope.newToolTipValue : attrs.tooltip,
                            toolTipElement = angular.element('<div class="tooltip-wrapper"><div class="tooltip-message">' + tooltipMessage + '</div><i class="tooltip-arrow"></i></div>');

                        angular.element(toolTipElement).bind('click', onTooltipClick)
                        element.append(angular.element(toolTipElement));

                    };

                    var onMouseLeaveFunc = function() {
                        angular.element(element[0].querySelector('.tooltip-wrapper')).remove();
                    };

                    var onTooltipClick = function() {
                        element.triggerHandler('mouseleave');
                    };

                    scope.$watch('newToolTipValue', function() {
                        if (scope.newToolTipValue !== undefined && element.hasClass('is-ready-to-delete')) {
                            element.triggerHandler('mouseenter');
                        }
                    });

                    element.bind('mouseenter', onMouseEnterFunc);
                    element.bind('mouseleave', onMouseLeaveFunc);
                }
            }
        })

        .directive('parallax', function($window) {
            return {
                restrict: 'A',
                link: function(scope, element, attrs) {
                    var $win = angular.element($window);

                    angular.element($window).bind("scroll", function() {
                        // TODO: Need to set this outside the scroll listener.
                        var bgTotalOffset = element[0].offsetHeight + element[0].offsetTop;

                        if (this.pageYOffset < bgTotalOffset) {
                            angular.element(document.querySelector('.' + attrs.parallax)).css('background-position', '0 ' + -Math.sqrt(this.pageYOffset)*3 + 'px');
                        }
                    });
                }
            }
        });
})();