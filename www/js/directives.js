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
	});
