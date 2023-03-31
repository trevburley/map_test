import './bootstrap';
import maplibregl from 'maplibre-gl'; // or "const maplibregl = require('maplibre-gl');"

let startPosition = [-0.957996, 50.851143];
let markersStore = [];

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(getPosition);
    } else {
        console.log("Geolocation is not supported by this browser.");
    }
}

function getPosition(position) {
    startPosition = [position.coords.longitude, position.coords.latitude];
}

window.onload = function () {
    getLocation();

    const map = new maplibregl.Map({
        container: 'map',
        style: {
            version: 8,
            sources: {
                osm: {
                    type: 'raster',
                    tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'],
                    tileSize: 256,
                    attribution: '&copy; OpenStreetMap Contributors',
                    maxzoom: 19
                },
                terrainSource: {
                    type: 'raster-dem',
                    url: 'https://demotiles.maplibre.org/terrain-tiles/tiles.json',
                    tileSize: 256
                },
                hillshadeSource: {
                    type: 'raster-dem',
                    url: 'https://demotiles.maplibre.org/terrain-tiles/tiles.json',
                    tileSize: 256
                }
            },
            layers: [
                {
                    id: 'osm',
                    type: 'raster',
                    source: 'osm'
                },
                {
                    id: 'hills',
                    type: 'hillshade',
                    source: 'hillshadeSource',
                    layout: {visibility: 'visible'},
                    paint: {'hillshade-shadow-color': '#473B24'}
                }
            ],
            terrain: {
                source: 'terrainSource',
                exaggeration: 1
            }
        },
        center: startPosition,
        zoom: 11
    });

    map.addControl(
        new maplibregl.NavigationControl({
            visualizePitch: true,
            showZoom: true,
            showCompass: true
        })
    );

    map.addControl(
        new maplibregl.TerrainControl({
            source: 'terrainSource',
            exaggeration: 1
        })
    );

    map.on('load', function () {
        window.setInterval(function () {
                axios.get('/api/getMapCoords/')
                    .then(function (response) {
                        placeMarkers(response.data);
                    })
                    .catch(function (error) {
                        console.log(error);
                    });
            }
            , 1000);
    });

    function placeMarkers(markers) {
        markersStore.forEach(function (m) {
            console.log('Removing', m);
            m.remove();
        });

        // Reset the array
        markersStore = [];

        // Add the new markers
        markers.forEach(function (gpsItem) {
            let marker = new maplibregl.Marker({
                color: gpsItem.color,
                draggable: false
            }).setLngLat(gpsItem.gps)
                .addTo(map);
            markersStore.push(marker);

            console.log('New Markers: ', markersStore);
        });
    }
}
