angular
  .module('brMaterial')
  .directive('brExpansionPanelBodyHeader', expansionPanelBodyHeaderDirective);


expansionPanelBodyHeaderDirective.$inject = ['$animateCss', '$window', '$timeout'];
function expansionPanelBodyHeaderDirective($animateCss, $window, $timeout) {
  var directive = {
    restrict: 'E',
    transclude: true,
    template: '<div class="br-expansion-panel-body-header-container" ng-transclude></div>',
    require: '^^brExpansionPanel',
    link: link
  };
  return directive;


  function link(scope, element, attrs, expansionPanelCtrl) {
    var isStuck = false;
    var noSticky = attrs.brNoSticky !== undefined;
    var container = angular.element(element[0].querySelector('.br-expansion-panel-body-header-container'));

    expansionPanelCtrl.registerBodyHeader({
      show: show,
      hide: hide,
      onScroll: onScroll,
      onResize: onResize,
      noSticky: noSticky
    });


    function hide() {
      unstick();
      element.removeClass('br-no-stick');
    }


    function show() {
      $timeout(function () {
        onScroll();
      }, 120);
    }


    function onScroll(top) {
      if (noSticky === true) { return; }

      var bounds = element[0].getBoundingClientRect();
      if (bounds.top < top) {
        // set container width because element becomes postion fixed
        container.css('width', element[0].offsetWidth + 'px');
        container.css('top', top + 'px');

        // set element height so it does not loose its height when container is position fixed
        element.css('height', container[0].offsetHeight + 'px');
        element.removeClass('br-no-stick');
        element.addClass('br-stick');
        isStuck = true;
      } else if (isStuck === true) {
        unstick();
      }
    }


    function onResize(width) {
      if (noSticky === true || isStuck === false) { return; }
      container.css('width', width + 'px');
    }


    function unstick() {
      isStuck = false;
      container.css('width', '');
      element.css('height', '');
      element.css('top', '');
      element.removeClass('br-stick');
      element.addClass('br-no-stick');
    }
  }
}
