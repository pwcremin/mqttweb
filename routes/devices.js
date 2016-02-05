var iotApi = require( '../iotApi' );
var express = require( 'express' );
var router = express.Router();

/* GET users listing. */
router.get( '/create', function ( req, res, next )
{
    var deviceId = req.query.deviceId;

    if(!deviceId)
    {
        res.status(500).send();
        return;
    }

    iotApi.createDevice(deviceId, function(status, data)
    {
        res.json( data );
    })

} );

router.delete( '/', function ( req, res, next )
{
    var deviceId = req.query.deviceId;

    if(!deviceId)
    {
        res.status(500).send();
        return;
    }

    iotApi.deleteDevice(deviceId, function(status, data)
    {
        res.json( data );
    })

} );

module.exports = router;
