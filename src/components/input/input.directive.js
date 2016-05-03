angular.module('brMaterial')
	.directive('brInput', brInputDirective)
	.directive('label', labelDirective)
	.directive('input', inputTextareaDirective)
	.directive('textarea', inputTextareaDirective)
	.directive('placeholder', placeholderDirective)
	.directive('brX', xDirective);



/**
 * @name brInput
 * @module brInput
 *
 *
 * @description
 * The <br-input> container that holds the input, label, and error messages
 *
 *
 * @example
 * <br-input>
 * 	<label>Input Label</label>
 * 	<input ng-model="theModel" placeholder="The Placeholder" name="thInputName" required></input>
 * 	<div ng-messages="theFormName.thInputName.$error">
 *	 <div ng-message="required">This is required</div>
 * 	</div>
 * </br-input>
 *
 */
brInputDirective.$inject = ['$brTheme'];
function brInputDirective ($brTheme) {
  var directive = {
    restrict: 'E',
		link: link,
		controller: ['$scope', '$element', controller]
  };
  return directive;


  function link (scope, element, attr) {
		$brTheme(element);
	}

  function controller ($scope, $element) {
    /*jshint validthis: true */
		var vm = this;

		vm.isDate = function () {
			$element.addClass('br-input-is-date');
		};

		vm.setFocused = function (isFocused) {
			$element.toggleClass('br-input-focused', !!isFocused);
		};

		vm.setHasValue = function (hasValue) {
			$element.toggleClass('br-input-has-value', !!hasValue);
		};

		vm.setInvalid = function (isInvalid) {
			$element.toggleClass('br-input-invalid', !!isInvalid);
		};

		vm.clearValueHook = function (func) {
			vm.clearValue = func;
		};

		$scope.$watch(function () {
			return vm.label && vm.input;
		}, function(hasLabelAndInput) {
			if(hasLabelAndInput && !vm.label.attr('for')) {
				vm.label.attr('for', vm.input.attr('id'));
			}
		});
	}
}








/**
 * @name label
 * @module label
 *
 * @required brInput
 *
 * @description
 * The <label> element sits inside of the <br-input> container. this will shrink or grow depending on if there is input value
 *
 *
 * @example
 * <br-input>
 * 	<label>Input Label</label>
 * 	<input ng-model="theModel" placeholder="The Placeholder" name="thInputName" required></input>
 * 	<div ng-messages="theFormName.thInputName.$error">
 *	 <div ng-message="required">This is required</div>
 * 	</ng-messges>
 * </br-input>
 *
 */

function labelDirective () {
	var directive = {
		restrict: 'E',
		require: '^?brInput',
		link: link
	};

	return directive;


	function link(scope, element, attrs, containerCtrl){
		if (!containerCtrl) return;

		containerCtrl.label = element;

		scope.$on('$destroy', function() {
			containerCtrl.label = null;
		});
	}
}





inputTextareaDirective.$inject = ['$brUtil', '$window', '$$rAF'];
function inputTextareaDirective ($brUtil, $window, $$rAF) {
	var directive = {
		restrict: 'E',
		require: ['^?brInput', '?ngModel'],
		link: link
	};

	return directive;


	function link (scope, element, attr, ctrls) {
		var containerCtrl = ctrls[0];
		var ngModelCtrl = ctrls[1] || $brUtil.fakeNgModel();
		var isReadonly = angular.isDefined(attr.readonly);

		if ( !containerCtrl ) return;
		containerCtrl.input = element;

		containerCtrl.clearValueHook(function () {
			ngModelCtrl.$setViewValue('');
			ngModelCtrl.$render();
		});

		if (angular.isDefined(attr.type) && (attr.type === 'date' || attr.type === 'datetime' || attr.type === 'datetime-local') ) {
			containerCtrl.isDate();
		}

    var errorsSpacer = angular.element('<div class="br-errors-spacer">');
    element.after(errorsSpacer);

		element.addClass('br-input');
		if (!element.attr('id')) {
			element.attr('id', 'input_' + $brUtil.nextUid());
		}

		if (element[0].tagName.toLowerCase() === 'textarea') {
			setupTextarea();
		}

		function ngModelPipelineCheckValue (arg) {
			containerCtrl.setHasValue(!ngModelCtrl.$isEmpty(arg));
			return arg;
		}

		function inputCheckValue () {
			containerCtrl.setHasValue(element.val().length > 0 || (element[0].validity || {}).badInput);
		}

		var isErrorGetter = containerCtrl.isErrorGetter || function() {
			return ngModelCtrl.$invalid && ngModelCtrl.$touched;
		};
		scope.$watch(isErrorGetter, containerCtrl.setInvalid);

		ngModelCtrl.$parsers.push(ngModelPipelineCheckValue);
		ngModelCtrl.$formatters.push(ngModelPipelineCheckValue);

		element.on('input', inputCheckValue);

		if (!isReadonly) {
			element
				.on('focus', function (ev) {
					containerCtrl.setFocused(true);
				})
				.on('blur', function (ev) {
					containerCtrl.setFocused(false);
					inputCheckValue();
				});
    }


		scope.$on('$destroy', function () {
			containerCtrl.setFocused(false);
			containerCtrl.setHasValue(false);
			containerCtrl.input = null;
		});



		function setupTextarea () {
			var node = element[0];
			var onChangeTextarea = $brUtil.debounce(growTextarea, 200);
			var scrollThrottle = $$rAF.throttle(onScroll);

			function pipelineListener (value) {
				onChangeTextarea();
				return value;
			}

			if(ngModelCtrl) {
				ngModelCtrl.$formatters.push(pipelineListener);
				ngModelCtrl.$viewChangeListeners.push(pipelineListener);
			} else {
				onChangeTextarea();
			}
			element
				.on('keydown input', onChangeTextarea)
				.on('scroll', scrollThrottle);

			angular.element($window)
				.on('resize', onChangeTextarea);

			scope.$on('$destroy', function() {
				angular.element($window).off('resize', onChangeTextarea);
			});

			function growTextarea () {
				node.style.height = "auto";
				var line = node.scrollHeight - node.offsetHeight;
				node.scrollTop = 0;
				var height = node.offsetHeight + (line > 0 ? line : 0);
				node.style.height = height + 'px';
			}

			function onScroll (e) {
				node.scrollTop = 0;
				// for smooth new line adding
				var line = node.scrollHeight - node.offsetHeight;
				var height = node.offsetHeight + line;
				node.style.height = height + 'px';
			}
		}
  }
}



function placeholderDirective () {
	var directive = {
		restrict: 'A',
		require: '^^?brInput',
		priority: 200,
		link: postLink
	};

	return directive;



	function postLink (scope, element, attr, inputContainer) {
		if (!inputContainer) return;

		var placeholderText = attr.placeholder;
		element.removeAttr('placeholder');

		inputContainer.input.addClass('br-has-placeholder');
		element.parent().append('<div class="br-placeholder">' + placeholderText + '</div>');
	}
}




/**
* @name brX
* @module brX
*
* @required brInput
*
* @description
* The [br-x] element is an attribute of the <br-input> directive. this will show an x if there is input value. When clicked on it will clear the value
*
* @example
* <br-input br-x></br-input>
*
*/

xDirective.$inject = ['$compile'];
function xDirective ($compile) {
	var directive = {
		restrict: 'A',
		require: '^brInput',
		link: link
	};
	return directive;

	function link (scope, element, attr, inputContainer) {
		var xElement = $compile('<div class="br-x" ng-click="_clearXInput();">x</div>')(scope);
		element.parent().append(xElement);

		scope._clearXInput = function () {
			inputContainer.clearValue();
		};
	}
}
