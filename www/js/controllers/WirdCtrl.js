app.controller('WirdCtrl', ['$scope', '$stateParams', '$ionicHistory', '$window', 'actionCreators',
	function($scope, $stateParams, $ionicHistory, $window, actionCreators) {
		$scope.wirdId = parseInt($stateParams.wirdId);
		$scope.wird = {};
		$scope.imgRoot = "";

		if ($window.plugins) {
			$window.plugins.insomnia.keepAwake();
		}

		if (typeof cordova !== 'undefined') {
			$scope.imgRoot = cordova.file.externalRootDirectory + "hifzTracker/width_800";
		}

		if ($scope.wirdId) {
			$scope.wird = allWirds.find(function(wird) { return wird.id == $scope.wirdId; });
			$scope.activePage = $scope.wird.endPage - $scope.wird.startPage + 1;
			$scope.wirdPages = new Array($scope.wird.endPage - $scope.wird.startPage + 3);
		}

		$scope.goBack = function() {
			$ionicHistory.goBack();
		};

		$scope.$on("$destroy", function() {
			if ($window.plugins) {
				$window.plugins.insomnia.allowSleepAgain();
			}
		});

	}]);

