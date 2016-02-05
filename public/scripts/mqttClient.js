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

            clientObserver.onMessage("connected", {});
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

    var _device = null;

    return {
        registerListener: clientObserver.registerListener.bind( clientObserver ),

        setDevice: function(device)
        {
            _device = device;

            pahoClient.connect( _device.clientId, _device.authToken );
        },

        getDevice: function ()
        {
            console.log('device is ' + _device);
            return _device;
        },

        deleteDevice: function ( callback )
        {
            console.log( "deleting device: " + _device.deviceId );

            $.ajax( {
                url: '/devices?deviceId=' + _device.deviceId,
                type: 'DELETE',
            }, function ( data )
            {
                callback( data )
            } );
        },

        createDevice: function ( name, callback )
        {
            $.getJSON( '/devices/create?deviceId=' + deviceId, null, function ( data )
            {
                if ( data.exception ) {
                    console.log( data.message )
                    callback( data )
                }
                else {

                    _device = data;

                    console.log( "New device created: " + _device.clientId + ' : ' + _device.authToken );

                    pahoClient.connect( _device.clientId, _device.authToken );

                    callback( null, _device );
                }
            } );

        },

        publishScore: function ( player, score )
        {
            var payload = '{\"score\":' + score + ', \"player\":\"' + player + '\"}';
            var message = new Paho.MQTT.Message( payload );
            message.destinationName = 'iot-2/evt/score/fmt/json';

            pahoClient.send( message );
        },

        cmdTypes: {
            highscore: 'highscore',
            message: 'message',
        }
    }
})();