var request = require( 'request' );

var IotAPI = function ()
{
    var _host = "https://izto6k.internetofthings.ibmcloud.com:443/api/v0002";

    var _authorization = "Basic YS1penRvNmstOWhnZHRuYWx0ZTpYZDJmTzNHdChVeXdfKjIybFU=";

    this.createDevice = function ( deviceId, callback )
    {
        var url = _host + "/device/types/tanks/devices";

        var options = {
            url: _host + "/device/types/tanks/devices",
            method: 'POST',
            headers: {
                "Authorization": _authorization
            },
            json: {
                "deviceId": deviceId
            }
        };

        request( options, function ( error, response, body )
        {
            if ( error ) {
                console.log( error );
            }
            else {
                callback( response.statusCode, body );
            }
        } );
    };

    this.deleteDevice = function ( deviceId, callback )
    {
        var url = _host + "/device/types/tanks/devices";

        var options = {
            url: _host + "/device/types/tanks/devices/" + deviceId,
            method: 'DELETE',
            headers: {
                "Authorization": _authorization
            }
        };

        request( options, function ( error, response, body )
        {
            if ( error ) {
                console.log( error );
            }
            else {
                callback( response.statusCode, body );
            }
        } );
    }
};

module.exports = new IotAPI();