app.controller('SettingsCtrl', ['$scope', 'stateService', 'actionCreators',
	function ($scope, stateService, actionCreators) {
		$scope.view = {
			state: stateService.getState(),
			allThemes: allThemes,
			allLanguages: allLanguages
		};

		$scope.setLanguage = function (languageId) {
			actionCreators.setLanguage(languageId);
		};

		$scope.setTheme = function (themeId) {
			actionCreators.setTheme(themeId);
		};

	}]);