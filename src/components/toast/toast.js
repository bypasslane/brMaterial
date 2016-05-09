angular
  .module('brMaterial')
  .directive('brToast', toastDirective)
  .factory('$brToast', toastService);


var DEFAULT_DELAY = '1400';

/**
 * @name $brToast
 * @module $brToast
 *
 *
 * @description
 * add toast notification
 *
 * @example
 * <br-menu br-position-mode="right target">
 *   <br-button ng-click="$brOpenMenu($event)" class="br-no-margin br-circle br-small"><br-icon br-font-icon="more_vert"></br-icon></br-button>
 *   <br-menu-content>
 *     <br-menu-item>
 *       <br-button ng-click=""><br-icon br-font-icon="edit" br-size="20"></br-icon>Change Image</br-button>
 *     </br-menu-item>
 *     <br-menu-item>
 *       <br-button ng-click=""><br-icon br-font-icon="add" br-size="20"></br-icon>Upload Image</br-button>
 *     </br-menu-item>
 *   </br-menu-content>
 * </br-menu>
 *
 */
toastService.$inject = ['$animateCss', '$compile', '$rootScope', '$document', '$brUtil', '$timeout'];
function toastService($animateCss, $compile, $rootScope, $document, $brUtil, $timeout) {
  var body = $document.find('body').eq(0);
  var isToast = false;
  var queue = [];

  var service = {
    add: add
  };
  return service;

  function add(options) {
    queue.push(options);
    nextToast();
  }

  function nextToast() {
    if (isToast === true) { return; }
    if (queue.length > 0) { showToast(queue.shift()); }
  }



  function showToast(options) {
    isToast = true;
    var template = '<br-toast class="hide br-alert">'+
      '<div class="br-toast-message">' + options.message + '</div>'+
      '<div class="br-toast-close" ng-click="remove()"></div>'+
    '</br-toast>';


    var scope = $rootScope.$new();
    scope.remove = remove;

    var toastElement = $compile(template)(scope);
    body.append(toastElement);

    if (options.warn === true) { toastElement.addClass('br-warn'); }
    if (options.primary === true) { toastElement.addClass('br-primary'); }
    if (options.accent === true) { toastElement.addClass('br-accent'); }

    // set one of for corner positions
    var position = getPosition(options);
    if (position.top !== undefined) {
      toastElement.css('top', position.top);
      toastElement.css('bottom', position.bottom);
    }
    if (position.left !== undefined) {
      toastElement.css('left', position.left);
      toastElement.css('right', position.right);
    }

    $animateCss(toastElement, {
      addClass: 'br-active',
      from: $brUtil.toCss(position),
      to: $brUtil.toCss({transform: ''})
    })
    .start()
    .then(function () {
      $timeout(remove, options.delay || DEFAULT_DELAY);
    });



    function remove() {
      if (scope === undefined) { return; }

      // toastElement.removeClass('br-active');
      $animateCss(toastElement, {
        addClass: 'br-leave',
        from: $brUtil.toCss({transform: ''}),
        to: $brUtil.toCss(position)
      })
      .start()
      .then(function () {
        toastElement.remove();
        scope = undefined;
        isToast = false
        nextToast();
      });
    }
  }


  function getPosition(options) {
    var attachment = (options.positionMode || 'bottom left').split(' ');
    var position = {};
    var transformOrigin = 'top ';

    switch (attachment[1]) {
      case 'top':
        position.transform = 'translateY(-100px)';
        position.top = '8px';
        position.bottom = 'initial';
        break;
      case 'bottom':
        position.transform = 'translateY(100px)';
        break;
      default:
        position.transform = 'translateY(100px)';
    }


    switch (attachment[0]) {
      case 'left':
        transformOrigin += 'left';
        break;
      case 'right':
        position.right = '8px';
        position.left = 'initial';
        transformOrigin += 'right';
        break;
      default:
        transformOrigin += 'left';
    }

    position.transformOrigin = transformOrigin;
    return position;
  }
}






toastDirective.$inject = ['$brTheme'];
function toastDirective($brTheme) {
  var directive = {
    restrict: 'E',
    template: '',
    link: link
  };
  return directive;


  function link(scope, element, attr) {
    $brTheme(element);
  }
}
