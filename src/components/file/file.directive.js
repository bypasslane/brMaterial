angular
  .module('brMaterial')
  .directive('brFile', brFileDirective);


/**
 * @name brFile
 * @module brFile
 *
 *
 * @description
 * The <br-file> is a button with a model that will set based on a picked file.
 * you can use the styling classes as a button
 *
 * @param {boolean} [br-show-label] - show file name next to button
 * @param {string} [br-file-types] - a comma deliminated string containg allowd extensions
 * @param {boolean} [br-file-name]
 *
 * @example
 * <br-file ng-model="filename" show-label="false" br-file-types=".jpg,.png"></br-file>
 *
 */
brFileDirective.$inject = ['$brUtil'];
function brFileDirective ($brUtil) {
  var directive = {
    restrict: 'E',
    require: '?ngModel',
    transclude: true,
    scope: {
      brFileName: '=',
      brShowLabel: '=',
      brFileTypes: '@'
    },
    template: getTemplate,
    link: link
  };
  return directive;



  function getTemplate (tElement, tAttr) {
    return '<input type="file" class="ng-hide" accept="{{brFileTypes}}"/>'+
          '<br-button type="button" class="' + tAttr.class + '" ng-click="getImage()"><div ng-transclude></div></br-button>'+
          '<div flex class="br-file-label" ng-if="brShowLabel">{{fileName}}</div>';
  }


  function link (scope, element, attr, ngModelCtrl) {
    ngModelCtrl = ngModelCtrl || $brUtil.fakeNgModel();
    var input = angular.element(element.children()[0]);
    var theButton = angular.element(element.children()[1]);

    scope.getImage = function () {
      setTimeout(function(){
        // reset value or file change will not trigger after the first time
				input[0].value = '';
        input[0].click();
      }, 0);
    };


    input.on('change', function (event) {
      scope.brFileName = input.val().split('/').pop().split('\\').pop();
      ngModelCtrl.$setViewValue(event.target.files, event && event.type);
    });


    scope.$on('destroy', function () {
      input.off('change');
    });
  }
}
