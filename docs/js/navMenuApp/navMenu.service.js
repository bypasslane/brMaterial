angular
  .module('docsApp')
  .factory('navMenuService', navMenuService);


function navMenuService(DEMOS, $rootScope, $location, COMPONENTS) {
  var service = {
    get: get,
    openedSection: undefined,
    currentSection: undefined,
    currentPage: undefined
  };
  return service;


  function get() {
    return [
      {
        label: 'Demos',
        sub: DEMOS
      },
      {
        label: 'Components',
        sub: COMPONENTS
      }
    ];
  }
}
