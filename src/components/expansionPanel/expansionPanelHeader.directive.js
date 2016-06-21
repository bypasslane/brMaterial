angular
  .module('brMaterial')
  .directive('brExpansionPanelHeader', expansionPanelHeaderDirective);


expansionPanelHeaderDirective.$inject = ['$animateCss'];
function expansionPanelHeaderDirective($animateCss) {
  var directive = {
    restrict: 'E',
    require: '^^brExpansionPanel',
    link: link
  };
  return directive;


  function link(scope, element, attrs, expansionPanelCtrl) {
    expansionPanelCtrl.registerHeader({
      show: show,
      hide: hide
    });


    element.on('click', function () {
      expansionPanelCtrl.expand();
    });


    function hide() {
      // remove 48 for padding
      element.css('width', (element[0].offsetWidth - 48) + 'px');
      expansionPanelCtrl.$element.css('min-height', element[0].offsetHeight + 'px');
      $animateCss(element, {
        addClass: 'br-absolute br-hide',
        from: {opacity: 1},
        to: {opacity: 0}
      })
      .start()
      .then(function () {
        element.removeClass('br-hide');
        element.css('width', '');
      });
    }


    function show() {
      // remove 48 for padding
      element.css('width', (element[0].parentNode.offsetWidth - 48) + 'px');
      $animateCss(element, {
        addClass: 'br-show',
        from: {opacity: 0},
        to: {opacity: 1}
      })
      .start()
      .then(function () {
        element.removeClass('br-absolute br-show');
        element.css('width', '');
        expansionPanelCtrl.$element.css('min-height', '');
      });
    }
  }
}
