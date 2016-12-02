app.filter('excludeItemsById', function () {
		return function (items, excludedItems) {
			// Skip the filter if no excluded items
			if (!excludedItems || !excludedItems.length) { return items; }
			// Filter out excluded items
			return items.filter(function (item) {
				return !excludedItems.some(function (eItem) {
					return eItem.id === item.id;
				});
			});
		};
	});

app.filter('localizeDate', function (hifzService) {
		return function (date) {
			if (!date) return;
			var code = hifzService.getCurrentLang().code;
			return moment(date, 'l').locale(code).format('l');
		};
	});

app.filter('surahName', function () {
		return function (startPage) {
			if (!startPage) return;
			var containingSurah = allWirds.find(function (wird) {
				return wird.type === SURAH &&
					wird.startPage <= startPage &&
					wird.endPage >= startPage;
			});
			return containingSurah ? containingSurah.title : "";
		};
	});