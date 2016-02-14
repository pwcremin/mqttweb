var deviceManager = require( '../libs/deviceManager' ),
    mqttClient = require( '../libs/mqttClient' ),
    emitter = require( '../libs/emitter' ),
    React = require('react'),
    ReactBootstrap = require('react-bootstrap');

//React.render( React.createElement( CandidateBox, null ), document.getElementById( 'content' ) );

var ButtonGroup = ReactBootstrap.ButtonGroup,
    Button = ReactBootstrap.Button,
    Table = ReactBootstrap.Table,
    Input = ReactBootstrap.Input,
    Grid = ReactBootstrap.Grid,
    Row = ReactBootstrap.Row,
    Col = ReactBootstrap.Col,
    Panel = ReactBootstrap.Panel,
    Well = ReactBootstrap.Well,
    ButtonInput = ReactBootstrap.ButtonInput;


var UserNameInput = React.createClass( {

    getInitialState()
    {
        return {
            name: '',
            failureMsg: '',
            visible: true
        }
    },

    componentWillMount()
    {
        emitter.addListener( 'mqtt-connected', function ()
        {
            this.setState( { visible: false } );
        }.bind( this ) );

        var device = deviceManager.getDevice();
        if ( device )
        {
            mqttClient.connect( device );
        }
    },

    handleNameChange() {
        this.setState( {
            name: this.refs.name.getValue()
        } );
    },

    onCreateUser()
    {
        var deviceId = this.refs.name.getValue();

        deviceManager.createDevice( deviceId, function ( error, device )
        {
            if ( error )
            {
                this.setState( { failureMsg: error.message } );
            }
            else
            {
                mqttClient.connect( device );

                this.setState( { failureMsg: '' } );
            }
        }.bind( this ) );
    },


    render(){
        var device = deviceManager.getDevice();
        var deviceId = device && device.deviceId;

        var title = <h3>User Management</h3>

        return (
            <div>
                <div style={{ display: this.state.visible ? 'none' : 'block'}}>
                    <Panel header={title} bsStyle="primary" style={{margin: 50}}>
                        Hi {deviceId}!
                    </Panel>
                </div>
                <div style={{display: this.state.visible ? 'block' : 'none'}}>
                    <Panel header={title} bsStyle="primary" style={{margin:50}}>
                        <Well>
                            Using the IoT Platform API we can easily create devices.  In a hackathon
                            you can use these devices to easily mock user management for a multi-user
                            app such as a chat room or a multi player game.
                        </Well>
                        <Row bordered>
                            <Col xs={6} lg={3}>
                                <Input
                                    type='text'
                                    value={this.state.playerValue}
                                    placeholder='bubba'
                                    label='User Name: '
                                    help=''
                                    hasFeedback
                                    ref='name'
                                    onChange={this.handleNameChange}
                                    style={{width:100, margin: 5}}
                                />
                            </Col>
                            <Col xs={6} lg={3}>

                                <ButtonInput onClick={this.onCreateUser} type='submit' value='create' bsSize='small'
                                             disabled={false}/>
                            </Col>
                        </Row>
                        <div><font color="red">{this.state.failureMsg}</font></div>
                    </Panel>
                </div>
            </div>
        )
    }
} );

var UserBox = React.createClass( {

    render ()
    {
        return (
            <div>
                <UserNameInput/>
            </div>
        );
    }
} );

module.exports = UserBox;

