angular
  .module('expansionPanelDemo1', ['brMaterial'])
  .controller('AppCtrl', function ($scope, $brExpansionPanel, $brExpansionPanelGroup, $timeout) {

    $scope.addTwo = addTwo;
    $scope.addThree = addThree;
    $scope.addFour = addFour;

    $scope.removeTwo = removeTwo;
    $scope.removeThree = removeThree;
    $scope.removeFour = removeFour;
    $scope.removeAll = removeAll;



    $brExpansionPanelGroup('expansionPanelGroupId').then(function (instance) {
      instance.register({
        componentId: 'panelOne',
        templateUrl: 'demo-partials/expansionPanel/demoBasic/panel.html',
        controller: 'ExapnsionPanelController1',
        controllerAs: 'vm'
      });

      instance.register({
        componentId: 'panelTwo',
        templateUrl: 'demo-partials/expansionPanel/demoBasic/panel.html',
        controller: 'ExapnsionPanelController2',
        controllerAs: 'vm'
      });

      instance.register({
        componentId: 'panelThree',
        templateUrl: 'demo-partials/expansionPanel/demoBasic/panel.html',
        controller: 'ExapnsionPanelController3',
        controllerAs: 'vm'
      });

      instance.register({
        componentId: 'panelFour',
        templateUrl: 'demo-partials/expansionPanel/demoBasic/panel.html',
        controller: 'ExapnsionPanelController4',
        controllerAs: 'vm'
      });


      instance.add('panelOne');
    });


    function addTwo() {
      addRegisteredPanel('panelTwo');
    }

    function addThree() {
      addRegisteredPanel('panelThree');
    }

    function addFour() {
      addRegisteredPanel('panelFour');
    }


    function removeTwo() {
      removeRegisteredPanel('panelTwo');
    }

    function removeThree() {
      removeRegisteredPanel('panelThree');
    }

    function removeFour() {
      removeRegisteredPanel('panelFour');
    }

    function removeAll() {
      $brExpansionPanelGroup('expansionPanelGroupId').then(function (instance) {
        instance.removeAll();
      });
    }


    function addRegisteredPanel(id) {
      $brExpansionPanelGroup('expansionPanelGroupId').then(function (instance) {
        instance.add(id)
          .then(function () {
            console.log('panel added')
          })
          .catch(function (error) {
            console.log(error);
          });
      });
    }

    function removeRegisteredPanel(id) {
      $brExpansionPanelGroup('expansionPanelGroupId').then(function (instance) {
        instance.remove(id)
          .then(function () {
            console.log('panel remove')
          })
          .catch(function (error) {
            console.log(error);
          });
      });
    }
  })
  .controller('ExapnsionPanelController1', function ($scope, $panel) {
    var vm = this;
    vm.title = 'Panel One';
    $panel
      .then(function (instance) {
        setTimeout(function () {
          instance.contract();
          instance.on('test', function (message) {
            console.log(message);
          });
        }, 200);
      })
      .catch(function (error) {
        console.log(error)
      });
  })
  .controller('ExapnsionPanelController2', function ($scope, $brExpansionPanelGroup) {
    var vm = this;
    vm.title = 'Panel Two';

    $brExpansionPanelGroup('expansionPanelGroupId').then(function (instance) {
      instance.postMessage('test', 'posted message');
    });
  })
  .controller('ExapnsionPanelController3', function ($scope) {
    var vm = this;
    vm.title = 'Panel Three';
  })
  .controller('ExapnsionPanelController4', function ($scope) {
    var vm = this;
    vm.title = 'Panel Four';
  });
