var emitter = require('./emitter');

var MqttClient = function ( )
{
    var _organizationID = 'izto6k';
    var _client = null;

    this.connect = function(device, callback)
    {
        var host = _organizationID + '.messaging.internetofthings.ibmcloud.com';
        _client = new Paho.MQTT.Client( host, 1883, device.clientId );

        _client.connect( {
            userName: 'use-token-auth',
            password: device.authToken,
            timeout: 10000,
            keepAliveInterval: 65535,
            onSuccess: function ()
            {
                this.publishActivate();

                _client.subscribe( 'iot-2/cmd/+/fmt/json', {
                    onSuccess: function ()
                    {
                        console.log( '(MqttClient) subscribe to all commands: success' );
                    },
                    onFailure: function ()
                    {
                        console.log( '(MqttClient) subscribe to all commands: failure' );
                    }
                } );

                emitter.emit( "mqtt-connected" );

                callback && callback( null );
            }.bind( this ),

            onFailure: function (err)
            {
                callback && callback( err.errorMessage  ); // TODO get the actual error
            }
        } );

        _client.onConnectionLost = function ( responseObject )
        {
            // TODO could add some auto-reconnect code here

            if ( responseObject.errorCode !== 0 ) {
                console.log( '(MqttClient) onConnectionLost:' + responseObject.errorMessage );
            }
        };

        _client.onMessageArrived = function ( message )
        {
            var cmd = message.destinationName.split( '/' )[ 2 ];
            var payload = JSON.parse( message.payloadString );

            emitter.emit(cmd, payload);
        };
    };

    function sendMessage ( eventType, payload )
    {
        var message = new Paho.MQTT.Message( payload );
        message.destinationName = 'iot-2/evt/' + eventType + '/fmt/json';

        _client.send( message );
    }

    this.send = function ( message )
    {
        if ( !_client ) {
            console.log( "(MqttClient) mqtt client is not yet connected" );
            return;
        }
        console.log( '(MqttClient) sending: ' + message.destinationName );

        _client.send( message );
    };

    this.publishScore = function ( player, score )
    {
        var payload = '{\"score\":' + score + ', \"player\":\"' + player + '\"}';

        sendMessage( 'score', payload );
    };

    this.publishChat = function ( text )
    {
        var payload = '{\"text\":\"' + text + '\"}';

        sendMessage( 'chat', payload );
    };

    this.publishActivate = function ()
    {
        var payload = '{}';

        sendMessage( 'activate', payload );
    };
};


module.exports = new MqttClient();