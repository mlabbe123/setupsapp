'use strict';

/* Directives */

var setupsSharingAppDirectives = angular.module('setupsSharingAppDirectives', []);

setupsSharingAppDirectives.directive('customFileUpload', [function() {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
          var onChangeFunc = scope.$eval(attrs.customFileUpload);
          element.bind('change', onChangeFunc);
        }
    }
}]);

setupsSharingAppDirectives.directive('tooltip', [function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var onMouseEnterFunc = function() {
                var toolTipElement = '<div class="tooltip-wrapper">' + attrs.tooltip + '</div>';
                element.append(angular.element(toolTipElement));
            };

            var onMouseLeaveFunc = function() {
                element[0].querySelector('.tooltip-wrapper').remove();
            };

            element.bind('mouseenter', onMouseEnterFunc);
            element.bind('mouseleave', onMouseLeaveFunc);
        } 
    }
}]);