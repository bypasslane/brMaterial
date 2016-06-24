angular
  .module('brMaterial')
  .directive('brExpansionPanelGroup', expansinPanelGroupDirective);



expansinPanelGroupDirective.$inject = [];
function expansinPanelGroupDirective() {
  var directive = {
    restrict: 'E',
    controller: ['$scope', '$attrs', '$element', '$brComponentRegistry', controller]
  };
  return directive;


  function controller($scope, $attrs, $element, $brComponentRegistry) {
    /* jshint validthis: true */
    var vm = this;

    var expandedPanel;
    var registeredPanels = {};
    var activePanels = {};
    var holdDeactivate = false;
    var multipleExpand = $attrs.brMultipleExpand !== undefined;
    var noTrailing = $attrs.brNoTrailing !== undefined;

    vm.$element = $element;
    vm.autoOpen = $attrs.brAutoOpen !== undefined;
    vm.destroy = $brComponentRegistry.register(vm, $attrs.brComponentId);
    $scope.$on('$destroy', function () {
      if (vm.destroy === 'function') { vm.destroy(); }
    });



    vm.registerPanel = registerPanel;
    vm.getRegisteredPanel = getRegisteredPanel;
    vm.removePanel  = removePanel;
    vm.removeAll = removeAll;
    vm.isPanelActive = isPanelActive;
    vm.activatePanel = activatePanel;
    vm.deactivatePanel = deactivatePanel;
    vm.panelExpanded = panelExpanded;
    vm.panelContracted = panelContracted;
    vm.postMessage = postMessage;




    function postMessage(event, value) {
      Object.keys(activePanels).forEach(function (panelId) {
        activePanels[panelId].onMessage(event, value);
      });
    }


    function panelExpanded(componentId) {
      if (expandedPanel !== undefined && multipleExpand === false) {
        activePanels[expandedPanel].contract();
      }
      expandedPanel = componentId;
      if (noTrailing === true) { removeSubPanels(componentId) }
    }


    function panelContracted(componentId) {
      expandedPanel = undefined;
    }


    function activatePanel(panelCtrl) {
      if (panelCtrl === undefined || panelCtrl.componentId === undefined) { return; }
      activePanels[panelCtrl.componentId] = panelCtrl;
    }

    function deactivatePanel(componentId) {
      if (holdDeactivate === true || componentId === undefined) { return; }
      delete activePanels[componentId];
    }

    function isPanelActive(componentId) {
      return activePanels[componentId] !== undefined;
    }


    function registerPanel(options) {
      if (registeredPanels[options.componentId] !== undefined) {
        throw Error('$brExpansionPanelGroup.registerPanel() The componentId "' + options.componentId + '" has already been registered');
      }

      registeredPanels[options.componentId] = options;
    }


    function getRegisteredPanel(componentId) {
      if (registeredPanels[componentId] === undefined) {
        throw Error('$brExpansionPanelGroup.addPanel() Cannot find Panel with component id of "' + componentId + '"');
      }

      return registeredPanels[componentId];
    }


    function removePanel(componentId) {
      if (componentId === undefined || activePanels[componentId] === undefined) { return false; }

      holdDeactivate = true;
      activePanels[componentId].element.scope().$destroy();
      activePanels[componentId].element.remove();
      activePanels[componentId].element = undefined;
      delete activePanels[componentId];
      if (expandedPanel === componentId) { expandedPanel = undefined; }
      holdDeactivate = true;
      return true;
    }


    function removeAll() {
      Object.keys(activePanels).forEach(removePanel);
    }



    function removeSubPanels(componentId) {
      var children = $element.children();
      var i = 0;
      var length = children.length;
      var isBelow = false;

      while (i < length) {
        if (isBelow === true) {
          removePanel(children[i].getAttribute('br-component-id'));
        } else if (children[i].getAttribute('br-component-id') === componentId) {
          isBelow = true;
        }

        i += 1;
      }
    }
  }
}
