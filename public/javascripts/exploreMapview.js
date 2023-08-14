mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;
const map = new mapboxgl.Map({
    container: 'map', // Specify the container ID
    style: 'mapbox://styles/m4xw3ll/cll6pdvz800ma01pm40bk3bz3', // Specify which map style to use
    center: [
        -77.0369, 38.895
    ], // Specify the starting position
    zoom: 11.5, // Specify the starting zoom
});

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

// ISOCHROME API 

// Create constants to use in getIso()
const urlBase = 'https://api.mapbox.com/isochrone/v1/mapbox/';
let lon = -77.034;
let lat = 38.899;
let profile = 'driving';
let minutes = 10;

function outputPOIs(pois) {
    const list = document.getElementById('pois-list');
    list.innerHTML = '';
    pois.forEach((poi) => {
        const item = document.createElement('li');
        item.textContent = poi.properties.name;
        item.classList.add('text-sm');
        list.appendChild(item);
    });
    // add it to the html

}

// Create a function that sets up the Isochrone API query then makes an fetch call
async function getIso() {
    const query = await fetch(
        `${urlBase}${profile}/${lon},${lat}?contours_minutes=${minutes}&polygons=true&denoise=1&access_token=${mapboxgl.accessToken}`,
        {method: 'GET'}
    );
    const data = await query.json();
    // Set the 'iso' source's data to what's returned by the API query
    map
        .getSource('iso')
        .setData(data);

    console.log(data);

    // extract all POIs from the layer in the area of the returned isochrome 
    const pois = await map.queryRenderedFeatures({layers: ['poi-label']});
    console.log(pois);
    
    // output the POIs to the HTML
    outputPOIs(pois);
}
const marker = new mapboxgl.Marker({color: '#314ccd'});

// Create a LngLat object to use in the marker initialization
// https://docs.mapbox.com/mapbox-gl-js/api/#lnglat
const lngLat = {
    lon: lon,
    lat: lat
};

map.on('click', (event) => {
    // remove the marker
    marker.remove();
    // When the map is clicked, set the lng and lat constants
    // equal to the lng and lat properties in the returned lngLat object.
    lon = event.lngLat.lng;
    lat = event.lngLat.lat;
    console.log(`${lon}, ${lat}`);
    // Update the marker to the new coordinates
    marker.setLngLat([lon, lat]).addTo(map);
    // get the new isochrone
    getIso();
});

map.on('load', () => {
    // When the map loads, add the source and layer
    map.addSource('iso', {
        type: 'geojson',
        data: {
            type: 'FeatureCollection',
            features: []
        }
    });

    map.addLayer({
        id: 'isoLayer', type: 'fill',
        // Use "iso" as the data source for this layer
        source: 'iso',
        layout: {},
        paint: {
            // The fill color for the layer is set to a light purple
            'fill-color': '#5a3fc0',
            'fill-opacity': 0.3
        }
    }, 'poi-label');

    // Initialize the marker at the query coordinates
    // marker.setLngLat(lngLat).addTo(map);


    // Make the API call
    // getIso();
});

// Target the "params" form in the HTML portion of your code
const params = document.getElementById('params');

// When a user changes the value of profile or duration by clicking a button, change the parameter's value and make the API query again
params.addEventListener('change', (event) => {
  if (event.target.name === 'profile') {
    profile = event.target.value;
  } else if (event.target.name === 'duration') {
    minutes = event.target.value;
  }
  getIso();
});

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