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
	})

	.filter('surahName', function (Wirds) {
		return function (startPage) {
			if (!startPage) return;
			var containingSurahs = Wirds.getAllSurahs().filter(function(surah){
				return surah.startPage <= startPage && surah.endPage >= startPage;
			});
			return containingSurahs[0] ? containingSurahs[0].title : "";
		};
	});