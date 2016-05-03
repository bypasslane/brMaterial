angular
  .module('brMaterial')
  .directive('brRipple', rippleDirective);


rippleDirective.$inject = ['$brRippleService'];
function rippleDirective ($brRippleService) {
  var directive = {
    controller: angular.noop,
    link: link
  };
  return directive;

  function link (scope, element, attr) {
    $brRippleService.attach(scope, element);
  }
}
