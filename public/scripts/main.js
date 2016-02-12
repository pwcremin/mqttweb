/**
 * Created by patrickcremin on 2/9/16.
 */
var css = require('./main.css');

var mqttClient = require( './libs/mqttClient' ),
    deviceManager = require( './libs/deviceManager' ),
    React = require( 'react' ),
    ReactDom = require( 'react-dom' ),
    User = require( './components/user' ),
    HighScore = require('./components/highscore' ),
    Chat = require('./components/chat' ),
    Candidate = require('./components/candidateScore');



ReactDom.render( <User/>, document.getElementById( 'user' ) );
ReactDom.render( <HighScore />, document.getElementById( 'highscore' ) );
ReactDom.render( <Chat />, document.getElementById( 'chat' ) );
ReactDom.render( <Candidate />, document.getElementById( 'candidate' ) );