angular
  .module('brMaterial')
  .directive('brExpansionPanelFooter', expansionPanelFooterDirective);


expansionPanelFooterDirective.$inject = ['$animateCss', '$window'];
function expansionPanelFooterDirective($animateCss, $window) {
  var directive = {
    restrict: 'E',
    transclude: true,
    template: '<div class="br-expansion-panel-footer-container" ng-transclude></div>',
    require: '^^brExpansionPanel',
    link: link
  };
  return directive;


  function link(scope, element, attrs, expansionPanelCtrl) {
    var isStuck = false;
    var noSticky = attrs.brNoSticky !== undefined;
    var container = angular.element(element[0].querySelector('.br-expansion-panel-footer-container'));

    expansionPanelCtrl.registerFooter({
      show: show,
      hide: hide,
      onScroll: onScroll,
      onResize: onResize,
      noSticky: noSticky
    });


    function hide() {
      var height = element[0].offsetHeight;
      element.addClass('br-hide');
      element.removeClass('br-show');
      unstick();

      $animateCss(element, {
        from: {opacity: 1, 'margin-top': '0'},
        to: {opacity: 0, 'margin-top': '-'+height+'px'}
      })
      .start()
      .then(function () {
        element.removeClass('br-hide');
      });
    }


    function show() {
      element.addClass('br-show');
      var height = element[0].offsetHeight;

      $animateCss(element, {
        from: {opacity: 0, 'margin-top': '-'+height+'px'},
        to: {opacity: 1, 'margin-top': '0'}
      })
      .start()
      .then(function () {
        onScroll();
      });
    }

    function onScroll() {
      if (noSticky === true) { return; }

      var windowBottom = $window.innerHeight;
      var footerBounds = element[0].getBoundingClientRect();
      var panelTop = element[0].parentNode.getBoundingClientRect().top + 48;
      var offset = panelTop - windowBottom + 48;

      if (footerBounds.bottom > windowBottom) {
        // set container width because element becomes postion fixed
        container.css('width', element[0].offsetWidth + 'px');

        // set element height so it does not loose its height when container is position fixed
        element.css('height', container[0].offsetHeight + 'px');
        element.addClass('br-stick');

        if (offset > 0) {
          container.css('bottom', -offset + 'px');
        } else {
          container.css('bottom', '');
        }
        isStuck = true;
      } else if (isStuck === true) {
        unstick();
      }
    }

    function onResize(width) {
      if (noSticky === true || isStuck === false) { return; }
      element.css('width', width + 'px');
    }

    function unstick() {
      isStuck = false;
      container.css('width', '');
      element.css('height', '');
      container.css('bottom', '');
      element.removeClass('br-stick');
    }
  }
}
