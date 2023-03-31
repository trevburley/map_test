import './bootstrap';
import maplibregl from 'maplibre-gl'; // or "const maplibregl = require('maplibre-gl');"

class MapLibreDemo {
    constructor(defaultPosition) {
        this.startPosition = defaultPosition;
        this.markersStore = [];
        this.map = null;

        this.getLocation();
    }

    getLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                this.startPosition = [position.coords.longitude, position.coords.latitude];
            }.bind(this));
        } else {
            console.log("Geolocation is not supported by this browser.");
        }
    }

    startMaps() {
        this.map = new maplibregl.Map({
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
            center: this.startPosition,
            zoom: 11
        });

        this.map.addControl(
            new maplibregl.NavigationControl({
                visualizePitch: true,
                showZoom: true,
                showCompass: true
            })
        );

        this.map.addControl(
            new maplibregl.TerrainControl({
                source: 'terrainSource',
                exaggeration: 1
            })
        );
    }

    addMarkers() {
        window.setInterval(function () {
                if (this.map !== null) {
                    axios.get('/api/getMapCoords/')
                        .then(function (response) {
                            const markers = response.data;
                            this.markersStore.forEach(function (m) {
                                console.log('Removing', m);
                                m.remove();
                            });

                            // Reset the array
                            this.markersStore = [];

                            // Add the new markers
                            markers.forEach(function (gpsItem) {
                                let marker = new maplibregl.Marker({
                                    color: gpsItem.color,
                                    draggable: false
                                }).setLngLat(gpsItem.gps)
                                    .addTo(this.map);

                                this.markersStore.push(marker);

                                console.log('New Markers: ', this.markersStore);
                            }.bind(this));
                        }.bind(this))
                        .catch(function (error) {
                            console.log(error);
                        });
                }
            }.bind(this)
            , 1000);
    }
}

let mapLibreDemo = new MapLibreDemo([-0.957996, 50.851143]);
mapLibreDemo.startMaps();
mapLibreDemo.addMarkers();
