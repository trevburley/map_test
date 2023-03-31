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
            style: 'https://api.maptiler.com/maps/streets/style.json?key=xlnKLcf8f5xsjrStjvL0',
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
