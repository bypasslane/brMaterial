angular
  .module('dialogDemo1', ['brMaterial'])
  .controller('AppCtrl', function ($scope, $brDialog) {

    $scope.openBasic = function () {
      $brDialog.add({
        message: 'This is a basic dialog',
        controls: true,
        scope: {
          continue: function () {
            $brDialog.remove();
          }
        }
      });
    };

    $scope.openMobile = function () {
      $brDialog.add({
        message: 'This is a basic dialog with mobile fill',
        mobileFill: true,
        controls: {
          continueLabel: 'OK',
          cancelLabel: 'Close'
        },
        scope: {
          continue: function () {
            $brDialog.remove();
          }
        }
      });
    };

    $scope.openTemplated = function () {

    };

    $scope.openAlert = function () {
      $brDialog.alert('This is an alert');
    };
  });
