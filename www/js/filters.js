angular.module('hifzTracker.filters', [])

	.filter('excludeItemsById', function () {
		return function (items, excludedItems) {
			return items.filter(function (item) {
				return !excludedItems.some(function (eItem) {
					return eItem.id === item.id;
				});
			});
		};
	})

	.filter('localizeDate', function (LanguageService) {
		return function (date) {
			if (!date) return;
			var code = LanguageService.getPreferred().code;
			return moment(date, 'l').locale(code).format('l');
		};
	});