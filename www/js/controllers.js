app.controller('AppCtrl', ['$rootScope', '$scope', 'actionCreators',
	function($rootScope, $scope, actionCreators) {

		$scope.view = {};

		$rootScope.$on('stateChanged', function (event, data) {
			$scope.view.state = data.state;
		});

	}]);

app.controller('HomeCtrl', ['$scope', '$rootScope', '$ionicPopover', 'actionCreators',
	function($scope, $rootScope, $ionicPopover, actionCreators) {

		$scope.view = {};

		$rootScope.$on('stateChanged', function (event, data) {
			$scope.view.state = data.state;
		});

		$scope.rateWird = function(index, rating) {
			var user = $scope.view.state.users.list[$scope.view.state.ui.currentId];
			actionCreators.rateWird(index, rating, user);
		};

		$scope.removeWird = function(index) {
			var user = $scope.view.state.users.list[$scope.view.state.ui.currentId];
			actionCreators.removeWird(index, user);
		};

		// Add Wird popover
		$scope.addWirdDialog = function ($event) {
			$ionicPopover.fromTemplateUrl('templates/add-wird.html', {
				scope: $scope
			}).then(function (modal) {
				$scope.modal = modal;
				$scope.wirdTypes = ['SURAH', 'QUARTER'];
				$scope.allSurahs = allSurahs;
				$scope.allQuarters = allQuarters;
				$scope.modal.show($event);
			});
		};

		$scope.addWird = function(wird) {
			var user = $scope.view.state.users.list[$scope.view.state.ui.currentId];
			actionCreators.addWird(wird, user);
		};

		// TODO: Find way to move this to a resolve
		actionCreators.getInitialState();
	}]);
