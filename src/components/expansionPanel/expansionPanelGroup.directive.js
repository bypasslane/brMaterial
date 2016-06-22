angular
  .module('brMaterial')
  .directive('brExpansionPanelGroup', expansinPanelGroupDirective);



expansinPanelGroupDirective.$inject = [];
function expansinPanelGroupDirective() {
  var directive = {
    restrict: 'E'
  };
  return directive;
}
