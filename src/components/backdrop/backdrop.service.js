angular
  .module('brMaterial')
  .factory('$brBackdrop', brBackdropService);


/**
 * @name $brBackdrop
 * @module $brBackdrop
 *
 *
 * @description
 * The $brBackdrop service will add abackdrop to any element you give it. it will also call a function when the backdrop is clicked
 *
 *
 * @example
 * $brBackdrop.add(element, scope, clickCallback);
 * $brBackdrop.addSideContent(element, scope, clickCallback);
 * $brBackdrop.remove();
 *
 */
brBackdropService.$inject = ['$compile', '$animate'];
function brBackdropService ($compile, $animate) {
  var backdrop;
  var _element;
  var wrapper;

  var service = {
    add: add,
    remove: remove
  };
  return service;



  // --- Public ---------------
  // -------------------------


  /**
   * @name add
   * @function
   *
   * @description
   * The add function will add abackdrop to any element you give it. it will also call a function when the backdrop is clicked
   *
   * @param {elemnt} element - the element to place the backdrop behind
   * @param {scope} scope - the scope to tie the backdrop to
   * @param {function} clickCallback - the function to call when backdrop is clicked
   */
  function add (element, scope, clickCallback) {
    if(!isValidAdd(element, scope, clickCallback)) return;

    backdrop = $compile('<br-backdrop class="br-click-catcher ng-enter">')(scope);
    element.addClass('br-side-content-wrapped');
    createAndAdd(element, scope, clickCallback);

    wrapper = angular.element('<div></div>');
    element.after(wrapper);
    wrapper.prepend(element);
  }


  /**
   * @name remove
   * @function
   *
   * @description
   * The remove function will remove the current backdrop
   *
   */
  function remove () {
    if(!backdrop) return;

    if(wrapper) {
      wrapper.after(_element);
      wrapper.remove();
      wrapper = null;
    }

    backdrop.off('click');
    backdrop.remove();
    backdrop = null;
  }





  // --- Private ------------------
  // ------------------------------


  function createAndAdd (element, scope, clickCallback) {
    _element = element;

    if(typeof clickCallback === 'function') {
      backdrop.on('click', clickCallback);
    }
  }


  function isValidAdd (element, scope, clickCallback) {
    if(backdrop) {
      console.log('$brBackdrop: You cannot add more than one backdrop at a time');
      return false;
    }

    if(!element) {
      console.log('$brBackdrop: Element is required');
      return false;
    }

    if(!scope) {
      console.log('$brBackdrop: Scope is required');
      return false;
    }

    return true;
  }
}
