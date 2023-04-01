import './bootstrap';
import maplibregl from 'maplibre-gl'; // or "const maplibregl = require('maplibre-gl');"

class MapLibreDemo {
    constructor(defaultPosition) {
        this.startPosition = defaultPosition;
        this.markersStore = [];
        this.map = null;
        this.destination = [];
        this.lastTime = 0;

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
            zoom: 9
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
        return new Promise((resolve, reject) => {
            this.map.on('load', function () {
                axios.get('/api/getMapCoords/')
                    .then(function (response) {
                        this.markersStore = response.data;
                        // Add the new markers
                        this.markersStore.forEach(function (gpsItem) {
                            gpsItem.markerHandle = new maplibregl.Marker({
                                color: gpsItem.color,
                                draggable: false
                            }).setLngLat(gpsItem.gps)
                                .addTo(this.map);
                            gpsItem.originalSpeed = gpsItem.speed;
                            if (gpsItem.destination !== undefined) {
                                gpsItem.destinationHandle = new maplibregl.Marker({
                                    color: '#FFF80F',
                                    draggable: true
                                }).setLngLat(gpsItem.destination)
                                    .addTo(this.map);
                            }
                        }.bind(this));
                        console.log(this.markersStore);
                    }.bind(this))
                    .catch(function (error) {
                        console.log(error);
                        reject('error!');
                    })
                    .finally(function () {
                        resolve("done!");
                    });
            }.bind(this))
        });
    }

    _calcCrowDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // km
        const dLat = this._toRadians(lat2 - lat1);
        const dLon = this._toRadians(lon2 - lon1);
        lat1 = this._toRadians(lat1);
        lat2 = this._toRadians(lat2);

        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    _calculateNewPosition(lat, lng, bearing, distance) {
        const R = 6371; // Earth Radius in Km

        const lat2 = Math.asin(Math.sin(Math.PI / 180 * lat) * Math.cos(distance / R) + Math.cos(Math.PI / 180 * lat) * Math.sin(distance / R) * Math.cos(Math.PI / 180 * bearing));
        const lon2 = Math.PI / 180 * lng + Math.atan2(Math.sin(Math.PI / 180 * bearing) * Math.sin(distance / R) * Math.cos(Math.PI / 180 * lat), Math.cos(distance / R) - Math.sin(Math.PI / 180 * lat) * Math.sin(lat2));

        return [180 / Math.PI * lon2, 180 / Math.PI * lat2];
    }

    // Converts from degrees to radians.
    _toRadians(degrees) {
        return degrees * Math.PI / 180;
    }

    // Converts from radians to degrees.
    _toDegrees(radians) {
        return radians * 180 / Math.PI;
    }

    _bearing(startLat, startLng, destLat, destLng) {
        startLat = this._toRadians(startLat);
        startLng = this._toRadians(startLng);
        destLat = this._toRadians(destLat);
        destLng = this._toRadians(destLng);

        let y = Math.sin(destLng - startLng) * Math.cos(destLat);
        let x = Math.cos(startLat) * Math.sin(destLat) -
            Math.sin(startLat) * Math.cos(destLat) * Math.cos(destLng - startLng);
        let brng = Math.atan2(y, x);
        brng = this._toDegrees(brng);
        return (brng + 360) % 360;
    }

    animateMarkers(timestamp) {
        if (this.markersStore !== undefined) {
            this.markersStore.forEach(function (marker) {
                if (marker.destinationHandle !== undefined) {
                    const dLngLat = marker.destinationHandle.getLngLat()
                    marker.destination = [dLngLat.lng, dLngLat.lat];
                }

                if (this._calcCrowDistance(marker.gps[1], marker.gps[0], marker.destination[1], marker.destination[0]) > 0.01) {
                    const speed = marker.speed;
                    const distance = ((speed / 100) * ((timestamp - this.lastTime) / 1000));
                    const bearing = this._bearing(marker.gps[1], marker.gps[0], marker.destination[1], marker.destination[0])
                    marker.gps = this._calculateNewPosition(marker.gps[1], marker.gps[0], bearing, distance);

                    marker.markerHandle.setLngLat(marker.gps);
                    if (this._calcCrowDistance(marker.gps[1], marker.gps[0], marker.destination[1], marker.destination[0]) < 0.01) {
                        console.log("I've arrived!");
                        marker.speed = 0;
                    } else {
                        marker.speed = marker.originalSpeed;
                    }
                }
            }.bind(this));
            this.lastTime = timestamp;
        }
        requestAnimationFrame(this.animateMarkers.bind(this));
    }
}

let mapLibreDemo = new MapLibreDemo([-0.957996, 50.851143]);
mapLibreDemo.startMaps();
mapLibreDemo.addMarkers().then(function () {
    console.log('go!');
    mapLibreDemo.animateMarkers(0);
}, function () {
    console.log('oops');
});
