angular
  .module('brMaterial')
  .directive('brExpander', expanderDirective)
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
expanderDirective.$inject = ['$brTheme', '$$rAF'];
function expanderDirective ($brTheme, $$rAF) {
  var directive = {
    restrict: 'E',
    require: 'brExpander',
    scope: {
      brOpen: '='
    },
    link: link,
    controller: ['$scope', controller]
  };
  return directive;


  function controller ($scope) {
    /* jshint validthis: true */
    var vm = this;

    vm.hookFunc = undefined;

    vm.hook = hook;
    vm.toggle = toggle;


    function hook (func) {
      vm.hookFunc = func;
      vm.hookFunc($scope.brOpen);
    }

    function toggle (isOpen) {
      if (typeof vm.hookFunc === 'function') {
        vm.hookFunc(isOpen);
      }
    }
  }

  function link (scope, element, attr, ctrl) {
    var isOpen = false;

    $brTheme(element);
    element.addClass('br-expander');

    var headerElement = element[0].querySelector('br-expander-header') || undefined;
    var contentElement = element[0].querySelector('br-expander-content') || undefined;

    if (headerElement === undefined || contentElement === undefined) {
      throw new Error('<br-expander> : Missing valid HTML');
    }

    var width = attr.brWidth || attr.width || undefined;
    var height = attr.brHeight || attr.height || undefined;
    if (width !== undefined) {
      element.css('width', width.replace('px', '') + 'px');
    }

    headerElement = angular.element(headerElement);
    headerElement.prepend(angular.element('<div class="br-expander-icon"></div>'));
    headerElement.addClass('br-expander-header');

    contentElement = angular.element(contentElement);
    contentElement.addClass('br-expander-content');
    contentElement.css('height', '0');
    if (height === undefined) {
      contentElement.css('overflow', 'hidden');
    }


    if (angular.isDefined(attr.brOpen)) {
      scope.$watch('brOpen', function (data) {
        toggle(data);
      });
    }


    headerElement.on('click', eventToggle);
    scope.$on('$destroy', function () {
      headerElement.off('click', eventToggle);
    });


    scope.toggle = toggle;



    function eventToggle () {
      scope.$apply(function () {
        toggle();
      });
    }

    function toggle (_isOpen) {
      if (_isOpen === undefined) {
        _isOpen = scope.brOpen || isOpen;
      }

      if (_isOpen === false) {
        isOpen = true;
        ctrl.toggle(true);
        element.addClass('br-open');
        expandContent();
      } else {
        isOpen = false;
        element.removeClass('br-open');
        contractContent();
      }
    }


    function expandContent () {
      if (height !== undefined) {
        contentElement.css('height', height.replace('px', '') + 'px');
      } else {
        setHeight();
      }
    }

    var killWatch;

    function setHeight () {
      contentElement.css('height', contentElement[0].scrollHeight + 'px');

      killWatch = scope.$watch(function () { return contentElement[0].scrollHeight; }, function () {
        if (contentElement.css('height') !== contentElement[0].scrollHeight + 'px') {
          contentElement.css('height', contentElement[0].scrollHeight + 'px');
        }
      });
    }

    function contractContent () {
      if (typeof killWatch === 'function') { killWatch(); }

      contentElement.css('height', '0');
      ctrl.toggle(false);
    }
  }
}




function expanderContentDirective () {
  var directive = {
    restrict: 'E',
    require: '^?brExpander',
    template:
      '<div ng-if="$brOpen" ng-transclude>'+
      '</div>',
    transclude: true,
    link: link
  };
  return directive;


  function link (scope, element, attr, ctrl) {
    scope.$brOpen = false;

    ctrl.hook(function (open) {
      scope.$brOpen = open;
    });
  }
}
