/**
 * Created by patrickcremin on 2/9/16.
 */

var mqttClient = require( './libs/mqttClient' ),
    deviceManager = require( './libs/deviceManager' ),
    React = require( 'react' ),
    ReactDom = require( 'react-dom' ),
    User = require( './components/user' ),
    HighScore = require('./components/highscore' ),
    Chat = require('./components/chat' );



ReactDom.render( <User/>, document.getElementById( 'user' ) );
ReactDom.render( <HighScore />, document.getElementById( 'highscore' ) );
ReactDom.render( <Chat />, document.getElementById( 'chat' ) );