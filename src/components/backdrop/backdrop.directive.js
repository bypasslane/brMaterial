angular
  .module('brMaterial')
  .directive('brBackdrop', brBackdropDirective);


brBackdropDirective.$inject = ['$rootElement', '$$rAF', '$animate'];
function brBackdropDirective ($rootElement, $$rAF, $animate) {
  var directive = {
    restrict: 'E',
    link: link
  };
  return directive;


  function link (scope, element, attrs) {
    if ($animate.pin) $animate.pin(element, $rootElement);

    $$rAF(function () {
      $rootElement.append(element);
    });

    element.on('scroll touchmove wheel', function (e) {
      e.stopPropagation();
      e.preventDefault();
    });
  }
}
