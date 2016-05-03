/*
 * register Code/ $brGesture.register(element, 'press');
 *
 * Events:
 * @$br.pressdown  : When down happens
 * @$br.pressup    : when up happens
 */

/*
 * register Code/ $brGesture.register(element, 'hold');
 *
 * Events:
 * @$br.hold  : When down has been > 500 milliseconds and maxDistance is > 6
 */

/*
 * register Code/ $brGesture.register(element, 'drag');
 *
 * Events:
 * @$br.dragstart  : When mindistance > 6
 * @$br.drag       : when move happens
 * @$br.dragend    : when up happens
 */

/*
 * register Code/ $brGesture.register(element, 'swipe');
 *
 * Events:
 * @$br.swipeleft   : When minVelocity > 0.65 & minDistance > 10
 * @$br.swiperight  : When minVelocity > 0.65 & minDistance > 10
 */

var HANDLERS = {};
var isInitialized = false;
var pointer;
var lastPointer;


angular
	.module('brMaterial')
	.factory('$brGesture', brGesture)
	.factory('$$BrGestureHandler', BrGestureHandler)
	.run(attachEventsToDocument);


brGesture.$inject = ['$$BrGestureHandler', '$timeout', '$$rAF'];
function brGesture($$BrGestureHandler, $timeout, $$rAF) {
	var userAgent = navigator.userAgent || navigator.vendor || window.opera;
	var isIos = userAgent.match(/ipad|iphone|ipod/i);
	var isAndroid = userAgent.match(/android/i);

	var factory = {
		handler: addHandler,
		register: register,
		isHijackingClicks: (isIos || isAndroid)
	};


	// handle click hijacking. this will make sure no ghost clicks happan. this happens touch devices
	if (factory.isHijackingClicks) {
		factory.handler('click', {
			options: {
				maxDistance: 6
			},
			onEnd: function (ev, pointer) {
				if (pointer.distance < this.state.options.maxDistance) {
					this.dispatchEvent(ev, 'click');
				}
			}
		});
	}



	//--- Public functions ----------

	function register(element, handlerName, options) {
		var handler = HANDLERS[handlerName.replace(/^\$br./, '')];
		if (!handler) {
			throw new Error('Failed to register element with handler ' + handlerName + '. ' +
			'Available handlers: ' + Object.keys(HANDLERS).join(', '));
		}
		return handler.registerElement(element, options);
	}

	function addHandler(name, definition) {
		var handler = new $$BrGestureHandler(name);
		angular.extend(handler, definition);
		HANDLERS[name] = handler;

		return factory;
	}



	return factory
		/*
		 * register Code/ $brGesture.register(element, 'press');
		 *
		 * Events:
		 * @$br.pressdown  : When down happens
		 * @$br.pressup    : when up happens
		 */
		.handler('press', pressHandler())

		/*
		 * register Code/ $brGesture.register(element, 'hold');
		 *
		 * Events:
		 * @$br.hold  : When down has been > 500 milliseconds and maxDistance is > 6
		 */
		.handler('hold', holdHandler())

		/*
		 * register Code/ $brGesture.register(element, 'drag');
		 *
		 * Events:
		 * @$br.dragstart  : When mindistance > 6
		 * @$br.drag       : when move happens
		 * @$br.dragend    : when up happens
		 */
		.handler('drag', dragHandler(true))


		/*
		 * register Code/ $brGesture.register(element, 'dragVertical');
		 *
		 * Events:
		 * @$br.dragstart  : When mindistance > 6
		 * @$br.drag       : when move happens
		 * @$br.dragend    : when up happens
		 */
		.handler('dragVertical', dragHandler(false))

		/*
		 * register Code/ $brGesture.register(element, 'scroll');
		 *
		 * Events:
		 * @$br.scrollstart  : When mindistance > 6
		 * @$br.scroll       : when move happens
		 * @$br.scrollend    : when up happens
		 */
		.handler('scroll', scrollHandler())

		/*
		 * register Code/ $brGesture.register(element, 'swipe');
		 *
		 * Events:
		 * @$br.swipeleft   : When minVelocity > 0.65 & minDistance > 10
		 * @$br.swiperight  : When minVelocity > 0.65 & minDistance > 10
		 */
		.handler('swipe', swipeHandler());




	function pressHandler(){
		var handler = {
			onStart: function (ev, pointer) {
				this.dispatchEvent(ev, '$br.pressdown');
			},
			onEnd: function (ev, pointer) {
				this.dispatchEvent(ev, '$br.pressup');
			}
		};

		return handler;
	}


	function holdHandler(){
		var handler = {
			options: {
				maxDistance: 6,
				delay: 500
			},
			onCancel: function () {
				$timeout.cancel(this.state.timeout);
			},
			onStart: function (ev, pointer) {
				// For hold, require a parent to be registered with $brGesture.register()
				// Because we prevent scroll events, this is necessary.
				if (!this.state.registeredParent) return this.cancel();

				this.state.pos = {x: pointer.x, y: pointer.y};
				this.state.timeout = $timeout(angular.bind(this, function holdDelayFn() {
					this.dispatchEvent(ev, '$br.hold');
					this.cancel(); //we're done!
				}), this.state.options.delay, false);
			},
			onMove: function (ev, pointer) {
				// Don't scroll while waiting for hold.
				// If we don't preventDefault touchmove events here, Android will assume we don't
				// want to listen to anymore touch events. It will start scrolling and stop sending
				// touchmove events.
				ev.preventDefault();

				// If the user moves greater than <maxDistance> pixels, stop the hold timer
				// set in onStart
				var dx = this.state.pos.x - pointer.x;
				var dy = this.state.pos.y - pointer.y;
				if (Math.sqrt(dx * dx + dy * dy) > this.options.maxDistance) {
					this.cancel();
				}
			},
			onEnd: function () {
				this.onCancel();
			}
		};

		return handler;
	}


	function dragHandler(horizontal){

		var handler = {
			options: {
				minDistance: 6,
				horizontal: horizontal || false,
				cancelMultiplier: 1.5
			},
			onStart: function (ev) {
				// For drag, require a parent to be registered with $mdGesture.register()
				if (!this.state.registeredParent) this.cancel();
			},
			onMove: function (ev, pointer) {
				var shouldStartDrag, shouldCancel;
				// Don't scroll while deciding if this touchmove qualifies as a drag event.
				// If we don't preventDefault touchmove events here, Android will assume we don't
				// want to listen to anymore touch events. It will start scrolling and stop sending
				// touchmove events.

				if (!this.state.dragPointer) {
					if (this.state.options.horizontal) {
						shouldStartDrag = Math.abs(pointer.distanceX) > this.state.options.minDistance;
						shouldCancel = Math.abs(pointer.distanceY) > this.state.options.minDistance * this.state.options.cancelMultiplier;
					} else {
						shouldStartDrag = Math.abs(pointer.distanceY) > this.state.options.minDistance;
						shouldCancel = Math.abs(pointer.distanceX) > this.state.options.minDistance * this.state.options.cancelMultiplier;
					}

					if (shouldStartDrag) {
						// Create a new pointer representing this drag, starting at this point where the drag started.
						this.state.dragPointer = makeStartPointer(ev);
						updatePointerState(ev, this.state.dragPointer);
						this.dispatchEvent(ev, '$br.dragstart', this.state.dragPointer);

					} else if (shouldCancel) {
						this.cancel();
					}
				} else {
					this.dispatchDragMove(ev);
				}
			},
			// Only dispatch dragmove events every frame; any more is unnecessray
			dispatchDragMove: $$rAF.throttle(function (ev) {
				// Make sure the drag didn't stop while waiting for the next frame
				if (this.state.isRunning) {
					updatePointerState(ev, this.state.dragPointer);
					this.dispatchEvent(ev, '$br.drag', this.state.dragPointer);
				}
			}),
			onEnd: function (ev, pointer) {
				if (this.state.dragPointer) {
					updatePointerState(ev, this.state.dragPointer);
					this.dispatchEvent(ev, '$br.dragend', this.state.dragPointer);
				}
			}
		};

		return handler;
	}

	function scrollHandler(){
		var handler = {
			options: {
				minDistance: 6,
				horizontal: true,
				cancelMultiplier: 1.5
			},
			onStart: function (ev) {
				// For drag, require a parent to be registered with $mdGesture.register()
				if (!this.state.registeredParent) this.cancel();
			},
			onMove: function (ev, pointer) {
				var shouldStartDrag, shouldCancel;
				// Don't scroll while deciding if this touchmove qualifies as a drag event.
				// If we don't preventDefault touchmove events here, Android will assume we don't
				// want to listen to anymore touch events. It will start scrolling and stop sending
				// touchmove events.

				if (!this.state.dragPointer) {
					shouldStartDrag = Math.abs(pointer.distanceY) > this.state.options.minDistance;
					shouldCancel = Math.abs(pointer.distanceX) > this.state.options.minDistance * this.state.options.cancelMultiplier;

					if (shouldStartDrag) {
						// Create a new pointer representing this drag, starting at this point where the drag started.
						this.state.dragPointer = makeStartPointer(ev);
						updatePointerState(ev, this.state.dragPointer);
						this.dispatchEvent(ev, '$br.scrollstart', this.state.dragPointer);

					} else if (shouldCancel) {
						this.cancel();
					}
				} else {
					this.dispatchDragMove(ev);
				}
			},
			// Only dispatch dragmove events every frame; any more is unnecessray
			dispatchDragMove: $$rAF.throttle(function (ev) {
				// Make sure the drag didn't stop while waiting for the next frame
				if (this.state.isRunning) {
					updatePointerState(ev, this.state.dragPointer);
					this.dispatchEvent(ev, '$br.scroll', this.state.dragPointer);
				}
			}),
			onEnd: function (ev, pointer) {
				if (this.state.dragPointer) {
					updatePointerState(ev, this.state.dragPointer);
					this.dispatchEvent(ev, '$br.scrollend', this.state.dragPointer);
				}
			}
		};

		return handler;
	}


	function swipeHandler(){
		var handler = {
			options: {
				minVelocity: 0.65,
				minDistance: 10
			},
			onEnd: function (ev, pointer) {
				if (Math.abs(pointer.velocityX) > this.state.options.minVelocity &&
					Math.abs(pointer.distanceX) > this.state.options.minDistance) {
					var eventType = pointer.directionX == 'left' ? '$br.swipeleft' : '$br.swiperight';
					this.dispatchEvent(ev, eventType);
				}
			}
		};

		return handler;
	}
}


function BrGestureHandler () {

	function GestureHandler (name) {
		var factory = {
			name: name,
			state: {},
			options: {},

			dispatchEvent: nativeDispatchEvent,

			onStart: angular.noop,
			onMove: angular.noop,
			onEnd: angular.noop,
			onCancel: angular.noop,

			start: start,
			move: move,
			end: end,
			cancel: cancel,

			getNearestParent: getNearestParent,
			registerElement: registerElement
		};

		return factory;


		//--- Public Functions ----------------

		function start(ev, pointer) {
			if (factory.state.isRunning) return;

			var parentTarget = factory.getNearestParent(ev.target);
			var parentTargetOptions = parentTarget && parentTarget.$brGesture[factory.name] || {};

			factory.state = {
				isRunning: true,
				options: angular.extend({}, factory.options, parentTargetOptions),
				registeredParent: parentTarget
			};

			factory.onStart(ev, pointer);
		}

		function move(ev, pointer) {
			if (!factory.state.isRunning) return;

			factory.onMove(ev, pointer);
		}


		function end(ev, pointer) {
			if (!factory.state.isRunning) return;

			factory.onEnd(ev, pointer);
			factory.state.isRunning = false;
		}

		function cancel(ev, pointer) {
			factory.onCancel(ev, pointer);
			factory.state = {};
		}

		function getNearestParent(node) {
			var current = node;
			while (current) {
				if ((current.$brGesture || {})[factory.name]) {
					return current;
				}
				current = current.parentNode;
			}
			return null;
		}

		function registerElement(element, options) {
			element[0].$brGesture = element[0].$brGesture || {};
			element[0].$brGesture[factory.name] = options || {};
			element.on('$destroy', onDestroy);

			return onDestroy;

			function onDestroy() {
				delete element[0].$brGesture[factory.name];
				element.off('$destroy', onDestroy);
			}
		}
	}


	return GestureHandler;



	// --- public functions ----

	function nativeDispatchEvent(srcEvent, eventType, eventPointer) {
		eventPointer = eventPointer || pointer;
		var eventObj;

		if (eventType === 'click') {
			eventObj = document.createEvent('MouseEvents');
			eventObj.initMouseEvent(
				'click', true, true, window, srcEvent.detail,
				eventPointer.x, eventPointer.y, eventPointer.x, eventPointer.y,
				srcEvent.ctrlKey, srcEvent.altKey, srcEvent.shiftKey, srcEvent.metaKey,
				srcEvent.button, srcEvent.relatedTarget || null
			);

		} else {
			eventObj = document.createEvent('CustomEvent');
			eventObj.initCustomEvent(eventType, true, true, {});
		}
		eventObj.$material = true;
		eventObj.pointer = eventPointer;
		eventObj.srcEvent = srcEvent;
		eventPointer.target.dispatchEvent(eventObj);
	}
}



attachEventsToDocument.$inject= ['$brGesture', '$$BrGestureHandler'];
function attachEventsToDocument( $brGesture, $$BrGestureHandler ) {
	if (!document.contains) {
		document.contains = function (node) {
			return document.body.contains(node);
		};
	}


	if (!isInitialized && $brGesture.isHijackingClicks ) {
		document.addEventListener('click', function clickHijacker(ev) {
			var isKeyClick = ev.clientX === 0 && ev.clientY === 0;
			if (!isKeyClick && !ev.$material) {
				ev.preventDefault();
				ev.stopPropagation();
			}
		}, true);

		isInitialized = true;
	}


	// Listen to all events to cover all platforms.
	var START_EVENTS = 'mousedown touchstart pointerdown';
	var MOVE_EVENTS = 'mousemove touchmove pointermove';
	var END_EVENTS = 'mouseup mouseleave touchend touchcancel pointerup pointercancel';

	angular.element(document)
		.on(START_EVENTS, gestureStart)
		.on(MOVE_EVENTS, gestureMove)
		.on(END_EVENTS, gestureEnd);


	function runHandlers(handlerEvent, event) {
		var handler;
		for (var name in HANDLERS) {
			handler = HANDLERS[name];

			//if(handler.name) {

				if(handlerEvent === 'start') {
					handler.cancel();
				}

				handler[handlerEvent](event, pointer);
			//}
		}
	}



	//--- Global event functions ------
	function gestureStart(ev) {
		if (pointer) return;

		var now = +Date.now();

		// iOS & old android bug: after a touch event, a click event is sent 350 ms later.
		// If <400ms have passed, don't allow an event of a different type than the previous event
		if (lastPointer && !typesMatch(ev, lastPointer) && (now - lastPointer.endTime < 1500)) {
			return;
		}

		pointer = makeStartPointer(ev);
		runHandlers('start', ev);
	}

	function gestureMove(ev) {
		if (!pointer || !typesMatch(ev, pointer)) return;

		updatePointerState(ev, pointer);
		runHandlers('move', ev);
	}

	function gestureEnd(ev) {
		if (!pointer || !typesMatch(ev, pointer)) return;

		updatePointerState(ev, pointer);
		pointer.endTime = +Date.now();

		runHandlers('end', ev);

		lastPointer = pointer;
		pointer = null;
	}
}




//--- Public module Functions ------------

function makeStartPointer(ev) {
	var point = getEventPoint(ev);
	var startPointer = {
		startTime: +Date.now(),
		target: ev.target,
		// 'p' for pointer events, 'm' for mouse, 't' for touch
		type: ev.type.charAt(0)
	};
	startPointer.startX = startPointer.x = point.pageX;
	startPointer.startY = startPointer.y = point.pageY;
	return startPointer;
}

function typesMatch(ev, pointer) {
	return ev && pointer && ev.type.charAt(0) === pointer.type;
}

function updatePointerState(ev, pointer) {
	var point = getEventPoint(ev);
	var x = pointer.x = point.pageX;
	var y = pointer.y = point.pageY;

	pointer.distanceX = x - pointer.startX;
	pointer.distanceY = y - pointer.startY;
	pointer.distance = Math.sqrt(
		pointer.distanceX * pointer.distanceX + pointer.distanceY * pointer.distanceY
	);

	pointer.directionX = pointer.distanceX > 0 ? 'right' : pointer.distanceX < 0 ? 'left' : '';
	pointer.directionY = pointer.distanceY > 0 ? 'up' : pointer.distanceY < 0 ? 'down' : '';

	pointer.duration = +Date.now() - pointer.startTime;
	pointer.velocityX = pointer.distanceX / pointer.duration;
	pointer.velocityY = pointer.distanceY / pointer.duration;
}

function getEventPoint(ev) {
	return (ev.touches && ev.touches[0]) ||
		(ev.changedTouches && ev.changedTouches[0]) ||
		ev;
}
