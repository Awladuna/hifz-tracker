app.controller('AppCtrl', ['$rootScope', '$scope', 'stateService', 'actionCreators', '$state',
	function ($rootScope, $scope, stateService, actionCreators, $state) {

		$scope.view = {
			state: stateService.getState(),
			editUsers: false
		};

		$rootScope.$on('stateChanged', function (event, data) {
			$scope.view.state = data.state;
		});

		$scope.userDialog = function (userId) {
			$scope.view.editUsers = false;
			$state.go("app.users", { "userId": userId });
		};

		$scope.settings = function () {
			$scope.view.editUsers = false;
			$state.go("app.settings");
		};

		$scope.switchUser = function (userId) {
			$scope.view.editUsers = false;
			actionCreators.switchUser(userId);
		}
	}]);
