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