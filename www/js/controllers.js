app.controller('AppCtrl', ['$rootScope', '$scope', '$ionicModal', '$ionicPopup',
		function($rootScope, $scope, $ionicModal, $ionicPopup) {
				$scope.view = {};
		}]);

app.controller('HomeCtrl', ['$scope', '$rootScope', 'actionCreators',
		function($scope, $rootScope, actionCreators) {

			$scope.view = {};

			$rootScope.$on('stateChanged', function (event, data) {
				$scope.view.state = data;
			});

			actionCreators.getInitialState();
		}]);
