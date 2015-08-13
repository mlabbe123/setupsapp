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

        .directive('tooltip', function() {
            return {
                restrict: 'A',
                link: function(scope, element, attrs) {
                    var onMouseEnterFunc = function() {
                        var elementWidth = element[0].offsetWidth,
                            elementOffsetLeft = element[0].offsetLeft,
                            toolTipElement = angular.element('<div class="tooltip-wrapper"><div class="tooltip-message">' + attrs.tooltip + '</div><i class="tooltip-arrow"></i></div>');

                        element.append(angular.element(toolTipElement));
                    };

                    var onMouseLeaveFunc = function() {
                        element[0].querySelector('.tooltip-wrapper').remove();
                    };

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

                    $win.on('scroll', function(event) {
                        angular.element(document.querySelector('.' + attrs.parallax)).css('background-position', '0 ' + -Math.sqrt(this.pageYOffset)*3 + 'px');
                    });
                }
            }
        });
})();