angular
  .module('brMaterial')
  .directive('brSwitch', brSwitchDirective);


/**
  * @name brSwitch
  * @module brSwitch
  *
  *
  * @description
  * The <br-switch> acts the same as a checkbox. It works with touchdevices for dragging
  *
  *
  * @param {model} [ng-model]
  *
  * @example
  * <br-switch ng-model="switch1">
	*		Switch 1: {{switch1}}
	*	</br-switch>
  *
  */
brSwitchDirective.$inject = ['brCheckboxDirective', '$brUtil', '$brTheme', '$brConstant', '$brGesture', '$$rAF'];
function brSwitchDirective (brCheckboxDirective, $brUtil, $brTheme, $brConstant, $brGesture, $$rAF) {
  var checkboxDirective = brCheckboxDirective[0];

  var directive = {
    restrict: 'E',
    transclude: true,
    require: '?ngModel',
    template:
			'<div ng-transclude flex class="br-label"></div>'+
			'<div class="br-container">' +
				'<div class="br-bar"></div>' +
				'<div class="br-thumb-container">' +
					'<div class="br-thumb"></div>' +
				'</div>'+
			'</div>',
    compile: compile
  };
  return directive;



  function compile (tElement, tAttr) {
    var checkboxLink = checkboxDirective.compile(tElement, tAttr);
    // stop transition for load
    tElement.addClass('br-dragging');

    return function link (scope, element, attr, ngModel) {
      ngModel = ngModel || $brUtil.fakeNgModel();

      var thumbContainer = angular.element(element[0].querySelector('.br-thumb-container'));
			var switchContainer = angular.element(element[0].querySelector('.br-container'));
			var isDragging = false;
			var drag;
			var onDragDebounced = $$rAF.throttle(onDrag);

      checkboxLink(scope, element, attr, ngModel);

      // no transition on initial load
      $$rAF(function() {
        element.removeClass('br-dragging');
      });


      element.off('click');
      $brGesture.register(switchContainer, 'drag');
			$brGesture.register(switchContainer, 'scroll');
			switchContainer
				.on('$br.dragstart', dragStart)
				.on('$br.drag', onDragDebounced)
				.on('$br.dragend', dragEnd)
				.on('$br.scrollstart', scrollStart)
				.on('$br.scrollend', scrollEnd);



      function scrollStart (){
				isDragging = true;
			}

			function scrollEnd (){
				isDragging = false;
			}


      function dragStart (e) {
				if (angular.isDefined(attr.ngDisabled) || angular.isDefined(attr.readonly)) { return; }

				e.preventDefault();
				e.srcEvent.preventDefault();

				isDragging = true;
				element.addClass('br-dragging');
				drag = {
					width: thumbContainer.prop('offsetWidth')
				};
			}

      function dragEnd (e) {
				if(isDragging === false) { return; }

				isDragging = false;
				element.removeClass('br-dragging');
				thumbContainer.css($brConstant.CSS.TRANSFORM, '');

				// We changed if there is no distance (this is a click a click),
				// or if the drag distance is >50% of the total.
				var isChanged = ngModel.$viewValue ? drag.translate < 0.5 : drag.translate > 0.5;
				if (isChanged) {
					applyModelValue(!ngModel.$viewValue);
				}
				drag = null;
			}

      function onDrag (e) {
				if(isDragging === false) { return; }

				e.preventDefault();
				e.srcEvent.preventDefault();

				var percent = e.pointer.distanceX / drag.width;

				//if checked, start from right. else, start from left
				var translate = ngModel.$viewValue ?  1 + percent : percent;
				// Make sure the switch stays inside its bounds, 0-1%
				translate = Math.max(0, Math.min(1, translate));

				thumbContainer.css($brConstant.CSS.TRANSFORM, 'translate3d(' + (100*translate) + '%,0,0)');
				drag.translate = translate;
			}

      function applyModelValue (newValue) {
				scope.$apply(function() {
					ngModel.$setViewValue(newValue);
					ngModel.$render();
				});
			}

    };
  }
}
