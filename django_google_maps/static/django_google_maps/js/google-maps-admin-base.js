
/*
Integration for Google Maps in the django admin.

How it works:

You have an address field on the page.
Enter an address and an on change event will update the map
with the address. A marker will be placed at the address.
If the user needs to move the marker, they can and the geolocation
field will be updated.

Only one marker will remain present on the map at a time.

This script expects:

<input type="text" name="address" id="id_addresses-{index}-address" />
<input type="text" name="geolocation" id="id_addresses-{index}-geolocation" />
*/

class LocationFormGoogleMapBase {
	constructor(mapCanvasId, addressId, geolocationId, postCodeId) {
		this.autocomplete = null;
		this.geocoder = new google.maps.Geocoder();
		this.map = null;
		this.marker = null;
		this.mapCanvasId = mapCanvasId;
		this.addressId = addressId;
		this.geolocationId = geolocationId;
		this.postCodeId = postCodeId;
	}

	initialize() {
		let lat = 0;
		let lng = 0;
		let zoom = 2;

		// Update zoom level and initial cordinates if form is bound
		const existingLocation = this.getExistingLocation();
		if (existingLocation) {
			lat = existingLocation[0];
			lng = existingLocation[1];
			zoom = 18;
		}

		const latlng = new google.maps.LatLng(lat, lng);
		const mapOptions = {
			zoom: zoom,
			center: latlng,
			mapTypeId: this.getMapType(),
		};
		this.map = new google.maps.Map(document.getElementById(this.mapCanvasId), mapOptions);

		if (existingLocation) this.setMarker(latlng);

		this.autocomplete = new google.maps.places.Autocomplete(
			document.getElementById(this.addressId),
			this.getAutoCompleteOptions()
		);

		this.autocomplete.addListener("place_changed", () => this.codeAddress());

		const addressInput = document.getElementById(this.addressId);
		addressInput.addEventListener('keydown', (e) => {
			if (e.key === "Enter") {
				e.preventDefault();
				return false;
			}
		});
		addressInput.addEventListener('input', (e) => {
			this.clearGeolocation();
			this.clearPostcode();
		});
	}

	getMapType() {
		const geolocationInput = document.getElementById(this.addressId);
		const allowedType = ["roadmap", "satellite", "hybrid", "terrain"];
		const mapType = geolocationInput.getAttribute("data-map-type");

		if (mapType && -1 !== allowedType.indexOf(mapType)) return mapType;
		return google.maps.MapTypeId.ROADMAP;
	}

	getAutoCompleteOptions() {
		const geolocationInput = document.getElementById(this.addressId);
		const autocompleteOptions = geolocationInput.getAttribute(
			"data-autocomplete-options"
		);

		if (!autocompleteOptions) return { types: ["geocode"] };
		return JSON.parse(autocompleteOptions);
	}

	getExistingLocation() {
		const geolocationInput = document.getElementById(this.geolocationId);
		if (geolocationInput && geolocationInput.value) {
			return geolocationInput.value.split(",");
		}
	}

	codeAddress() {
		const place = this.autocomplete.getPlace();

		if (place.geometry !== undefined) {
			this.updateWithCoordinates(place.geometry.location);
			this.extractAndSavePostcode(place);
		} else {
			this.geocoder.geocode({ address: place.name }, (results, status) => {
				if (status == google.maps.GeocoderStatus.OK) {
					const _place = results[0];
					const latlng = _place.geometry.location;
					this.updateWithCoordinates(latlng);
					this.extractAndSavePostcode(_place);
				} else {
					alert("Geocode was not successful for the following reason: " + status);
				}
			});
		}
	}

	updateAddressFields(place) {
		const addressInput = document.getElementById(this.addressId);

		// Update the address input field with the formatted address
		addressInput.value = place.formatted_address;
		addressInput.dispatchEvent(new Event('change'));
	}

	reverseGeocode(latlng) {
		this.geocoder.geocode({ location: latlng }, (results, status) => {
			if (status === google.maps.GeocoderStatus.OK) {
				if (results[0]) {
					const place = results[0];

					// You now have access to the place details
					this.updateAddressFields(place);
					this.extractAndSavePostcode(place);

					// You can also log the place details if needed
					console.log(place);
				} else {
					alert("No results found");
				}
			} else {
				alert("Geocoder failed due to: " + status);
			}
		});
	}


	updateWithCoordinates(latlng) {
		this.map.setCenter(latlng);
		this.map.setZoom(18);
		this.setMarker(latlng);
		this.updateGeolocation(latlng);
	}

	setMarker(latlng) {
		this.marker
			? this.updateMarker(latlng)
			: this.addMarker({ latlng: latlng, draggable: true });
	}

	addMarker(Options) {
		this.marker = new google.maps.Marker({
			map: this.map,
			position: Options.latlng,
		});

		const draggable = Options.draggable || false;
		if (draggable) {
			this.addMarkerDrag(this.marker);
		}
	}

	addMarkerDrag(marker) {
		marker.setDraggable(true);
		google.maps.event.addListener(marker, "dragend", (new_location) => {
			const latlng = new_location.latLng;
			this.updateGeolocation(latlng);

			// Perform reverse geocoding to get the place details for the new location
			this.reverseGeocode(latlng);
		});
	}

	updateMarker(latlng) {
		this.marker.setPosition(latlng);
	}

	clearGeolocation() {
		const geolocationInput = document.getElementById(this.geolocationId);
		geolocationInput.value = '';
	}

	clearPostcode() {
		const postcodeInput = document.getElementById(this.postCodeId);
		postcodeInput.value = '';
	}

	updateGeolocation(latlng) {
		const geolocationInput = document.getElementById(this.geolocationId);
		geolocationInput.value = `${latlng.lat()},${latlng.lng()}`;
		geolocationInput.dispatchEvent(new Event('change'));
	}


	extractAndSavePostcode(place) {
		const addressComponent = place.address_components.find(item => item.types.includes("postal_code"));

		let postcodeValue = '';

		if (addressComponent) {
			// If a postal code is found, format it by removing all white spaces
			const postcode = addressComponent.long_name;
			const regex = new RegExp("\\s+", "g");
			postcodeValue = postcode.replace(regex, "");
		}

		document.getElementById(this.postCodeId).value = postcodeValue;
		document.getElementById(this.postCodeId).dispatchEvent(new Event('change'));
	}
}
