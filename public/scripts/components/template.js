var deviceManager = require( '../libs/deviceManager' ),
    mqttClient = require( '../libs/mqttClient' ),
    emitter = require( '../libs/emitter' ),
    React = require('react'),
    ReactBootstrap = require('react-bootstrap');

var ButtonGroup = ReactBootstrap.ButtonGroup,
    Button = ReactBootstrap.Button,
    Table = ReactBootstrap.Table,
    Input = ReactBootstrap.Input,
    Grid = ReactBootstrap.Grid,
    Row = ReactBootstrap.Row,
    Col = ReactBootstrap.Col,
    Well = ReactBootstrap.Well,
    Panel = ReactBootstrap.Panel,
    ButtonInput = ReactBootstrap.ButtonInput,
    ListGroup = ReactBootstrap.ListGroup,
    ListGroupItem = ReactBootstrap.ListGroupItem;

var TemplateInput = React.createClass( {


    getInitialState()
    {
        return {
            value: ''
        }
    },

    handleValueChange() {
        this.setState( {
            scoreValue: this.refs.score.getValue()
        } );
    },

    onSend()
    {
        var input = this.refs.input.getValue();

        //mqttClient.publishScore( input, score );

        this.setState( {
            value: ''
        } );
    },

    render(){
        return (
            <div>
                <Row bordered>
                    <Col xs={6} lg={3}>
                        <Input
                            type='text'
                            value={this.state.scoreValue}
                            placeholder='1000'
                            label='Input: '
                            help=''
                            //bsStyle={this.validationState()}
                            hasFeedback
                            ref='input'
                            onChange={this.handleValueChange}
                            style={{width:100, margin: 5}}
                        />
                        <ButtonInput onClick={this.onSend} type='submit' value='send new score' bsSize='small'
                                     disabled={false}/>
                    </Col>
                </Row>

                <div><font color="red">{this.state.error}</font></div>
            </div>
        )
    }
} );

var TemplateBox = React.createClass( {

    getInitialState()
    {
        return {
            visible: false,
            messages: []
        }
    },

    componentWillMount()
    {
        emitter.addListener( "mqtt-connected", function ()
        {
            this.setState( { visible: true } )
        }.bind( this ) );

        var cmdType = "junk";
        emitter.addListener( cmdType, this.onCommand );
    },

    onCommand( message )
    {
        console.log( "new command " );

        //this.setState( { messages: messages } );
    },

    render ()
    {
        var title = <h3>Template</h3>
        return (
            <div style={{ margin:50, display: this.state.visible ? 'block' : 'none'}}>
                <Panel header={title} bsStyle="danger" header="Template">
                </Panel>
            </div>
        );
    }
} );

module.exports = TemplateBox;

