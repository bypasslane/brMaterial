angular
  .module('brMaterial')
  .directive('brExpansionPanel', expansionPanelDirective)
  .directive('brExpansionPanelIcon', expansionPanelIconDirective);


expansionPanelDirective.$inject = ['$brTheme'];
function expansionPanelDirective($brTheme) {
  var directive = {
    restrict: 'E',
    require: ['brExpansionPanel'],
    scope: true,
    link: link,
    controller: ['$scope', '$element', '$attrs', '$brComponentRegistry', '$brConstant', '$brUtil', '$window', '$$rAF', controller]
  };
  return directive;



  function link(scope, element, attrs) {
    $brTheme(element);

    element.attr('tabindex', attrs.tabindex || '0');
  }


  function controller($scope, $element, $attrs, $brComponentRegistry, $brConstant, $brUtil, $window, $$rAF) {
    /* jshint validthis: true */
    var vm = this;

    var brContent;
    var headerOptions;
    var bodyOptions;
    var bodyHeaderOptions;
    var footerOptions;
    var isOpen = false;
    var isDisabled = false;
    var debouncedUpdateAll = $$rAF.throttle(updateAll);


    vm.registerHeader = registerHeader;
    vm.registerBody = registerBody;
    vm.registerBodyHeader = registerBodyHeader;
    vm.registerFooter = registerFooter;
    vm.expand = expand;
    vm.contract = contract;
    vm.$element = $element;
    vm.destroy = $brComponentRegistry.register(vm, $attrs.brComponentId);

    $scope.$card = {
      expand: expand,
      contract: contract
    };


    $scope.$on('$destroy', killScrollEvents);

    $attrs.$observe('disabled', function(disabled) {
      isDisabled = disabled;
      if (disabled === true) {
        $element.attr('tabindex', '-1');
      } else {
        $element.attr('tabindex', '0');
      }
    });

    $element
      .on('focus', function (ev) {
        $element.on('keydown', handleKeypress);
      })
      .on('blur', function (ev) {
        $element.off('keydown', handleKeypress);
      });

    function handleKeypress(ev) {
      var keyCodes = $brConstant.KEY_CODE;

      switch (ev.keyCode) {
        case keyCodes.ENTER:
          expand();
          break;
        case keyCodes.ESCAPE:
          contract();
          break;
      }
    }


    function expand() {
      if (isOpen === true || isDisabled === true) { return; }
      isOpen = true;
      $element.removeClass('br-close');
      $element.addClass('br-open');

      if (bodyOptions) { bodyOptions.show(); }
      if (bodyHeaderOptions) { bodyHeaderOptions.show(); }
      if (footerOptions) { footerOptions.show(); }
      if (headerOptions) { headerOptions.hide(); }
      initScrollEvents();
    }

    function contract() {
      if (isOpen === false) { return; }
      isOpen = false;
      $element.addClass('br-close');
      $element.removeClass('br-open');

      killScrollEvents();
      if (bodyOptions) { bodyOptions.hide(); }
      if (bodyHeaderOptions) { bodyHeaderOptions.hide(); }
      if (footerOptions) { footerOptions.hide(); }
      if (headerOptions) { headerOptions.show(); }
    }




    function initScrollEvents() {
      if ((!footerOptions || footerOptions.noSticky === true) && (!bodyHeaderOptions || bodyHeaderOptions.noSticky === true)) {
        return;
      }
      // find any containing content element to watch for scroll events
      brContent = $brUtil.getClosest($element, 'BR-CONTENT');
      if (brContent) { angular.element(brContent).on('scroll', debouncedUpdateAll); }

      if (bodyOptions) {
        bodyOptions.$element.on('scroll', debouncedUpdateAll);
      }

      angular.element($window)
        .on('scroll', debouncedUpdateAll)
        .on('resize', debouncedUpdateAll);
    }

    function killScrollEvents() {
      // remove component from registry
      if (typeof vm.destroy === 'function') { vm.destroy(); }

      if (brContent) {
        angular.element(brContent).off('scroll', debouncedUpdateAll);
        brContent = undefined;
      }

      if (bodyOptions) {
        bodyOptions.$element.of('scroll', debouncedUpdateAll);
      }

      angular.element($window)
        .off('scroll', debouncedUpdateAll)
        .off('resize', debouncedUpdateAll);
    }


    function updateAll(e) {
      if (footerOptions && footerOptions.noSticky === false) { footerOptions.onScroll(e); }
      if (bodyHeaderOptions && bodyHeaderOptions.noSticky === false) { bodyHeaderOptions.onScroll(e); }

      $scope.$apply();
    }




    // --- registers ---

    function registerHeader(options) {
      headerOptions = options;
    }

    function registerBody(options) {
      bodyOptions = options;
    }

    function registerBodyHeader(options) {
      bodyHeaderOptions = options;
    }

    function registerFooter(options) {
      footerOptions = options;
    }
  }
}





function expansionPanelIconDirective() {
  var directive = {
    restrict: 'E',
    template: '<div class="br-expansion-panel-icon-container"><div class="br-expansion-panel-icon"></div></div>',
    replace: true
  };
  return directive;
}
