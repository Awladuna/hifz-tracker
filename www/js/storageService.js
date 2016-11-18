/**
 * @ngdoc service
 * @name storageService
 * @description
 * # storageService
 * Service in the hifzTracker.services
 * Central location for sharedState information.
 */
app.factory("storageService", ['$window', function ($window) {
	return {
		set: function (key, value) {
			$window.localStorage[key] = value;
		},
		get: function (key, defaultValue) {
			return $window.localStorage[key] || defaultValue;
		},
		setObject: function (key, value) {
			$window.localStorage[key] = JSON.stringify(value);
		},
		getObject: function (key) {
			return JSON.parse($window.localStorage[key] || '{}');
		},
		getArray: function (key) {
			return JSON.parse($window.localStorage[key] || '[]');
		},
		setArray: function (key, value) {
			this.setObject(key, value);
		}
	}
}]);