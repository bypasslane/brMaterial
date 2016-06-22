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
    var bodyHeight = attrs.brHeight || attrs.height;
    if (bodyHeight !== undefined) {
      bodyHeight = bodyHeight.replace('px', '');
    }

    expansionPanelCtrl.registerBody({
      show: show,
      hide: hide,
      heightSet: bodyHeight !== undefined,
      $element: element
    });


    function hide() {
      var height = bodyHeight ? bodyHeight : element[0].scrollHeight;
      element.addClass('br-hide');
      element.removeClass('br-show');
      element.removeClass('br-scroll-y');

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

      var height = bodyHeight ? bodyHeight : element[0].scrollHeight + 20;

      $animateCss(element, {
        from: {'max-height': '48px', opacity: 0},
        to: {'max-height': height + 'px', opacity: 1}
      })
      .start()
      .then(function () {
        if (bodyHeight !== undefined) {
          element.addClass('br-scroll-y');
        } else {
          element.css('max-height', 'none');
        }
        element.removeClass('br-overflow');
      });
    }
  }
}
