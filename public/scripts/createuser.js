// Create a client instance


//React.render( React.createElement( ScoreBox, null ), document.getElementById( 'content' ) );

var ButtonGroup = ReactBootstrap.ButtonGroup,
    Button = ReactBootstrap.Button,
    Table = ReactBootstrap.Table,
    Input = ReactBootstrap.Input,
    Grid = ReactBootstrap.Grid,
    Row = ReactBootstrap.Row,
    Col = ReactBootstrap.Col,
    Panel = ReactBootstrap.Panel,
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
        var device = this.lookForDeviceInCookie();

        if ( device ) {
            mqttClient.setDevice( device )
            this.setState( { visible: false } )
        }

        mqttClient.registerListener( "connected", function ()
        {
            this.setState( { visible: false } )
        }.bind( this ) )
    },

    handleNameChange() {
        this.setState( {
            name: this.refs.name.getValue()
        } );
    },

    onCreateUser()
    {
        var name = this.refs.name.getValue();

        mqttClient.createDevice( name, function ( error )
        {
            if ( error ) {
                this.setState( { failureMsg: error.message } )
            }
            else {
                this.setState( { failureMsg: '' } )
                console.log( 'user created' )
            }
        }.bind( this ) );
    },

    getCookie( name ) {
        var value = "; " + document.cookie;
        var parts = value.split( "; " + name + "=" );
        if ( parts.length == 2 ) return parts.pop().split( ";" ).shift();
    },

    lookForDeviceInCookie()
    {
        return null;

        var device = null;

        var cookie = this.getCookie( 'mqttdevice' );
        if ( cookie ) {
            device = JSON.parse( cookie );
        }

        return device;
    },

    render(){
        var device = mqttClient.getDevice();
        var deviceId = device ? device.deviceId : "";

        return (
            <div>
                <div style={{ display: this.state.visible ? 'none' : 'block'}}>
                    <Panel header="User" style={{margin: 50}}>
                        Hi {deviceId}!
                    </Panel>
                </div>
                <div style={{display: this.state.visible ? 'block' : 'none'}}>
                    <Panel header="First create a user (this will create your device)" style={{margin:50}}>
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
    displayName: 'UserBox',

    render ()
    {
        return (
            <div>
                <UserNameInput/>
            </div>
        );
    }
} );

ReactDOM.render( <UserBox/>, document.getElementById( 'createuser' ) );

