angular
  .module('brMaterial')
  .factory('$brRippleService', rippleService);


var DURATION = 450;


rippleService.$inject = ['$injector'];
function rippleService ($injector) {
  var service = {
    attach: attach
  };
  return service;

  function attach (scope, element) {
    // TODO : make no ripple option work
    // if (element.controller('brNoRipple')) return angular.noop;
    return $injector.instantiate(rippleController, {
      $scope: scope,
      $element: element
    });
  }
}


rippleController.$inject = ['$scope', '$element', '$window', '$timeout', '$brUtil'];
function rippleController ($scope, $element, $window, $timeout, $brUtil) {
  /*jshint validthis:true */
  var vm = this;
  
  var mousedown = false;
  var lastRipple = null;
  var timeout = null;
  var ripples = [];
  var options = {
    center: true,
    dimBackground: true
  };

  $brUtil.valueOnUse(vm, 'container', createContainer);
  $element.addClass('br-has-ripple');

  // attach method for unit tests
  ($element.controller('brRipple') || {}).createRipple = createRipple;
  ($element.controller('brRipple') || {}).setColor = getSetColor;


  $element.on('mousedown', handleMousedown);
  $element.on('mouseup touchend', handleMouseup);
  $element.on('mouseleave', handleMouseup);
  $element.on('touchmove', handleTouchmove);



  function getSetColor (value) {
    var _color;

    // If assigning a color value, apply it to background and the ripple color
    if (angular.isDefined(value)) {
      _color = parseColor(value);
    }

    // If color lookup, use assigned, defined, or inherited
    return _color || parseColor( getRippleElement() ) || parseColor( getElementColor() );

    /**
     * Finds the color element and returns its text color for use as default ripple color
     * @returns {string}
     */
    function getElementColor () {
      var elem =  $element[0];

      return elem ? $window.getComputedStyle(elem).color : 'rgb(0,0,0)';
    }
  }


  function parseColor (color, multiplier) {
    multiplier = multiplier || 1;

    if (!color) return;
    if (color.indexOf('rgba') === 0) return color.replace(/\d?\.?\d*\s*\)\s*$/, (0.1 * multiplier).toString() + ')');
    if (color.indexOf('rgb') === 0) return rgbToRGBA(color);
    if (color.indexOf('#') === 0) return hexToRGBA(color);

    /**
     * Converts hex value to RGBA string
     * @param color {string}
     * @returns {string}
     */
    function hexToRGBA (color) {
      var hex   = color[ 0 ] === '#' ? color.substr(1) : color,
        dig   = hex.length / 3,
        red   = hex.substr(0, dig),
        green = hex.substr(dig, dig),
        blue  = hex.substr(dig * 2);
      if (dig === 1) {
        red += red;
        green += green;
        blue += blue;
      }
      return 'rgba(' + parseInt(red, 16) + ',' + parseInt(green, 16) + ',' + parseInt(blue, 16) + ',0.1)';
    }

    /**
     * Converts an RGB color to RGBA
     * @param color {string}
     * @returns {string}
     */
    function rgbToRGBA (color) {
      return color.replace(')', ', 0.1)').replace('(', 'a(');
    }

  }

  function createContainer () {
    var container = angular.element('<div class="br-ripple-container"></div>');
    $element.append(container);
    return container;
  }

  function getRippleElement () {
    return $element.attr('br-has-ripple');
  }



  function isRippleAllowed () {
    var element = $element[0];
    do {
      if (!element.tagName || element.tagName === 'BODY') break;

      if (element && angular.isFunction(element.hasAttribute)) {
        if (element.hasAttribute('disabled')) return false;
        if (getRippleElement() === 'false' || getRippleElement() === '0') return false;
      }

      element = element.parentNode;
    } while (element);
    return true;
  }


  function fadeInComplete (ripple) {
    if (lastRipple === ripple) {
      if (!timeout && !mousedown) {
        removeRipple(ripple);
      }
    } else {
      removeRipple(ripple);
    }
  }

  function fadeOutComplete (ripple) {
    ripple.remove();
    lastRipple = null;
  }

  function removeRipple (ripple) {
    var index = ripples.indexOf(ripple);
    if (index < 0) return;
    ripples.splice(ripples.indexOf(ripple), 1);
    ripple.removeClass('br-ripple-active');
    if (ripples.length === 0) vm.container.css({ backgroundColor: '' });
    // use a 2-second timeout in order to allow for the animation to finish
    // we don't actually care how long the animation takes
    $timeout(function () {
      fadeOutComplete(ripple);
    }, DURATION, false);
  }

  function clearRipples () {
    for (var i = 0; i < ripples.length; i++) {
      fadeInComplete(ripples[ i ]);
    }
  }



  function createRipple (left, top) {
    if (!isRippleAllowed()) return;

    var ripple      = angular.element('<div class="br-ripple"></div>');
    var width       = $element.prop('clientWidth');
    var height      = $element.prop('clientHeight');
    var x           = Math.max(Math.abs(width - left), left) * 2;
    var y           = Math.max(Math.abs(height - top), top) * 2;
    var size        = getSize(options.fitRipple, x, y);
    var color       = getSetColor();


    ripple.css({
      left:            left + 'px',
      top:             top + 'px',
      background:      'black',
      width:           size + 'px',
      height:          size + 'px',
      backgroundColor: rgbaToRGB(color),
      borderColor:     rgbaToRGB(color)
    });
    lastRipple = ripple;

    // we only want one timeout to be running at a time
    clearTimeout();
    timeout = $timeout(function () {
      clearTimeout();
      if (!mousedown) fadeInComplete(ripple);
    }, DURATION * 0.35, false);

    if (options.dimBackground) vm.container.css({ backgroundColor: color });
    vm.container.append(ripple);
    ripples.push(ripple);
    ripple.addClass('br-ripple-placed');

    $brUtil.nextTick(function () {
      ripple.addClass('br-ripple-scaled br-ripple-active');
      $timeout(function () {
        clearRipples();
      }, DURATION, false);
    }, false);

    function rgbaToRGB (color) {
      return color ? color.replace('rgba', 'rgb').replace(/,[^\),]+\)/, ')') : 'rgb(0,0,0)';
    }

    function getSize (fit, x, y) {
      return fit ? Math.max(x, y) : Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
    }
  }


  function clearTimeout () {
    if (timeout) {
      $timeout.cancel(timeout);
      timeout = null;
    }
  }




  // --- Mouse events ----


  function handleMousedown (event) {
    if (mousedown) { return; }

    // When jQuery is loaded, we have to get the original event
    if (event.hasOwnProperty('originalEvent')) { event = event.originalEvent; }

    mousedown = true;
    if (options.center) {
      createRipple(vm.container.prop('clientWidth') / 2, vm.container.prop('clientWidth') / 2);
    } else {

      // We need to calculate the relative coordinates if the target is a sublayer of the ripple element
      if (event.srcElement !== $element[0]) {
        var layerRect = $element[0].getBoundingClientRect();
        var layerX = event.clientX - layerRect.left;
        var layerY = event.clientY - layerRect.top;

        createRipple(layerX, layerY);
      } else {
        createRipple(event.offsetX, event.offsetY);
      }
    }
  }



  function handleMouseup () {
      autoCleanup();
  }

  function handleTouchmove () {
    autoCleanup();
  }

  function autoCleanup () {
    if ( mousedown || lastRipple ) {
      mousedown = false;
      $brUtil.nextTick( clearRipples, false);
    }
  }


}
