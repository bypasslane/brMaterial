angular
  .module('brMaterial')
  .directive('brExpansionCard', expansionCardDirective);


expansionCardDirective.$inject = ['$timeout', '$parse', '$brUtil'];
function expansionCardDirective($timeout, $parse, $brUtil) {
  var directive = {
    restrict: 'E',
    require: ['brExpansionCard', '?^brExpansionCardManager'],
    scope: {},
    link: link,
    controller: ['$scope', '$element', '$attrs', '$brComponentRegistry', controller]
  };
  return directive;


  function link(scope, element, attrs, ctrl) {
    var expandGetter;
    var cardController = ctrl[0];
    var mangerController = ctrl[1];
    var id = $brUtil.nextUid();
    cardController.id = id;

    element.attr('br-card-id', id);

    scope.$removeCard = ctrl.$removeCard;

    if (mangerController) {
      cardController.mangerController = mangerController;
      // rin on next tick so we can see if card was expanded
      $timeout(function () {
        mangerController.addCard(id, cardController.isExpanded, cardController.toggle, element);
      }, 0);
    }

    if (attrs.brExpand !== undefined) {
      expandGetter = $parse(attrs.brExpand);
      cardController.toggle(expandGetter(scope));
      attrs.$observe('br-expand', function () {
        cardController.toggle(expandGetter(scope));
      });
    }

    scope.$on('$destroy', function () {
      cardController.destroy();
    });

    cardController.setMinHeight();
  }

  function controller($scope, $element, $attrs, $brComponentRegistry) {
    /* jshint validthis: true */
    var vm = this;

    vm.isExpanded = false;
    vm.expand = expand;
    vm.collapse = collapse;
    vm.toggle = toggle;
    vm.setMinHeight = setMinHeight;
    vm.$removeCard = removeCard;

    vm.destroy = $brComponentRegistry.register(vm, $attrs.brComponentId);

    vm.expandedCtrl = undefined;
    vm.collaspedCtrl = undefined;

    function expand() {
      vm.isExpanded = true;
      if (vm.mangerController) {
        vm.mangerController.expandCard(vm.id);
      }
      vm.expandedCtrl.show();
      vm.collaspedCtrl.hide();

      // TODO remove if no inner animation is wanted
      // $element.removeClass('br-collasped');
      // $timeout(function () {
      //   $element.addClass('br-expanded');
      // }, 100);
    }

    function collapse() {
      vm.isExpanded = false;
      vm.expandedCtrl.hide();
      vm.collaspedCtrl.show();
      setMinHeight();

      // TODO remove if no inner animation is wanted
      // $element.removeClass('br-expanded');
      // $timeout(function () {
      //   $element.addClass('br-collasped');
      // }, 100);
    }

    function toggle(value) {
      if (value === true) {
        expand();
      } else {
        collapse();
      }
    }


    function removeCard() {
      if (vm.mangerController) {
        vm.mangerController.removeCard(vm.id);
        return;
      }

      $scope.$broadcast('$removeCard');
      $scope.$destroy();
      $element.remove();
    }



    function setMinHeight() {
      // add 1px for spacing
      $element.css('min-height', $element[0].querySelector('.br-collapsed-content').offsetHeight + 1 + 'px');
    }
  }
}
