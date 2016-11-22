app.controller('UserFormCtrl', ['$scope', '$stateParams', '$ionicHistory', 'stateService', 'actionCreators',
	function ($scope, $stateParams, $ionicHistory, stateService, actionCreators) {
		$scope.userId = parseInt($stateParams.userId);
		$scope.user = {};

		var state = stateService.getState();
		if ($scope.userId && state.users) {
			$scope.user = state.users.list[$scope.userId];
		}

		$scope.goBack = function () {
			$ionicHistory.goBack();
		};

		$scope.deleteUser = function () {
			actionCreators.deleteUser($scope.user);
			$scope.goBack();
		};

		$scope.saveUser = function () {
			actionCreators.saveUser($scope.user);
			$scope.goBack();
		};
	}]);

