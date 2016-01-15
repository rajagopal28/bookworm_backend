$.ready(function () {
    console.log('Loading-- jQuery');
});
/*

 var socket = io.connect('http://localhost:8080',{transports:['websocket']});
 window.io.connect('ws://localhost:8080', {transports:['websocket']});
 */
var socket = io.connect('http://localhost:8080', {transports: ['websocket']});

pingServer = function (data) {
    // TIP: io() with no args does auto-discovery
    socket.on('connect', function () { // TIP: you can avoid listening on `connect` and listen on events directly too!
        socket.emit('ferret', 'tobi', function (data) {
            console.log(data); // data will be 'woot'
        });
    });

};