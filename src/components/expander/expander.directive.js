angular
  .module('brMaterial')
  .directive('brExpander', expanderDirective)
  .directive('brExpanderHeader', expanderHeaderDirective)
  .directive('brExpanderContent', expanderContentDirective);




/**
  * @name brExpander
  * @module brExpander
  *
  *
  * @description
  * The <br-expander> is a container that opens and closes
  *
  *
  * @param {boolean} [br-width] - set width
  * @param {boolean} [br-height] - set height value. this will set scrolling in y
  * @param {boolean} [br-open] - bound value for opening and closing
  *
  *
  * @example
  *    <br-expander br-open="isOpen">
  *      <br-expander-header>Title</br-expander-header>
  *
  *      <br-expander-content>
  *      </br-expander-content>
  *    </br-expander>
  *
  */
expanderDirective.$inject = ['$brTheme', '$parse'];
function expanderDirective ($brTheme, $parse) {
  var directive = {
    restrict: 'E',
    require: 'brExpander',
    compile: compile,
    controller: ['$element', '$attrs', '$brComponentRegistry', controller]
  };
  return directive;


  function compile(tElement, tAttrs) {
    tElement.addClass('br-expander');

    var width = tAttrs.brWidth || tAttrs.width;
    if (width !== undefined) {
      tElement.css('width', width.replace('px', '') + 'px');
    }

    if (tAttrs.brHide === undefined) {
      angular.element(tElement[0].querySelector('.br-expander-hide')).attr('ng-if', '$brOpen');
    }

    return postLink;
  }

  function postLink(scope, element, attr, ctrl) {
    $brTheme(element);

    // varefy the correct child elements exist
    var headerElement = element[0].querySelector('br-expander-header');
    var contentElement = element[0].querySelector('br-expander-content');
    if (contentElement === null) {
      throw new Error('<br-expander> : Should contain <br-expander-content>');
    }

    if (attr.brOpen !== undefined) {
      var openGetter = $parse(attr.brOpen);
      scope.$watch(function () { return openGetter(scope); }, function (open) {
        if (open === true) {
          ctrl.open();
        } else {
          ctrl.close();
        }
      });
    }
  }


  function controller($element, $attrs, $brComponentRegistry) {
    /* jshint validthis: true */
    var vm = this;

    var _isOpen = false;

    vm.height = $attrs.brWidth || $attrs.width;
    vm.headerHook = headerHook;
    vm.contentHook = contentHook;

    vm.open = open;
    vm.close = close;
    vm.toggle = headerHook;
    vm.isOpen = isOpen;


    var destroy = $brComponentRegistry.register(vm, $attrs.brComponentId);
    $element.on('$destroy', destroy);

    function headerHook() {
      _isOpen = !_isOpen;
      setState();
    }

    function contentHook(func) {
      if (typeof func !== 'function') { return; }
      vm.contentHook = func;
    }

    function open() {
      _isOpen = true;
      setState();
    }

    function close() {
      _isOpen = false;
      setState();
    }

    function isOpen() {
      return _isOpen;
    }

    function setState() {
      $element.toggleClass('br-open', _isOpen);
      vm.contentHook(_isOpen);
    }
  }
}





function expanderHeaderDirective() {
  var directive = {
    restrict: 'E',
    require: '^?brExpander',
    link: link
  };
  return directive;


  function link (scope, element, attr, ctrl) {
    element.append(angular.element('<div class="br-expander-icon-container"><div class="br-expander-icon"></div></div>'));
    element.on('click', function () {
      scope.$apply(function () {
        ctrl.headerHook();
      });
    });
  }
}




expanderContentDirective.$inject = ['$timeout'];
function expanderContentDirective($timeout) {
  var directive = {
    restrict: 'E',
    require: '^?brExpander',
    template:
      '<div class="br-expander-hide" ng-transclude>'+
      '</div>',
    transclude: true,
    link: link
  };
  return directive;


  function link (scope, element, attr, ctrl) {
    var killWatch;
    var height = ctrl.height === undefined ? undefined : ctrl.height.replace('px', '') + 'px';

    element.css('height', '0');


    ctrl.contentHook(function (open) {
      scope.$brOpen = open;

      $timeout(function () {
        if (open === true) {
          expandContent();
        } else {
          contractContent();
        }
      }, 0);
    });



    function expandContent() {
      if (height !== undefined) {
        element.css('height', height);
      } else {
        setHeight();
      }
    }


    function setHeight() {
      element.css('height', element[0].scrollHeight + 'px');
    }


    function contractContent() {
      if (typeof killWatch === 'function') { killWatch(); }
      element.css('height', '0');
    }
  }
}
