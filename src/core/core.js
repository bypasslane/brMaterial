angular
	.module('brMaterial', [
		'ng',
		'ngAnimate',
		'ngMessages'
	])
	.config( BrCoreConfigure );


BrCoreConfigure.$inject = ['$provide'];
function BrCoreConfigure($provide) {
	$provide.decorator('$$rAF', ["$delegate", rAFDecorator]);
}


rAFDecorator.$inject = ['$delegate'];
function rAFDecorator( $delegate ) {
	$delegate.throttle = function(cb) {
	  var queuedArgs, alreadyQueued, queueCb, context;

	  return function debounced () {
	    queuedArgs = arguments;
	    context = this;
	    queueCb = cb;

	    if (!alreadyQueued) {
	      alreadyQueued = true;
	      $delegate(function() {
	        queueCb.apply(context, Array.prototype.slice.call(queuedArgs));
	        alreadyQueued = false;
	      });
	    }
	  };
	};
	return $delegate;
}
