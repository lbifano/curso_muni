var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        $('#mapid').height(window.innerHeight-$('nav').height());
        var mymap = L.map('mapid').setView([-34.878456, -57.887499], 13);

        L.tileLayer('tiles/{z}/{x}/{y}.png', {
          minZoom: 11,
          zoom: 10,
          maxZoom: 16,
          zoomControl: false

        }).addTo(mymap);

        mymap.addControl( L.control.zoom({'position': 'bottomright'}));
        //L.control.zoom({'position': 'topright'}).addTo(mymap);
        var popup = L.popup();

        function onMapClick(e) {
            popup
                .setLatLng(e.latlng)
                .setContent("You clicked the map at " + e.latlng.toString())
                .openOn(mymap);
        }

        mymap.on('click', onMapClick);
        $('.leaflet-top.leaflet-left .leaflet-control-zoom').remove();
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};
