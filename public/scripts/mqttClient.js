mqttClient = (function ()
{
    // partially implemented observer
    // TODO find some event manager for this
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

        function subscribeToAllCommands()
        {
            _client.subscribe( 'iot-2/cmd/+/fmt/json', {
                onSuccess: function ()
                {
                    console.log( 'subscribe to all commands: success' );
                },
                onFailure: function ()
                {
                    console.log( 'subscribe to all commands: failure' );
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

        this.connect = function ( clientId, deviceToken, callback )
        {
            var host = _organizationID + '.messaging.internetofthings.ibmcloud.com';

            _client = new Paho.MQTT.Client( host, 1883, clientId );

            _client.connect( {
                userName: 'use-token-auth',
                password: deviceToken,
                timeout: 10000,
                onSuccess: function()
                {
                    subscribeToAllCommands();
                    clientObserver.onMessage("connected")
                    callback(null);
                },
                onFailure: function()
                {
                    console.log( 'failed to connect' );
                    callback({})
                }
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

        connectDevice: function ( device, callback )
        {
            _device = device;

            pahoClient.connect( _device.clientId, _device.authToken, function(error)
            {
                if(!error)
                {
                    this.activateDevice();
                }

                callback(error);
            }.bind(this));
        },

        getDevice: function ()
        {
            console.log( 'device is ' + _device );

            return _device;
        },

        // TODO maybe leave the deleting and creating up to the server?
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

        createDevice: function ( deviceId, callback )
        {
            $.getJSON( '/devices/create?deviceId=' + deviceId, null, function ( data )
            {
                if ( data.exception ) {
                    console.log( 'createDevice failed: ' + data.message );
                    callback( data );
                }
                else {

                    console.log( "New device created: " + data.clientId );

                    this.connectDevice(data);

                    callback( null, _device );
                }
            }.bind(this) );
        },

        // Registers the device with the node-red 'activate' node so that we can easily
        // send commands to all active devices
        activateDevice: function ()
        {
            this.sendMessage( 'activate', '' );
        },

        publishScore: function ( player, score )
        {
            var payload = '{\"score\":' + score + ', \"player\":\"' + player + '\"}';

            this.sendMessage( 'score', payload );
        },

        sendMessage: function ( eventType, payload )
        {
            var message = new Paho.MQTT.Message( payload );
            message.destinationName = 'iot-2/evt/' + eventType + '/fmt/json';

            pahoClient.send( message );
        },

        cmdTypes: {
            highscore: 'highscore',
            message: 'message',
        }
    }
})();