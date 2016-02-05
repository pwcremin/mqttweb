mqttClient = (function ()
{
    // partially implemented observer
    var clientObserver = {
        _subs: [],
        registerListener: function ( cmd, func )
        {
            if ( !this._subs[ cmd ] ) {
                this._subs[ cmd ] = [];
            }

            this._subs[ cmd ].push( func )
        },

        onMessage: function ( cmd, payload )
        {
            console.log( 'onMessageArrived:' + cmd );

            this._subs[ cmd ] && this._subs[ cmd ].forEach( function ( func )
            {
                func( payload )
            } )
        }
    };

    var PahoClient = function ()
    {
        var _organizationID = 'izto6k';
        var _client = null;

        function onFailure( e )
        {
            console.log( 'failed to connect' );
        }

        // called when the client connects
        function onConnect()
        {
            // Once a connection has been made, make a subscription and send a message.
            console.log( 'onConnect' );

            _client.subscribe( 'iot-2/cmd/+/fmt/json', {
                qos: 0,
                onSuccess: function ()
                {
                    console.log( 'subscribe success' );
                },
                onFailure: function ()
                {
                    console.log( 'subscribe failure' );
                }

            } );
        }

        // called when the client loses its connection
        function onConnectionLost( responseObject )
        {
            if ( responseObject.errorCode !== 0 ) {
                console.log( 'onConnectionLost:' + responseObject.errorMessage );
            }
        }

        this.send = function ( message )
        {
            if ( !_client ) {
                console.log( "mqtt client is not yet connected" );
                return;
            }

            _client.send( message );
            console.log( 'message sent: ' + message.destinationName );
        };

        this.connect = function ( clientId, deviceToken )
        {
            var host = _organizationID + '.messaging.internetofthings.ibmcloud.com';

            _client = new Paho.MQTT.Client( host, 1883, clientId );

            _client.connect( {
                userName: 'use-token-auth',
                password: deviceToken,
                timeout: 10000,
                onSuccess: onConnect,
                onFailure: onFailure
            } );

            _client.onConnectionLost = onConnectionLost;
            _client.onMessageArrived = function ( message )
            {
                var cmdType = message.destinationName.split( '/' )[ 2 ];
                var payload = JSON.parse( message.payloadString );

                clientObserver.onMessage( cmdType, payload );
            };
        }
    };

    //---------------------------

    var pahoClient = new PahoClient();

    function makeid()
    {
        var id = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for ( var i = 0; i < 5; i++ )
            id += possible.charAt( Math.floor( Math.random() * possible.length ) );

        return id;
    }

    function createDevice( deviceId, callback )
    {
        $.getJSON( '/devices/create?deviceId=' + deviceId, null, function ( data )
        {
            callback( data );
        } );
    }


    createDevice( makeid(), function ( deviceData )
    {
        console.log( "New device created: " + deviceData.clientId + ' : ' + deviceData.authToken );

        pahoClient.connect( deviceData.clientId, deviceData.authToken );
    } );


    return {
        registerListener: clientObserver.registerListener.bind( clientObserver ),
        publishScore: function ( player, score )
        {
            var payload = '{\"score\":' + score + ', \"player\":\"' + player + '\"}'; //JSON.stringify({'message':'hi'});
            var message = new Paho.MQTT.Message( payload );
            message.destinationName = 'iot-2/evt/score/fmt/json';

            pahoClient.send( message );
        },

        cmdTypes: {
            highscore: 'highscore',
            message: 'message'
        }
    }
})();