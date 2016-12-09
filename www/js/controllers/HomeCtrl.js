app.controller('HomeCtrl', ['$scope', '$rootScope', '$ionicPopover', '$ionicPopup', '$state', 'stateService', 'actionCreators',
	function ($scope, $rootScope, $ionicPopover, $ionicPopup, $state, stateService, actionCreators) {

		var getStats = function () {
			try {
				return $scope.view.state.users
					.list[$scope.view.state.ui.currentId].getStats();
			} catch (e) {
				return [];
			}
		};

		$scope.view = {
			state: stateService.getState(),
			userStats: getStats()
		};

		$scope.restore = function () {
			actionCreators.restore($scope.view.backupJson);
		};

		$scope.userDialog = function (userId) {
			$state.go("app.users", { "userId": userId });
		};

		$rootScope.$on('stateChanged', function (event, data) {
			$scope.view.state = data.state;
			$scope.view.userStats = getStats();
		});

		$scope.rateWird = function (index, rating) {
			var user = $scope.view.state.users.list[$scope.view.state.ui.currentId];
			actionCreators.rateWird(index, rating, user);
		};

		$scope.removeWird = function (index) {
			var user = $scope.view.state.users.list[$scope.view.state.ui.currentId];
			$scope.surah = user.wirds[index];
			var confirmPopup = $ionicPopup.confirm({
				scope: $scope,
				template: '<span translate="DELETE_CONFIRMATION"></span> <b translate="{{surah.title}}"></b>?'
			});

			confirmPopup.then(function (res) {
				if (res) {
					actionCreators.removeWird(index, user);
				}
			});
		};

		// Initialize Add-Wird popover
		$ionicPopover.fromTemplateUrl('templates/add-wird.html', {
			scope: $scope
		}).then(function (popover) {
			$scope.popover = popover;
			$scope.wirdTypes = ['SURAH', 'QUARTER'];
			$scope.allWirds = allWirds;
			$scope.view.wirdLimit = 20;
		});
		// Reset add-wird view when popover is hidden
		$scope.$on('popover.hidden', function () {
			$scope.view.wirdLimit = 20;
			delete $scope.view.wirdType;
		});
		// Open the popover
		$scope.addWirdDialog = function ($event) {
			$scope.popover.show($event);
		};
		// Add-wird infinite scroll
		$scope.increaseWirdLimit = function () {
			$scope.view.wirdLimit += 20;
			$scope.$broadcast('scroll.infiniteScrollComplete');
		};

		$scope.addWird = function (wird) {
			var user = $scope.view.state.users.list[$scope.view.state.ui.currentId];
			actionCreators.addWird(wird, user);
		};

		$scope.openWird = function (wirdId) {
			if ($scope.view.state.ui.downloadStatus == 2) {
				$state.go("app.wirds", { "wirdId": wirdId });
			} else {
				// Images not available, prompt to download
				var confirmPopup = $ionicPopup.confirm({
					template: '<span translate="DOWNLOAD_CONFIRMATION"></span>?'
				});

				confirmPopup.then(function (res) {
					if (res) {
						actionCreators.downloadOrUnzip();
					}
				});
			}
		};

		$scope.loadMore = function (increment) {
			actionCreators.loadMore(increment);
		};

	}]);

