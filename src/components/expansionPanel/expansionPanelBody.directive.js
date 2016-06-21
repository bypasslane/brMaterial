angular
  .module('brMaterial')
  .directive('brExpansionPanelBody', expansionPanelBodyDirective);


expansionPanelBodyDirective.$inject = ['$animateCss'];
function expansionPanelBodyDirective($animateCss) {
  var directive = {
    restrict: 'E',
    require: '^^brExpansionPanel',
    link: link
  };
  return directive;


  function link(scope, element, attrs, expansionPanelCtrl) {
    expansionPanelCtrl.registerBody({
      show: show,
      hide: hide
    });


    function hide() {
      var height = element[0].scrollHeight;
      element.addClass('br-hide');
      element.removeClass('br-show');

      $animateCss(element, {
        from: {'max-height': height + 'px', opacity: 1},
        to: {'max-height': '48px', opacity: 0}
      })
      .start()
      .then(function () {
        element.removeClass('br-hide');
      });
    }


    function show() {
      element.addClass('br-show');
      element.addClass('br-overflow');

      var height = element[0].scrollHeight + 20;

      $animateCss(element, {
        from: {'max-height': '48px', opacity: 0},
        to: {'max-height': height + 'px', opacity: 1}
      })
      .start()
      .then(function () {
        element.removeClass('br-overflow');
        element.css('max-height', 'none');
      });
    }
  }
}
