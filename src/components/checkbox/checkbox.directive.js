angular
  .module('brMaterial')
  .directive('brCheckbox', brCheckboxDirective);


/**
  * @name brCheckbox
  * @module brCheckbox
  *
  *
  * @description
  * The <br-checkbox> standard checkbox
  *
  *
  * @param {model} [ng-model]
  *
  * @example
  * <br-checkbox ng-model="switch1">
	*		Switch 1: {{ switch1 }}
	*	</br-checkbox>
  *
  */
brCheckboxDirective.$inject = ['$timeout', 'inputDirective', '$brTheme', '$brUtil', '$brGesture', '$brConstant'];
function brCheckboxDirective ($timeout, inputDirective, $brTheme, $brUtil, $brGesture, $brConstant) {
  inputDirective = inputDirective[0];

  var directive = {
		restrict: 'E',
		transclude: true,
		require: '?ngModel',
		template:
			'<div class="br-container">' +
				'<div class="br-icon"></div>' +
			'</div>' +
			'<div ng-transclude class="br-label"></div>',
		compile: compile
	};

	return directive;


  function compile(tElement, tAttrs) {
    tAttrs.type = 'checkbox';
		tAttrs.tabIndex = tAttrs.tabindex || '0';
		tElement.attr('role', tAttrs.type);

    return function link (scope, element, attr, ngModelCtrl) {
      ngModelCtrl = ngModelCtrl || $brUtil.fakeNgModel();
			$brTheme(element);

      // if using ng-checked, trigger ngModel on change
      if (attr.ngChecked) {
				scope.$watch(
					scope.$eval.bind(scope, attr.ngChecked),
					ngModelCtrl.$setViewValue.bind(ngModelCtrl)
				);
			}

      scope.$watch(attr.ngDisabled, function(value) {
        if (value === true) {
          element.attr('tabindex', '-1');
        } else {
          element.attr('tabindex', attr.tabindex);
        }
      });

      inputDirective.link.pre(scope, {
				on: angular.noop,
				0: {}
			}, attr, [ngModelCtrl]);

			ngModelCtrl.$render = render;


      $brGesture.register(element, 'press');
			element
				.on('$br.pressup', onUp)
				.on('keypress', keypressHandler)
				.on('focus', function() {
					element.addClass('br-focused');
				})
				.on('blur', function() {
					element.removeClass('br-focused');
				});




      function render () {
				if(ngModelCtrl.$viewValue) {
					element.addClass('br-checked');
				} else {
					element.removeClass('br-checked');
				}
			}



      function onUp (e) {
				if (attr.disabled === true || attr.readonly === true) return;

				listener(e);
				element[0].blur();
			}

			function keypressHandler (ev) {
				if (attr.disabled === true || attr.readonly === true) return;

        var keyCode = ev.which || ev.keyCode;
        if (keyCode === $brConstant.KEY_CODE.SPACE || keyCode === $brConstant.KEY_CODE.ENTER) {
          ev.preventDefault();
          if (!element.hasClass('br-focused')) { element.addClass('br-focused'); }
          listener(ev);
        }
      }

      function listener (ev) {
				ev.stopPropagation();

        scope.$apply(function () {
          var viewValue = attr.ngChecked ? attr.checked : !ngModelCtrl.$viewValue;
          ngModelCtrl.$setViewValue(viewValue, ev && ev.type);
          ngModelCtrl.$render();
        });
      }
    };
  }
}
