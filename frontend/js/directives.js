(function () {
    'use strict';

    /* Directives */

    angular.module('setupsSharingAppDirectives', [])

        .directive('customFileUpload', function() {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {
                    var onChangeFunc = scope.$eval(attrs.customFileUpload);
                    element.bind('change', onChangeFunc);
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