angular
  .module('brMaterial')
  .directive('brSideContent', brSideContentDirective);



/**
  * @name brSideContent
  * @module brSideContent
  *
  *
  * @description
  * <br-side-content> is a side panel that will auto hide on touch devices and when the screen is too smalle.
  * you can call it to open using the service
  *
  * @param {number} [br-width] - the widthed used when open and there is enough screen space
	* @param {string} [br-component-id] - the name used when calling the content from $brSideContent service
	* @param {boolean} [br-is-locked-open] - tells the side content to stay open or not. you can use $brMedia service to control this for mobile devices
  * @param {CSS} [br-side-content-right] - tells the side content stick to the right side
  * @param {CSS} [br-side-content-left] - tells the side content stick to the left side
  * @param {CSS} [br-border-right] - shows border on right
  * @param {CSS} [br-border-left] - shows border on left
  *
  * @example
  * <br-side-content class="br-side-content-right br-border-left" br-is-locked-open="$brMedia('md')" br-component-id="menuConfigSideContent" br-width="400">
  *
  */
brSideContentDirective.$inject = ['$brTheme', '$q', '$parse', '$window', '$brMedia', '$animate', '$document', '$brUtil'];
function brSideContentDirective($brTheme, $q, $parse, $window, $brMedia, $animate, $document, $brUtil) {
  var directive = {
    restrict: 'E',
    scope: {
      isOpen: '=?brIsOpen'
    },
    transclude: true,
    template:
      '<div class="br-side-content-container">'+
        '<div ng-transclude></div>'+
      '</div>',
    compile: compile,
    controller: ['$scope', '$element', '$attrs', '$brComponentRegistry', '$q', '$brBackdrop', controller]
  };
  return directive;


  function compile(tElement, tAttrs) {
    tElement.addClass('br-closed');
    tElement.attr('tabIndex', '-1');

    return function postLink(scope, element, attrs, sideContentCtrl) {
      var lastParentOverFlow;
      var triggeringElement = null;
      var promise = $q.when(true);
      var isLockedOpenParsed = $parse(attrs.brIsLockedOpen);
      var brWidth = attrs.brWidth !== undefined;
      var windowWidth;

      $brTheme(element);


      if(brWidth === true) {
        brWidth = attrs.brWidth.replace('px', '');
        angular.element($window).bind('resize', resize);
        scope.$on('$destroy', function () {
          angular.element($window).off('resize', resize);
        });

        if(brWidth < ($window.innerWidth - 23)) {
          element.css('width', brWidth + 'px');
          element.css('min-width', brWidth + 'px');
          element.css('max-width', brWidth + 'px');
        }
      }

      var isLocked = function() {
        return isLockedOpenParsed(scope.$parent, {
          $brMedia: $brMedia
        });
      };


      scope.$watch(isLocked, updateIsLocked);
      scope.$watch('isOpen', updateIsOpen);
      element.on('$destroy', sideContentCtrl.destroy);

      sideContentCtrl.$toggleOpen = toggleOpen;



      function resize () {
        if (brWidth >= ($window.innerWidth - 24)) {
          element.attr('style', '');
        } else {
          element.css('width', brWidth + 'px');
          element.css('min-width', brWidth + 'px');
          element.css('max-width', brWidth + 'px');
        }
      }


      function updateIsLocked(isLocked, oldValue){
        scope.isLockedOpen = isLocked;
        element.toggleClass('br-locked-open', !isLocked);
      }


      function updateIsOpen(isOpen) {
        var parent = element.parent();
        //var focusEl = sideContentCtrl.focusElement();

        parent[isOpen ? 'on' : 'off']('keydown', onKeyDown);
        // backdrop[isOpen ? 'on' : 'off']('click', close);

        if ( isOpen ) {
          triggeringElement = $document[0].activeElement;
        }

        disableParentScroll(isOpen);

        // TODO : make this promis triggetr on animation complete
        promise = $q.all([
            // isOpen ? $animate.enter(backdrop, parent) : $animate.leave(backdrop),
            //$animate[isOpen ? 'removeClass' : 'addClass'](element, 'br-closed')
            setTimeout(function () {
  						scope.$apply(function(){
  							$animate[isOpen ? 'removeClass' : 'addClass'](element, 'br-closed');
  						});
  					}, 0)
          ])
          .then(function() {
            // Perform focus when animations are ALL done...
            if (scope.isOpen) {
              //focusEl && focusEl.focus();
            }
          });

        return promise;
      }


      function toggleOpen(isOpen) {
        if (scope.isOpen == isOpen ) {
          return $q.when(true);

        } else {
          var deferred = $q.defer();

          // Toggle value to force an async `updateIsOpen()` to run
          scope.isOpen = isOpen;

          $brUtil.nextTick(function() {

            // When the current `updateIsOpen()` animation finishes
            promise.then(function(result) {
              if (!scope.isOpen) {
                // reset focus to originating element (if available) upon close

                setTimeout(function () {
                  if (triggeringElement) { triggeringElement.focus(); }
                  triggeringElement = null;
                }, 0);
              }

              deferred.resolve(result);
            });
          });

          return deferred.promise;
        }
      }


      function disableParentScroll(disabled) {
        var parent = element.parent();
        if ( disabled && !lastParentOverFlow ) {

          lastParentOverFlow = parent.css('overflow');
          parent.css('overflow', 'hidden');

        } else if (angular.isDefined(lastParentOverFlow)) {
          parent.css('overflow', lastParentOverFlow);
          lastParentOverFlow = undefined;
        }
      }


      function onKeyDown(ev) {
        var isEscape = (ev.keyCode === $brConstant.KEY_CODE.ESCAPE);
        return isEscape ? close(ev) : $q.when(true);
      }


      function close(ev) {
        ev.preventDefault();
        ev.stopPropagation();

        return sideContentCtrl.close();
      }
    };
  }






  function controller($scope, $element, $attrs, $brComponentRegistry, $q, $brBackdrop) {
    /* jshint validthis: true */
    var vm = this;

    vm.isOpen = function () { return !!$scope.isOpen; };
    vm.isLockedOpen = function () { return !!$scope.isLockedOpen; };
    vm.open = function () { return vm.$toggleOpen(true); };
    vm.close = function () { return vm.$toggleOpen( false ); };
    vm.toggle = function () { return vm.$toggleOpen( !$scope.isOpen ); };
    vm.$toggleOpen = function(value) { return $q.when($scope.isOpen = value); };
    vm.addBackdrop = function (clickCallback) { $brBackdrop.add($element, $scope, clickCallback); };
    vm.removeBackdrop = function () { $brBackdrop.remove(); };

    vm.focusElement = function (el) {
      if (angular.isDefined(el)) {
        return el;
      }
      return null;
    };

    vm.destroy = $brComponentRegistry.register(vm, $attrs.brComponentId);
  }
}
