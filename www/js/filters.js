angular.module('hifzTracker.filters', [])

	.filter('excludeItemsById', function () {
		return function (items, excludedItems) {
			return items.filter(function (item) {
				return !excludedItems.some(function (eItem) {
					return eItem.id === item.id;
				});
			});
		};
	});