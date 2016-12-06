app.directive('statBar', function() {
return {
		restrict: 'E',
		template: '<div class="stat-bar"><div class="stat-section" '
		+ 'ng-repeat="stat in stats | orderBy : \'count\' : true" '
		+ 'ng-style="{\'background-color\':stat.color, '
		+ '\'width\': (100 * stat.count / total) + \'%\'}"></div></div>',
		replace: true,
		scope: {
				stats: '=',
				total: '='
		},
		link: function(scope, element, attr) {
		}
};
});

app.directive('progressBar', function($rootScope) {
return {
		restrict: 'E',
		templateUrl: 'templates/progressBar.html',
		replace: true,
		scope: true,
		link: function(scope, element, attr) {
				scope.progress = {};

				$rootScope.$on('downloadProgressChanged', function (event, percent) {
						scope.progress.percent = percent < 100 ? percent : undefined;
						scope.progress.description = 'Downloading';
						scope.progress.color = '#387ef5';
				});

				$rootScope.$on('unzipProgressChanged', function (event, percent) {
						scope.progress.percent = percent < 100 ? percent : undefined;
						scope.progress.description = 'Expanding';
						scope.progress.color = '#33cd5f';
				});
		}
};
});
