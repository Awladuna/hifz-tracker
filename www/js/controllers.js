app.controller('AppCtrl', ['$rootScope', '$scope', 'actionCreators',
	function($rootScope, $scope, actionCreators) {

		$scope.view = {};

		$rootScope.$on('stateChanged', function (event, data) {
			$scope.view.state = data.state;
		});

	}]);

app.controller('HomeCtrl', ['$scope', '$rootScope', 'actionCreators',
	function($scope, $rootScope, actionCreators) {

		$scope.view = {};

		$rootScope.$on('stateChanged', function (event, data) {
			$scope.view.state = data.state;
		});

		actionCreators.getInitialState();
	}]);
