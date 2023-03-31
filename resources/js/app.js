import './bootstrap';
import maplibregl from 'maplibre-gl'; // or "const maplibregl = require('maplibre-gl');"

let startPosition = [-0.957996, 50.851143];

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
// Use a different source for terrain and hillshade layers, to improve render quality
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
    center: startPosition, // starting position [lng, lat]
    zoom: 11 // starting zoom
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

let markers = [
    {
        gps: [-0.957996, 50.851143],
        color: '#bd0000'
    },
    {
        gps: [-0.984861, 50.849422],
        color: '#bd0000'
    }
]

map.on('load', function () {
    markers.forEach(function (gpsItem) {
        console.log(gpsItem);
        new maplibregl.Marker({
            color: gpsItem.color,
            draggable: false
        }).setLngLat(gpsItem.gps)
            .addTo(map);
    });
});
