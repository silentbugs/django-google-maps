class LocationFormGoogleMapInline extends LocationFormGoogleMapBase {
	constructor(index, prefix) {
		const addressId = `id_${prefix}-${index}-address`;
		const mapCanvasId = `${prefix}-${index}-address_map_canvas`;
		const geolocationId = `id_${prefix}-${index}-geolocation`;
		const postCodeId = `id_${prefix}-${index}-post_code`;

		// call super constructor
		super(mapCanvasId, addressId, geolocationId, postCodeId);
	}
}

$(document).ready(function () {
	const prefix = 'addresses';
	const addressInputSelector = `input[id^='id_${prefix}-'][id$='-address']:visible`;

	// Initialize existing location forms
	$(addressInputSelector).each(function (index) {
		new LocationFormGoogleMapInline(index, prefix).initialize();
	});

	// Listen and check for insertion of new location forms
	$(document).bind("formset:added", function (e) {
		const newAddressInput = $(e.target).find(addressInputSelector);

		if (newAddressInput) {
			const index = parseInt(newAddressInput.attr("id").match(/(?<=-)\d+(?=-)/)[0]);
			new LocationFormGoogleMapInline(index, prefix).initialize();
		}
	});
});
