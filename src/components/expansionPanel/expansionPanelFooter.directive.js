angular
  .module('brMaterial')
  .directive('brExpansionPanelFooter', expansionPanelFooterDirective);


expansionPanelFooterDirective.$inject = ['$animateCss'];
function expansionPanelFooterDirective($animateCss) {
  var directive = {
    restrict: 'E',
    transclude: true,
    template: '<div class="br-expansion-panel-footer-container" ng-transclude></div>',
    require: '^^brExpansionPanel',
    link: link
  };
  return directive;


  function link(scope, element, attrs, expansionPanelCtrl) {
    expansionPanelCtrl.registerFooter({
      show: show,
      hide: hide
    });


    function hide() {
      element.addClass('br-hide');
      element.removeClass('br-show');

      $animateCss(element, {
        from: {opacity: 1},
        to: {opacity: 0}
      })
      .start()
      .then(function () {
        element.removeClass('br-hide');
      });
    }


    function show() {
      element.addClass('br-show');

      $animateCss(element, {
        from: {opacity: 0},
        to: {opacity: 1}
      })
      .start()
      .then(function () {

      });
    }
  }
}
