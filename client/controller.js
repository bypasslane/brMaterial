angular
  .module('brMaterialApp')
  .controller('HomeController', HomeController);


HomeController.$inject = ['$scope', '$brDialog', '$timeout'];
function HomeController($scope, $brDialog, $timeout) {
  var vm = this;



  vm.tableData = [
    {name: 'Ben Rubin', email: 'ben@ben.com', phone: '2152345678', order:10, jobs: ['Paper Boy', 'Human', 'Turtle Surfer', 'The Dude']},
    {name: 'Number Longer One', email: 'one@one.com', phone: '2152345678', order:1, test: [{name: 'ben'}]},
    {name: 'Number Longer One', email: 'one@one.com', phone: '2152345678', order:1, test: [{name: 'tt'},{name: 'ben'}]},
    {name: 'Number Two', email: 'two@two.com', phone: '2152345678', order:2},
    {name: 'Number three', email: 'three@three.com', phone: '2152345678', order:3},
    {name: 'Number four', email: 'four@four.com', phone: '2152345678', order:4},
    {name: 'Number five', email: 'five@five.com', phone: '2152345678', order:5},
    {name: 'Ben Rubin', email: 'ben@ben.com', phone: '2152345678', order:10},
    {name: 'Number Longer One', email: 'one@one.com', phone: '2152345678', order:1},
    {name: 'Number Two', email: 'two@two.com', phone: '2152345678', order:2},
    {name: 'Number three', email: 'three@three.com', phone: '2152345678', order:3},
    {name: 'Number four', email: 'four@four.com', phone: '2152345678', order:4},
    {name: 'Number five', email: 'five@five.com', phone: '2152345678', order:5}
  ];

  vm.tableFilter = {
    name: '',
    // jobs: 'Human',
    // test: {
    //   name: 'ben'
    // }
  };




  vm.listList = [
    {name: 'Ben Rubin', email: 'ben@ben.com', phone: '2152345678', order:10},
    {name: 'Number Longer One', email: 'one@one.com', phone: '2152345678', order:1},
    {name: 'Number Two', email: 'two@two.com', phone: '2152345678', order:2},
    {name: 'Number three', email: 'three@three.com', phone: '2152345678', order:3},
    {name: 'Number four', email: 'four@four.com', phone: '2152345678', order:4},
    {name: 'Number five', email: 'five@five.com', phone: '2152345678', order:5}
  ];
  vm.listSelected = [1,10];

  vm.advancedSelected = undefined;
  vm.advancedSeletChange = function (data) {
    console.log(vm.advancedSelected);
    // vm.advancedSelected = undefined;
  };

  vm.selectButtonTest = function () {
    console.log('ok');
  };


  vm.toggleSelect = false;
  $timeout(function () {
    vm.toggleSelect = true;
  }, 2000);


  vm.expanderList = [0,1,2,3];
  $timeout(function () {
    $scope.$apply(function () {
      vm.expanderList.push(5);
    });
  }, 5000);

  vm.spinnerPercentage = 0;
  vm.selectOptions = [
    {id: 0, name: 'Ben'},
    {id: 1, name: 'Geoff'},
    {id: 2, name: 'Jonathan'},
    {id: 3, name: 'Wyatt'},
    {id: 4, name: 'Nate'},
    {id: 5, name: 'Tori'},
    {id: 6, name: 'Zaphod'}
  ];

  $timeout(function () {
    vm.selectOptions.push({id: 7, name: 'what'});
  }, 1000);

  // vm.selectModel = vm.selectOptions[0].id;

  vm.popDialog = popDialog;
  vm.popAlert = popAlert;
  vm.popTemplatedDialog = popTemplatedDialog;
  vm.menuClick = menuClick;

  percentTimer();


  function percentTimer() {
    $timeout(function () {
      vm.spinnerPercentage++;
      if (vm.spinnerPercentage < 100) { percentTimer(); }
    }, 120);
  }


  function popDialog(ev) {
    $brDialog.add({
      message: 'Hey Hey, you chould close this',
      targetEvent: ev,
      controls: {
        continueLabel: 'Continue',
        cancelLabel: 'Close'
      },
      scope: {
        cancel: function () {
          $brDialog.alert({message: 'You cancelled'});
        },
        continue: function () {
          $brDialog.lock();

          $timeout(function () {
            $brDialog.unlock();
          }, 3000);
        }
      }
    });
  }

  function popAlert() {
    $brDialog.alert({message: 'This is an alert!'});
  }



  function popTemplatedDialog() {
    $brDialog.add({
      // width: '100%',
      // maxWidth: 600,
      mobileFill: true,
      template: '<div style="padding: 20px; margin-bottom: 1100px;"> Hello Hello world world test test </div>',
      controller: controller
    }).then(function () {
      console.log('dialog Added');
    });


    function controller() {
      /*jshint validthis:true */
      var vm = this;

      vm.title = 'Template Dialog';
      vm.closeDialog = closeDialog;


      function closeDialog () {
        $brDialog
          .remove()
          .then(function () {
            console.log('dialog removed');
          });
      }
    }
  }


  function menuClick () {
    console.log('Menu Click');
  }

}
