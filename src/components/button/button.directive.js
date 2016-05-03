angular
  .module('brMaterial')
  .directive('brButton', brButtonDirective);


/**
 * @ngdoc directive
 * @name brButton
 *
 * @description
 * The <br-button> can be a button with txt, icons, or anything else you want
 *
 *
 * @param {css} [br-primary] - sets he buttons color to the primary color
 * @param {css} [br-warn] - sets he buttons color to the warn color
 * @param {css} [br-accent] - sets he buttons color to the accent color
 * @param {css} [br-rasied] - gives the button a backgrouns and shadow by default
 * @param {css} [br-full] - tells button to fill avalable space
 * @param {css} [br-no-shadow] - remoes box shadow
 * @param {css} [br-no-margin] - removes default margin
 * @param {css} [br-circle] - makes the button round
 * @param {css} [br-small] - can be used along side br-circle to make the button smaller. This is good for icons
 *
 *
 * @example
 * <br-button>button</br-button>
 * <br-button class="br-primary">Primary button</br-button>
 * <br-button class="br-primary br-rasied">Primary Raised button</br-button>
 * <br-button class="br-circle br-small"><br-icon br-icon-font="edit"></br-icon></br-button>
 * <br-button class="br-accent br-rasied">br-icon br-icon-font="add"></br-icon>Icon & Text button</br-button>
 *
 */

brButtonDirective.$inject = ['$brTheme', '$timeout', '$brRippleService'];
function brButtonDirective ($brTheme, $timeout, $brRippleService) {
  var directive = {
    restrict: 'E',
    replace: true,
    transclude: true,
    template: getTemplate,
		link: link
  };
  return directive;





  function isAnchor (attr) {
    return angular.isDefined(attr.href) || angular.isDefined(attr.ngHref) || angular.isDefined(attr.ngLink);
  }

  function getTemplate (element, attr) {
    if (isAnchor(attr)) {
      return '<a class="br-button" ng-transclude></a>';
    } else {
      // If buttons don't have type="button", they will submit forms automatically.
      var btnType = (typeof attr.type === 'undefined') ? 'button' : attr.type;
      return '<button class="br-button" type="' + btnType + '" ng-transclude></button>';
    }
  }


  function link (scope, element, attr) {
    $brTheme(element);
    $brRippleService.attach(scope, element);

    // For anchor elements, we have to set tabindex manually when the
    // element is disabled
    if (isAnchor(attr) && angular.isDefined(attr.ngDisabled) ) {
      scope.$watch(attr.ngDisabled, function (isDisabled) {
        element.attr('tabindex', isDisabled ? -1 : 0);
      });
    }


    // disabling click event when disabled is true
    element.on('click', function(e){
      if (attr.disabled === true) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    });

    // restrict focus styles to the keyboard
    var mouseActive = false;
    element.on('mousedown', function() {
        mouseActive = true;
        $timeout(function () {
          mouseActive = false;
        }, 100);
      })
      .on('focus', function () {
        if (mouseActive === false) {
          element.addClass('br-focused');
        }
      })
      .on('blur', function (ev) {
        element.removeClass('br-focused');
      });
  }
}
