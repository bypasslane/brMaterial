angular
  .module('brMaterial')
  .directive('brRadioGroup', brRadioGroupDirective)
  .directive('brRadioButton', brRadioButtonDirective);


/**
  * @name brRadioGroup
  * @module brRadioGroup
  *
  *
  * @description
  * <br-radio-group> container for 1 or more radio buttons
  *
	* @param {model} [ng-model] - the value set by the radio buttons
  *
  * @example
  * <br-radio-group ng-model="info.radioGroup1">
	*		<br-radio-button value="1">Test</br-radio-button>
	*		<br-radio-button value="2">Test 2</br-radio-button>
	*		<br-radio-button value="3" class="br-primary">Primary 3</br-radio-button>
	*	</br-radio-group>
  *
  */
brRadioGroupDirective.$inject = ['$brTheme'];
function brRadioGroupDirective ($brTheme) {
  var directive = {
    restrict: 'E',
    require: ['brRadioGroup', '?ngModel'],
    link: { pre: preLink },
    controller: ['$element', controller]
  };
  return directive;


  function preLink (scope, element, attr, ctrls) {
    $brTheme(element);

    var radioGroupController = ctrls[0];
    var ngModelCtrl = ctrls[1] || $brUtil.fakeNgModel();

    element.attr({
			'role': 'radiogroup',
			'tabindex': element.attr('tabindex') || '0'
		});

    radioGroupController.init(ngModelCtrl);
    element.on('keydown', keydownListener);


    function keydownListener (ev) {
			switch(ev.keyCode) {
				case 37: //Left Arrow
				case 38: // up arrorw
					ev.preventDefault();
					radioGroupController.selectPrevious();
					break;

				case 39: //right arrow
				case 40: //down arror
					ev.preventDefault();
					radioGroupController.selectNext();
					break;
			}
		}
  }


  function controller ($element) {
    /*jshint validthis: true */
    var vm = this;
    vm.radioRenderFuncs = [];

    vm.init = init;
    vm.add = add;
    vm.remove = remove;
    vm.setViewValue = setViewValue;
    vm.getViewValue = getViewValue;
    vm.selectNext = selectNext;
    vm.selectPrevious = selectPrevious;


    function init (ngModelCtrl_) {
      vm.ngModelCtrl = ngModelCtrl_;
      vm.ngModelCtrl.$render = render;
    }

    function add (renderFunc) {
      vm.radioRenderFuncs.push(renderFunc);
    }

    function remove (renderFunc) {
      var index = vm.radioRenderFuncs.indexOf(renderFunc);
      if (index !== -1) {
        vm.radioRenderFuncs.splice(index, 1);
      }
    }

    function selectNext () {
      changeSelectedButton($element, 1);
    }

    function selectPrevious () {
      changeSelectedButton($element, -1);
    }

    function setViewValue (value, eventType) {
      vm.ngModelCtrl.$setViewValue(value, eventType);
      render();
    }

    function getViewValue () {
      return vm.ngModelCtrl.$viewValue;
    }


    function render () {
      vm.radioRenderFuncs.forEach(function (radioButtonRender) {
        radioButtonRender();
      });
    }

    function changeSelectedButton (parent, increment) {
      var buttons = [].slice.call(parent[0].querySelectorAll(' br-radio-button'));
      var selected = parent[0].querySelector('br-radio-button.br-checked');
      var currentPlace = buttons.indexOf(selected);

      currentPlace += increment;

      if (currentPlace < 0) { currentPlace = buttons.length - 1; }
      else if (currentPlace >= buttons.length) { currentPlace = 0; }

      angular.element(buttons[currentPlace]).triggerHandler('click');
    }
  }
}






/**
  * @name brRadioButton
  * @module brRadioButton
  *
  *
  * @description
  * <br-radio-button> is meant to be used along side other radio buttons.
  *
  * @param {any} [value] - the value set on the radio group
  *
  * @example
  * <br-radio-group ng-model="info.radioGroup1">
	*		<br-radio-button value="1">Test</br-radio-button>
	*		<br-radio-button value="2">Test 2</br-radio-button>
	*		<br-radio-button value="3" class="br-primary">Primary 3</br-radio-button>
	*	</br-radio-group>
  *
  */
brRadioButtonDirective.$inject = ['$brTheme'];
function brRadioButtonDirective ($brTheme) {
  var directive = {
    restrict: 'E',
    require: '^brRadioGroup',
    transclude: true,
    template: '<div class="br-container">' +
								'<div class="br-off"></div>' +
								'<div class="br-on"></div>' +
							'</div>' +
							'<div ng-transclude class="br-label"></div>',
    link: link,
  };
  return directive;


  function link (scope, element, attr, radioGroupController) {
    var lastChecked;

    $brTheme(element);
    initialize();

    function initialize () {
      if (!radioGroupController) {
        throw 'RadioGroupController not found.';
      }

      radioGroupController.add(render);
      attr.$observe('value', render);

      element
        .on('click', listener)
        .on('$destroy', function() {
          radioGroupController.remove(render);
        });
    }


    function listener (ev) {
			if (element[0].hasAttribute('disabled')) return;

			scope.$apply(function () {
				radioGroupController.setViewValue(attr.value, ev && ev.type);
			});
		}


    function render () {
      var checked = (radioGroupController.getViewValue() === attr.value);
      if (checked === lastChecked) {
        return;
      }

      lastChecked = checked;

      if (checked) {
        element.addClass('br-checked');
      } else {
        element.removeClass('br-checked');
      }
    }

  }
}
