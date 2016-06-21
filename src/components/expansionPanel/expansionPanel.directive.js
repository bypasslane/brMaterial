angular
  .module('brMaterial')
  .directive('brExpansionPanel', expansionPanelDirective);


expansionPanelDirective.$inject = ['$brTheme'];
function expansionPanelDirective($brTheme) {
  var directive = {
    restrict: 'E',
    require: ['brExpansionPanel'],
    scope: true,
    link: link,
    controller: ['$scope', '$element', '$attrs', '$brComponentRegistry', controller]
  };
  return directive;



  function link(scope, element, attrs) {
    $brTheme(element);
  }


  function controller($scope, $element, $attrs, $brComponentRegistry) {
    /* jshint validthis: true */
    var vm = this;

    var headerOptions;
    var bodyOptions;
    var footerOptions;

    vm.registerHeader = registerHeader;
    vm.registerBody = registerBody;
    vm.registerFooter = registerFooter;
    vm.expand = expand;
    vm.contract = contract;
    vm.$element = $element;

    $scope.$card = {
      expand: expand,
      contract: contract
    };


    function expand() {
      if (bodyOptions) { bodyOptions.show(); }
      if (footerOptions) { footerOptions.show(); }
      if (headerOptions) { headerOptions.hide(); }
    }

    function contract() {
      if (bodyOptions) { bodyOptions.hide(); }
      if (footerOptions) { footerOptions.hide(); }
      if (headerOptions) { headerOptions.show(); }
    }




    // --- registers ---

    function registerHeader(options) {
      headerOptions = options;
    }

    function registerBody(options) {
      bodyOptions = options;
    }

    function registerFooter(options) {
      footerOptions = options;
    }
  }
}
