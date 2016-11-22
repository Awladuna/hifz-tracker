angular.module('hifzTracker.directives', [])

	.directive('statBar', function() {
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
			link: function (scope, element, attr) {
			}
		};
	})

	.directive('progressBar', function() {
		return {
			restrict: 'E',
			template: '<div class="progress" ng-if="progress.percent">'
			+ '<h4 ng-bind="progress.description" ng-style="{\'color\':progress.color}"></h4>'
			+ '<div class="progress-bar"><div class="progress-section" '
			+ 'ng-style="{\'background-color\':progress.color, '
			+ '\'width\': progress.percent + \'%\'}"></div></div></div>',
			replace: true,
			scope: {
				progress: '='
			},
			link: function (scope, element, attr) {
			}
		};
	});
