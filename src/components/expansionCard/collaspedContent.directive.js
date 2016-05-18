angular
  .module('brMaterial')
  .directive('brCollapsedContent', collapsedContentDirective);


collapsedContentDirective.$injeect = ['$timeout', '$animateCss', '$brUtil'];
function collapsedContentDirective($timeout, $animateCss, $brUtil) {
  var directive = {
    restrict: 'E',
    transclude: true,
    template: '<div class="br-collapsed-content" ng-transclude></div>',
    require: '^brExpansionCard',
    link: link
  };
  return directive;

  function link(scope, element, attrs, ecCtrl) {
    var container = angular.element(element[0].querySelector('.br-collapsed-content'));
    scope.$expand = ecCtrl.expand;
    scope.$removeCard = ecCtrl.$removeCard;
    ecCtrl.collaspedCtrl = {
      show: show,
      hide: hide
    };

    element.on('click', function () {
      ecCtrl.expand();
    });


    function hide() {
      container.removeClass('br-show');
      container.addClass('ng-hide');
    }

    function show() {
      var fromProps = $brUtil.toCss({transform: 'translate3d(0,4px,0)'});
      fromProps.opacity = 0;
      var toProps = $brUtil.toCss({transform: 'translate3d(0,0,0)'});
      toProps.opacity = 1;

      container.removeClass('ng-hide');
      container.addClass('br-show');
      $animateCss(container, {
        from: fromProps,
        to: toProps
      })
      .start();
    }
  }
}
