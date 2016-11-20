/**
 * @ngdoc service
 * @name actionCreators
 * @description
 * # actionCreators
 * Service in the hifzTracker.services
 * Central location for sharedState information.
 */
app.service('actionCreators', ['stateService', 'storageService', function (stateService, storageService) {
		return {
			getInitialState: function () {
				var action = {
					type: INIT_STATE,
					payload: {
						users: storageService.getArray('users'),
						currentId: storageService.get('currentId', 0),
						currentLang: storageService.getObject('preferredLanguage')
					}
				};
				stateService.reduce(action);
			},
			rateWird: function(index, rating, currentId) {
				var action = {
					type: RATE_WIRD,
					payload: {
						index: index,
						rating: rating,
						currentId: currentId
					}
				};
				stateService.reduce(action);
			}
		};
	}]);