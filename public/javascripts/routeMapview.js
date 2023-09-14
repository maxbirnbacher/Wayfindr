mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;
const map = new mapboxgl.Map({
    container: 'map',
    // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
    style: 'mapbox://styles/m4xw3ll/cll6pdvz800ma01pm40bk3bz3',
    center: [
        -79.4512, 43.6568
    ],
    zoom: 13
});

map.addControl(new mapboxgl.NavigationControl());

// get the url parameter destination
const destination = document.getElementById('routeMapview').getAttribute('destination').split(',');
// get the url parameter travelmode
const travelmode = document.getElementById('routeMapview').getAttribute('travelmode');

// Add geolocate control to the map.
map.addControl(new mapboxgl.GeolocateControl({
    positionOptions: {
        enableHighAccuracy: true
    },
    // When active the map will receive updates to the device's location as it
    // changes.
    trackUserLocation: true,
    // Draw an arrow next to the location dot to indicate which direction the device
    // is heading.
    showUserHeading: true
}));

const coordinatesGeocoder = function (query) {
    // Match anything which looks like decimal degrees coordinate pair.
    const matches = query.match(
        /^[ ]*(?:Lat: )?(-?\d+\.?\d*)[, ]+(?:Lng: )?(-?\d+\.?\d*)[ ]*$/i
    );
    if (!matches) {
        return null;
    }

    function coordinateFeature(lng, lat) {
        return {
            center: [
                lng, lat
            ],
            geometry: {
                type: 'Point',
                coordinates: [lng, lat]
            },
            place_name: 'Lat: ' + lat + ' Lng: ' + lng,
            place_type: ['coordinate'],
            properties: {},
            type: 'Feature'
        };
    }

    const coord1 = Number(matches[1]);
    const coord2 = Number(matches[2]);
    const geocodes = [];

    if (coord1 < -90 || coord1 > 90) {
        // must be lng, lat
        geocodes.push(coordinateFeature(coord1, coord2));
    }

    if (coord2 < -90 || coord2 > 90) {
        // must be lat, lng
        geocodes.push(coordinateFeature(coord2, coord1));
    }

    if (geocodes.length === 0) {
        // else could be either lng, lat or lat, lng
        geocodes.push(coordinateFeature(coord1, coord2));
        geocodes.push(coordinateFeature(coord2, coord1));
    }

    return geocodes;
};


let directions = new MapboxDirections({
    accessToken: mapboxgl.accessToken,
    unit: 'metric',
    congestion: true,
    alternatives: true,
    routePadding: 60,
    interactive: false,
    steps: true,
    profile: travelmode,
    banner_instructions: true,
    geocoder: {
        localGeocoder: coordinatesGeocoder,
        reverseGeocode: true
    }
});

map.addControl(directions, 'top-left');

map.on('style.load', () => {
    // Insert the layer beneath any symbol layer.
    const layers = map
        .getStyle()
        .layers;
    const labelLayerId = layers
        .find(
            (layer) => layer.type === 'symbol' && layer.layout['text-field']
        )
        .id;

    // The 'building' layer in the Mapbox Streets vector tileset contains building
    // height data from OpenStreetMap.
    map.addLayer({
        'id': 'add-3d-buildings',
        'source': 'composite',
        'source-layer': 'building',
        'filter': [
            '==', 'extrude', 'true'
        ],
        'type': 'fill-extrusion',
        'minzoom': 15,
        'paint': {
            'fill-extrusion-color': '#aaa',

            // Use an 'interpolate' expression to add a smooth transition effect to the
            // buildings as the user zooms in.
            'fill-extrusion-height': [
                'interpolate',
                ['linear'],
                ['zoom'],
                15,
                0,
                15.05,
                [
                    'get', 'height'
                ]
            ],
            'fill-extrusion-base': [
                'interpolate',
                ['linear'],
                ['zoom'],
                15,
                0,
                15.05,
                [
                    'get', 'min_height'
                ]
            ],
            'fill-extrusion-opacity': 0.6
        }
    }, labelLayerId);
});

// after the content of the page is loaded, add the destination to the destination input field. The input field is located in a div with the class mapboxgl-ctrl-geocoder witch is located in a div with the id mapbox-directions-destination-input
document.addEventListener('DOMContentLoaded', function () {
    // set the destination
    destinationArray = [destination[1], destination[0]];
    directions.setDestination(destinationArray);
});
