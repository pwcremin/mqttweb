// Simple tool that communicates with our server to create and delete devices
var DeviceManager = function ()
{
    var _device = null;

    function deleteCookie()
    {
        var name = 'mqttdevice';
        document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }

    function lookForDeviceInCookie()
    {
        function getCookie( name )
        {
            var value = "; " + document.cookie;
            var parts = value.split( "; " + name + "=" );
            if ( parts.length == 2 ) return parts.pop().split( ";" ).shift();
        }

        var device = null;

        var cookie = getCookie( 'mqttdevice' );
        if ( cookie ) {
            device = JSON.parse( cookie );
        }

        return device;
    }

    this.getDevice = function()
    {
        if(_device == null)
        {
            _device = lookForDeviceInCookie();
        }

        return _device;
    };

    this.deleteDevice = function ( callback )
    {
        console.log( "deleting device: " + _device.deviceId );

        $.ajax( {
            url: '/devices?deviceId=' + _device.deviceId,
            type: 'DELETE'
        }, function ( data )
        {
            callback( data );
        } );

        deleteCookie();
    };

    this.createDevice = function ( deviceId, callback )
    {
        $.getJSON( '/devices/create?deviceId=' + deviceId, null, function ( device )
        {
            if ( device.exception ) {
                console.log( 'createDevice failed: ' + device.message );
                callback( device );
            }
            else {

                _device = device;

                console.log( "New device created: " + _device.clientId );

                document.cookie = 'mqttdevice=' + JSON.stringify(_device);

                callback( null, _device );
            }
        } )
    };
};

module.exports = new DeviceManager();