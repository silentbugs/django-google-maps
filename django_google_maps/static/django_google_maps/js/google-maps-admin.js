class LocationFormGoogleMap extends LocationFormGoogleMapBase {
	constructor() {
		const addressId = 'id_address';
		const mapCanvasId = 'map_canvas';
		const geolocationId = 'id_geolocation';
		const postCodeId = 'id_post_code';

		super(mapCanvasId, addressId, geolocationId, postCodeId);
	}
}

$(document).ready(function () {
	new LocationFormGoogleMap().initialize();
});
