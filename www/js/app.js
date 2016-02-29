angular.module('hifzTracker', [
	'ionic',
	'ionic-toast',
	'pascalprecht.translate',
	'hifzTracker.entities',
	'hifzTracker.controllers',
	'hifzTracker.services',
	'hifzTracker.filters'
])

	.run(function ($ionicPlatform) {
		$ionicPlatform.ready(function () {
			// Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
			// for form inputs)
			if (window.cordova && window.cordova.plugins.Keyboard) {
				cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
				cordova.plugins.Keyboard.disableScroll(true);

			}
			if (window.StatusBar) {
				// org.apache.cordova.statusbar required
				StatusBar.styleDefault();
			}
		});
	})

	.config(function ($stateProvider, $urlRouterProvider, $translateProvider) {
		$stateProvider

			.state('app', {
				url: '/app',
				abstract: true,
				templateUrl: 'templates/menu.html',
				controller: 'AppCtrl'
			})

			.state('app.home', {
				url: '/home',
				views: {
					'menuContent': {
						templateUrl: 'templates/home.html',
						controller: 'HomeCtrl'
					}
				}
			});
		// if none of the above states are matched, use this as the fallback
		$urlRouterProvider.otherwise('/app/home');

		$translateProvider
			.useStaticFilesLoader({
				prefix: 'locales/',
				suffix: '.json'
			})
			.registerAvailableLanguageKeys(['ar', 'en'], {
				'ar': 'ar',
				'en': 'en', 'en_GB': 'en', 'en_US': 'en'
			})
			.preferredLanguage('ar')
			.fallbackLanguage('ar')
			.determinePreferredLanguage()
			.useSanitizeValueStrategy('escapeParameters');
	});
