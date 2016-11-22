app.controller('SettingsCtrl', ['$scope', 'stateService',
	function ($scope, stateService) {
		$scope.view = {
			state: stateService.getState(),
			allThemes: allThemes,
			allLanguages: allLanguages
		};
	}]);