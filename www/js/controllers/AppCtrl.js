app.controller('AppCtrl', ['$rootScope', '$scope', 'stateService', 'actionCreators', '$state',
	function ($rootScope, $scope, stateService, actionCreators, $state) {

		$scope.view = {
			state: stateService.getState()
		};

		$rootScope.$on('stateChanged', function (event, data) {
			$scope.view.state = data.state;
		});

		$scope.userDialog = function (userId) {
			$state.go("app.users", { "userId": userId });
		};

		$scope.switchUser = function (userId) {
			actionCreators.switchUser(userId);
		}
	}]);
