angular
  .module('docsApp')
  .factory('navMenuService', navMenuService);


function navMenuService() {
  var service = {
    get: get
  };
  return service;


  function get() {
    // NOTE for admin you can send down json from server
    return [
      {
        label: 'Organizations',
        icon: 'organization',
        link: 'organizations'
      },
      {
        label: 'Sub Test',
        icon: 'settings',
        sub: [
          {
            label: 'Test One',
            icon: 'local_cafe',
            link: 'login'
          },
          {
            label: 'Test Two',
            icon: 'restaurant_menu',
            link: 'login2'
          }
        ]
      },
      {
        label: 'Gateway Accounts',
        icon: 'gateway',
        link: 'gateway_accounts'
      }
    ];
  }
}
