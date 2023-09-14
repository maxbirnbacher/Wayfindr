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

map.addControl(
    new MapboxDirections({
        accessToken: mapboxgl.accessToken,
        unit: 'metric',
        congestion: true,
        alternatives: true,
        routePadding: 60,
        interactive: true,
    }),
    'top-left'
);

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