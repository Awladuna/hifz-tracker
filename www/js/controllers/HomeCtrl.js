app.controller('HomeCtrl', ['$scope', '$rootScope', '$ionicPopover', '$ionicPopup', 'stateService', 'actionCreators',
	function($scope, $rootScope, $ionicPopover, $ionicPopup, stateService, actionCreators) {
		actionCreators.checkBackup();

		$scope.view = {
			state: stateService.getState()
		};

		$scope.restore = function() {
			actionCreators.restore();
		};

		$rootScope.$on('stateChanged', function(event, data) {
			$scope.view.state = data.state;
			try {
				$scope.view.userStats = $scope.view.state.users
					.list[$scope.view.state.ui.currentId].getStats();
			} catch (e) {}
		});

		$scope.rateWird = function(index, rating) {
			var user = $scope.view.state.users.list[$scope.view.state.ui.currentId];
			actionCreators.rateWird(index, rating, user);
		};

		$scope.removeWird = function(index) {
			var user = $scope.view.state.users.list[$scope.view.state.ui.currentId];
			$scope.surah = user.wirds[index];
			var confirmPopup = $ionicPopup.confirm({
				scope: $scope,
				template: '<span translate="DELETE_CONFIRMATION"></span> <b translate="{{surah.title}}"></b>?'
			});

			confirmPopup.then(function(res) {
				if (res) {
					actionCreators.removeWird(index, user);
				}
			});
		};

		// Initialize Add-Wird popover
		$ionicPopover.fromTemplateUrl('templates/add-wird.html', {
			scope: $scope
		}).then(function(popover) {
			$scope.popover = popover;
			$scope.wirdTypes = ['SURAH', 'QUARTER'];
			$scope.allSurahs = allSurahs;
			$scope.allQuarters = allQuarters;
			$scope.view.wirdLimit = 20;
		});
		// Reset add-wird view when popover is hidden
		$scope.$on('popover.hidden', function() {
			$scope.view.wirdLimit = 20;
			delete $scope.view.wirdType;
		});
		// Open the popover
		$scope.addWirdDialog = function($event) {
			$scope.popover.show($event);
		};
		// Add-wird infinite scroll
		$scope.increaseWirdLimit = function() {
			$scope.view.wirdLimit += 20;
			$scope.$broadcast('scroll.infiniteScrollComplete');
		};

		$scope.addWird = function(wird) {
			var user = $scope.view.state.users.list[$scope.view.state.ui.currentId];
			actionCreators.addWird(wird, user);
		};

		$scope.loadMore = function(increment) {
			actionCreators.loadMore(increment);
		};

		// TODO: Find way to move this to a resolve
		if (!$scope.view.state.users) {
			actionCreators.getInitialState();
		}
	}]);

