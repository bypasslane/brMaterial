angular
  .module('brMaterial')
  .directive('brToolbar', toolbarDirective);


function toolbarDirective() {
  var directive = {
    restrict: 'E'
  };
  return directive;
}
