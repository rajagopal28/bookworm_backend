/*

 var socket = io.connect('http://localhost:8080',{transports:['websocket']});
 window.io.connect('ws://localhost:8080', {transports:['websocket']});
 */
var BOOKWORM_APPLICATION_HOST = 'http://127.0.0.1:8080';
var hostname = location.hostname;
var protocol = location.protocol;
var SOCKET_OPTIONS = {
    SECURE : {
        PROTOCOL : 'wss',
        PORT : 8443
    },
    NORMAL : {
        PROTOCOL : 'ws',
        PORT : 8000
    }
};
if (hostname !== '127.0.0.1') {
    // For OpenShift Deployment socket connection
    var option = 'https:' === protocol ? SOCKET_OPTIONS.SECURE : SOCKET_OPTIONS.NORMAL;
    BOOKWORM_APPLICATION_HOST = option.PROTOCOL
                                    + '://'
                                    + hostname
                                    + ':'
                                    + option.PORT;
}
var socket = io.connect(BOOKWORM_APPLICATION_HOST, {transports: ['websocket']});

pingServer = function (data) {
    // TIP: io() with no args does auto-discovery
    socket.on('connect', function () { // TIP: you can avoid listening on `connect` and listen on events directly too!
        socket.emit('ferret', 'tobi', function (data) {
            // console.log(data); // data will be 'woot'
        });
    });

};
