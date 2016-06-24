angular
  .module('brMaterial')
  .directive('brExpansionPanel', expansionPanelDirective)
  .directive('brExpansionPanelIcon', expansionPanelIconDirective);


expansionPanelDirective.$inject = ['$brTheme', '$brUtil'];
function expansionPanelDirective($brTheme, $brUtil) {
  var directive = {
    restrict: 'E',
    require: ['brExpansionPanel', '?^^brExpansionPanelGroup'],
    scope: true,
    link: link,
    controller: ['$scope', '$element', '$attrs', '$brComponentRegistry', '$brConstant', '$brUtil', '$window', '$$rAF', controller]
  };
  return directive;



  function link(scope, element, attrs, ctrls) {
    $brTheme(element);

    var epxansionPanelCtrl = ctrls[0];
    var epxansionPanelGroupCtrl = ctrls[1];
    var componentId = attrs.brComponentId;

    element.attr('tabindex', attrs.tabindex || '0');


    if (epxansionPanelGroupCtrl) {
      epxansionPanelCtrl.epxansionPanelGroupCtrl = epxansionPanelGroupCtrl;
      // create componentId if none exists
      // this should only be needed for cards that are not registered
      if (componentId === undefined) {
        componentId = 'expansionPanelId_' + $brUtil.nextUid();
        element.attr('br-component-id', componentId);
      }

      epxansionPanelGroupCtrl.activatePanel({
        element: element,
        componentId: componentId,
        expand: epxansionPanelCtrl.expand,
        contract: epxansionPanelCtrl.contract,
        onMessage: epxansionPanelCtrl.onMessage
      });
    }

    epxansionPanelCtrl.componentId = componentId;

    $brUtil.nextTick(function () {
      if (scope.autoOpen === true) { epxansionPanelCtrl.expand(); }
    });
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
    var watchPlayer;
    var isOpen = false;
    var isDisabled = false;
    var listeners = {};
    var debouncedUpdateScroll = $$rAF.throttle(updateScroll);
    var debouncedUpdateResize = $$rAF.throttle(updateResize);

    vm.registerHeader = registerHeader;
    vm.registerBody = registerBody;
    vm.registerBodyHeader = registerBodyHeader;
    vm.registerFooter = registerFooter;
    vm.onMessage = onMessage;
    vm.on = on;
    vm.off = off;
    vm.expand = expand;
    vm.contract = contract;
    vm.$element = $element;
    vm.destroy = $brComponentRegistry.register(vm, $attrs.brComponentId);

    $scope.$panel = {
      expand: expand,
      contract: contract
    };

    $brUtil.nextTick(function () {
      watchPlayer = pauseWatchers($scope, true);
    });


    $scope.$on('$destroy', killPanel);
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


    function on(event, callback) {
      if (typeof callback !== 'function') {
        throw Error('Must pass in a callback function');
      }
      if (listeners[event] === undefined) {
        listeners[event] = [];
      }

      listeners[event].push(callback);
    }

    function off(event, callback) {
      if (listeners[event] === undefined) {
        return;
      }
      if (typeof callback === 'function') {
        listeners[event] = listeners[event].filter(function (func) {
          return func !== callback;
        });
      } else {
        listeners[event] = undefined;
      }
    }

    function onMessage(event, value) {
      if (listeners[event] !== undefined) {
        listeners[event].forEach(function (func) {
          func(value);
        });
      }
    }


    function expand() {
      if (isOpen === true || isDisabled === true) { return; }
      isOpen = true;

      if (vm.epxansionPanelGroupCtrl) {
        vm.epxansionPanelGroupCtrl.panelExpanded(vm.componentId);
      }

      watchPlayer();
      watchPlayer = undefined;

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

      if (vm.epxansionPanelGroupCtrl) {
        vm.epxansionPanelGroupCtrl.panelContracted(vm.componentId);
      }

      $element.addClass('br-close');
      $element.removeClass('br-open');

      killEvents();
      if (bodyOptions) { bodyOptions.hide(); }
      if (bodyHeaderOptions) { bodyHeaderOptions.hide(); }
      if (footerOptions) { footerOptions.hide(); }
      if (headerOptions) { headerOptions.show(); }

      watchPlayer = pauseWatchers($scope, true);
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

    function killPanel() {
      killEvents();
      listeners = undefined;

      // remove component from registry
      if (typeof vm.destroy === 'function') { vm.destroy(); }

      if (vm.epxansionPanelGroupCtrl) {
        vm.epxansionPanelGroupCtrl.deactivatePanel(vm.componentId);
      }
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


    // -- toggel watcher for performance ---
    function pauseWatchers(_scope, skip) {
      var child = _scope.$$childHead;
      var childrenPlayWatchers = [];
      var watchers;

      // Save the watchers and then remove them from scope. Unless we are skipping this parent scope.
      if (skip !== true && _scope.$$watchers && _scope.$$watchers.length !== 0) {
        watchers = _scope.$$watchers;
        _scope.$$watchers = [];
      }

      while (child) {
        childrenPlayWatchers.push(pauseWatchers(child));
        child = child.$$nextSibling;
      }


      return function playWatcher() {
        // Add back the watchers
        if (watchers) {
          _scope.$$watchers = watchers;
          watchers = undefined;
        }

        // Add back the watchers for the children
        if (childrenPlayWatchers.length !== 0) {
          childrenPlayWatchers.forEach(function (playChildWatcher) {
            playChildWatcher();
          });
        }
      };
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
