/**
 * @ngdoc service
 * @name actionCreators
 * @description
 * # actionCreators
 * Service in the hifzTracker.services
 * Central location for sharedState information.
 */
app.service('actionCreators', ['stateService', 'hifzService', function (stateService, hifzService) {
		return {
			getInitialState: function () {
				var action = {
					type: INIT_STATE,
					payload: {
						users: hifzService.getUsers(),
						currentId: hifzService.getCurrentId(),
						currentLang: hifzService.getCurrentLang()
					}
				};
				stateService.reduce(action);
			},
			rateWird: function(index, rating, user) {
				var updatedUser = hifzService.rateWird(index, rating, user);
				var action = {
					type: RATE_WIRD,
					payload: {
						user: updatedUser,
					}
				};
				stateService.reduce(action);
			},
			removeWird: function(index, user) {
				var updatedUser = hifzService.removeWird(index, user);
				var action = {
					type: REMOVE_WIRD,
					payload: {
						user: updatedUser,
					}
				};
				stateService.reduce(action);
			}
		};
	}]);