angular
  .module('brMaterial')
  .directive('brDragIcon', brDragIconDirective);


/**
 * @name brDragIcon
 * @module brDragIcon
 *
 * @requires brDragOrder
 *
 *
 * @description
 * The <br-drag-icon> is an element that goes in the repeated elemtn, that will instantly initiate drag reorder on click and hold
 *
 *
 * @example
 * <div ng-repeat="item in list | orderBy:'item.ordinal'" br-drag-order="">
 *    <br-drag-icon></br-drag-icon>
 * </div>
 *
 */
brDragIconDirective.$inject = ['$brGesture'];
function brDragIconDirective($brGesture) {
  var directive = {
    restrict: 'E',
    require: '^brDragOrder',
    replace: true,
    template: '<br-icon br-color="#999" class="br-drag-icon" br-font-icon="swap_vert" br-size="32"></br-icon>',
    link: link
  };
  return directive;


  function link(scope, element, attrs, ctrl) {
    $brGesture.register(element, 'press');
    element
      .on('$br.pressdown', onPressDown);

    function onPressDown (e) {
      ctrl.triggerHold();
    }
  }
}
