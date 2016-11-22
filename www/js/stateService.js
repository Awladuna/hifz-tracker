/**
 * @ngdoc service
 * @name stateService
 * @description
 * # stateService
 * Service in the hifzTracker.services
 * Central location for sharedState information.
 */
app.service('stateService', function ($rootScope, $log, User) {
		return {
			_state: {},
			_userReducers: function (action, users) {
				var scope = this;

				switch (action.type) {
					case INIT_STATE:
						users = {
							ids: [],
							list: {}
						};
						var length = action.payload.users ? action.payload.users.length : 0;
						for (var i = 0; i < length; i++) {
							var userData = action.payload.users[i];
							users.list[userData.id] = new User(userData);
							users.ids.push(userData.id);
						}
						return users;
					case RATE_WIRD:
					case ADD_WIRD:
					case REMOVE_WIRD:
						users.list[action.payload.user.id] = action.payload.user;
						return users;
					case SAVE_USER:
						users.list[action.payload.user.id] = action.payload.user;
						var userIndex = users.ids.indexOf(action.payload.user.id);
						if (userIndex < 0) {
							users.ids.push(action.payload.user.id);
						}
						return users;
					case DELETE_USER:
						var userIndex = users.ids.indexOf(action.payload.user.id);
						users.ids.splice(userIndex, 1);
						delete users.list[action.payload.user.id];
						return users;
					default:
						return users;
				}
			},
			_uiReducers: function (action, ui) {
				var scope = this;
				var DEFAULT_LIMIT = 3;

				switch (action.type) {
					case INIT_STATE:
						ui = {
							currentId: action.payload.currentId,
							currentLang: action.payload.currentLang,
							limit: DEFAULT_LIMIT
						};
						return ui;
					case LOAD_MORE:
						ui.limit += action.payload.increment || DEFAULT_LIMIT;
						return ui;
					case SWITCH_USER:
						ui.currentId = action.payload.currentId;
						ui.limit = DEFAULT_LIMIT;
						return ui;
					case SAVE_USER:
						ui.currentId = action.payload.user.id;
						ui.limit = DEFAULT_LIMIT;
						return ui;
					case DELETE_USER:
						// Set current user to the first user
						ui.currentId = action.payload.users.length ? action.payload.users[0].id : 0;
						ui.limit = DEFAULT_LIMIT;
						return ui;
					default:
						return ui;
				}
			},
			getState: function() {
				return this._state;
			},
			reduce: function (action) {
				var scope = this;

				if (!action || !action.type) {
					return;
				}

				newState = {};
				newState.users = scope._userReducers(action, scope._state.users);
				newState.ui = scope._uiReducers(action, scope._state.ui);

				scope._state = newState;
				$rootScope.$emit('stateChanged', {
					state: scope._state,
					action: action
				});

				$log.debug("State updated:");
				$log.debug(scope._state, action.type);
			}
		};
	});