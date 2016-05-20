angular
  .module('brMaterial')
  .directive('brAutocomplete', autocompleteDirective);


autocompleteDirective.$inject = ['$brTheme', '$parse', '$filter', '$timeout', '$brUtil'];
function autocompleteDirective($brTheme, $parse, $filter, $timeout, $brUtil) {
  var directive = {
    restrict: 'E',
    require: '?ngModel',
    scope: {
      brData: '=',
      brFilter: '='
    },
    template: '<div class="br-autocomplete-container" ng-if="_show" layout="column">'+
      '<div class="br-autocomplete-repeater" ng-repeat="item in _data" ng-click="triggerClick(item)">'+
        '{{item.name}}'+
      '</div>'+
    '</div>',
    link: link
  };
  return directive;



  function link (scope, element, attrs, ctrls) {
    $brTheme(element);

    var ngModelCtrl = ctrls || $brUtil.fakeNgModel();
    var input = angular.element(element.parent().find('input')[0]);
    var filterBy = $filter('filter');
    var rawData = [];
    var filterData = '';

    scope._show = false;

    // TODO look into switching ng click to a directive to reduce watchers
    scope.triggerClick = function (item) {
      ngModelCtrl.$setViewValue(item);
      ngModelCtrl.$render();
    };

    scope.$watch(function () {
      return scope.brData;
    }, function (data) {
      rawData = data;
      filterRaw();
    }, true);


    scope.$watch(function () {
      return scope.brFilter;
    }, function (data) {
      filterData = data;
      filterRaw();
    }, true);

    input
      .on('focus', show)
      .on('blur', hide);

    scope.$on('$destroy', function () {
      input
        .off('focus', show)
        .off('blur', hide);
    });


    function show() {
      scope.$apply(function () {
        scope._show = true;
      });
    }

    function hide() {
      $timeout(function () {
        scope._show = false;
      }, 200);
    }

    function filterRaw() {
      scope._data = filterBy(rawData, filterData);
    }
  }
}
