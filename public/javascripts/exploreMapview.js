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

// YELP API

// getBusinessDetails function
async function getBusinessDetails(term, lon, lat) {
    //make call to /api/business-details/lon/lat/term
    const query = await fetch(`/api/business-details/${lon}/${lat}/${term}`, {method: 'GET'});
    const data = await query.json();
    console.log(data);
    // return the data
    return data;
}

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
        let name = poi.properties.name;
        item.textContent = name;
        item.classList.add('text-sm');
        // add the lon and lat as data attributes
        item.setAttribute('data-lon', poi.geometry.coordinates[0]);
        item.setAttribute('data-lat', poi.geometry.coordinates[1]);
        // add a click event listener to each item
        item.addEventListener('click', async (event) => {
            // get the name of the clicked item
            const name = event.target.textContent;
            // get the lon and lat from the clicked item
            const lon = event.target.getAttribute('data-lon');
            const lat = event.target.getAttribute('data-lat');
            // set the map center to the clicked item
            map.setCenter([lon, lat]);
            // remove the marker
            marker.remove();
            // add a marker to the clicked item
            marker.setLngLat([lon, lat]).addTo(map);
            // call the businesses API
            let data = await getBusinessDetails(name, lon, lat);

            // try to remove the popup
            try {
                marker.getPopup().remove();
            } catch (error) {
                console.log(error);
            }

            
            let title = `<h3 class="text-base underline">${name}</h3>`;
            let image = '';
            let body = '';

            try {
                image = `<img class="w-full h-32 object-cover overflow-hidden" src="${data.businesses[0].image_url}" alt="business image">`;
                body = `<div class="flex items-center">
                                <svg class="w-4 h-4 text-yellow-300 mr-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 22 20">
                                    <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z"/>
                                </svg>
                                <p class="ml-2 text-sm font-bold text-gray-900 dark:text-white">${data.businesses[0].rating}</p>
                                <span class="w-1 h-1 mx-1.5 bg-gray-500 rounded-full dark:bg-gray-400"></span>
                                <p class="text-sm font-medium text-gray-900 dark:text-white">${data.businesses[0].review_count} reviews</p>
                            </div>
                            <p class="text-sm">Closed: ${data.businesses[0].is_closed}</p>
                            
                            <p class="text-sm">Price: ${data.businesses[0].price}</p>
                            <p class="text-sm">Phone: ${data.businesses[0].phone}</p>
                            <p class="text-sm">Address: ${data.businesses[0].location.address1}, ${data.businesses[0].location.zip_code} ${data.businesses[0].location.city}</p>
                            <br>
                            <a class="text-sm" href="${data.businesses[0].url}" target="_blank">Visit Yelp Site</a>`;
            } catch (error) {
                console.log(error);
            }
            

            // check if the image is undefined or null or empty
            if (data.businesses == undefined || data.businesses.length == 0 || data.businesses[0].image_url == undefined || data.businesses[0].image_url == null || data.businesses[0].image_url == '') {
                const popup = new mapboxgl.Popup({offset: 25}).setHTML(
                    `${title}`
                );
                // add the popup to the marker
                marker.setPopup(popup);
                // open the popup
                popup.addTo(map);
            } else {
                const popup = new mapboxgl.Popup({offset: 25}).setHTML(
                    `${image}${title}${body}`
                );
                // add the popup to the marker
                marker.setPopup(popup);
                // open the popup
                popup.addTo(map);
            }
            
        });
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