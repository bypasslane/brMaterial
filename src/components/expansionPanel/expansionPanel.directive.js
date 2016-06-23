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
    var widthKiller;
    var brContentKiller;
    var isOpen = false;
    var isDisabled = false;
    var debouncedUpdateScroll = $$rAF.throttle(updateScroll);
    var debouncedUpdateResize = $$rAF.throttle(updateResize);

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


    $scope.$on('$destroy', killEvents);
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
      initEvents();
    }

    function contract() {
      if (isOpen === false) { return; }
      isOpen = false;

      $element.addClass('br-close');
      $element.removeClass('br-open');

      killEvents();
      if (bodyOptions) { bodyOptions.hide(); }
      if (bodyHeaderOptions) { bodyHeaderOptions.hide(); }
      if (footerOptions) { footerOptions.hide(); }
      if (headerOptions) { headerOptions.show(); }
    }




    function initEvents() {
      if ((!footerOptions || footerOptions.noSticky === true) && (!bodyHeaderOptions || bodyHeaderOptions.noSticky === true)) {
        return;
      }

      // wtach for width changes
      widthKiller = $scope.$watch(function () { return $element[0].offsetWidth; }, debouncedUpdateResize, true);

      // if body has height set listen to its scroll event
      if (bodyOptions && bodyOptions.heightSet === true) { bodyOptions.$element.on('scroll', debouncedUpdateScroll); }

      // find any containing content element to watch for scroll events
      brContent = $brUtil.getClosest($element, 'BR-CONTENT');
      if (brContent) {
        angular.element(brContent).on('scroll', debouncedUpdateScroll);

        // if brContent height changes then trigger the scroll event so the expanders can readjust
        brContentKiller = $scope.$watch(function () { return brContent.scrollHeight; }, debouncedUpdateScroll, true);
      }


      angular.element($window)
        .on('scroll', debouncedUpdateScroll)
        .on('resize', debouncedUpdateScroll);
    }

    function killEvents() {
      // remove component from registry
      if (typeof vm.destroy === 'function') { vm.destroy(); }
      if (typeof widthKiller === 'function') { widthKiller(); }
      if (typeof brContentKiller === 'function') { brContentKiller(); }

      if (bodyOptions && bodyOptions.heightSet) { bodyOptions.$element.off('scroll', debouncedUpdateScroll); }
      if (brContent) {
        angular.element(brContent).off('scroll', debouncedUpdateScroll);
        brContent = undefined;
      }

      angular.element($window)
        .off('scroll', debouncedUpdateScroll)
        .off('resize', debouncedUpdateScroll);
    }


    function updateScroll(e) {
      var top;
      if (bodyOptions && bodyOptions.heightSet) { top = bodyOptions.$element[0].getBoundingClientRect().top; }
      else if (brContent) { top = brContent.getBoundingClientRect().top; }
      else { top = 0; }

      if (footerOptions && footerOptions.noSticky === false) { footerOptions.onScroll(top); }
      if (bodyHeaderOptions && bodyHeaderOptions.noSticky === false) { bodyHeaderOptions.onScroll(top); }

      $scope.$apply();
    }

    function updateResize(value) {
      if (footerOptions && footerOptions.noSticky === false) { footerOptions.onResize(value); }
      if (bodyHeaderOptions && bodyHeaderOptions.noSticky === false) { bodyHeaderOptions.onResize(value); }
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
