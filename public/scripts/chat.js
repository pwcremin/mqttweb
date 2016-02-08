// Create a client instance


//React.render( React.createElement( ChatBox, null ), document.getElementById( 'content' ) );

var ButtonGroup = ReactBootstrap.ButtonGroup,
    Button = ReactBootstrap.Button,
    Table = ReactBootstrap.Table,
    Input = ReactBootstrap.Input,
    Grid = ReactBootstrap.Grid,
    Row = ReactBootstrap.Row,
    Col = ReactBootstrap.Col,
    Panel = ReactBootstrap.Panel,
    ButtonInput = ReactBootstrap.ButtonInput,
    ListGroup = ReactBootstrap.ListGroup,
    ListGroupItem = ReactBootstrap.ListGroupItem;


var ChatInput = React.createClass( {
    getInitialState()
    {
        return { value: '' }
    },

    componentDidMount()
    {
    },

    handleChange() {
        this.setState( {
            value: this.refs.text.getValue()
        } );
    },

    onClick()
    {
        var text = this.refs.text.getValue();

        mqttClient.publishChat( text );

        this.setState( {
            value: '',
            error: ''
        } );
    },

    render ()
    {
        return (
            <div>
                <Input
                    type='text'
                    value={this.state.value}
                    placeholder=''
                    label=''
                    help=''
                    //bsStyle={this.validationState()}
                    hasFeedback
                    ref='text'
                    onChange={this.handleChange}
                    style={{width:250, margin: 5}}
                />
                <ButtonInput onClick={this.onClick} type='submit' value='send' bsSize='small'
                             disabled={false}/>
            </div>
        );
    }
} );


var Audio = React.createClass({

    render()
    {
        if(!this.props.message)
        {
            console.log("no message")
            return(<div></div>)
        }

        var src = "http://tanks.mybluemix.net/tts/sayit?text_to_say=" + this.props.message;

        console.log("src: " + src);
        return(
            <audio autoPlay>
                <source src={src} type="audio/wav"/>
            </audio>
        )
    }
});

var ChatItem = React.createClass( {

    render ()
    {
        return (
            <div>
                <ListGroupItem>{this.props.user}: {this.props.message}</ListGroupItem>
                <Audio message={this.props.message}/>
            </div>
        );
    }
} );


var ChatList = React.createClass( {
    getInitialState()
    {
        return {}
    },

    componentDidMount()
    {
    },

    render ()
    {
        var chatItems = this.props.messages.map( function ( message, i )
        {
            return (
                <ChatItem user={message.id} message={message.text} key={i}/>
            )
        } );

        var lastMessage = ""//(this.props.messages &&this.props.messages.length > 0) ?
            //this.props.messages[this.props.message.length - 1].text : "";


        return (
            <div>
                <ListGroup>
                    {chatItems}
                </ListGroup>
            </div>
        );
    }
} );


var ChatBox = React.createClass( {

    getInitialState()
    {
        return {
            visible: false,
            messages: []
        }
    },

    componentWillMount()
    {
        mqttClient.registerListener( "connected", function ()
        {
            this.setState( { visible: true } )
        }.bind( this ) )

        mqttClient.registerListener( mqttClient.cmdTypes.chat, this.onChat );
    },

    onChat( message )
    {
        console.log( "new chat: " + message.text );

        var messages = this.state.messages;

        messages.push( message );

        this.setState( { messages: messages } );
    },

    render ()
    {
        return (
            <div style={{ margin:50, display: this.state.visible ? 'block' : 'none'}}>
                <Panel header="Chat with Watson Text to Speech">
                    <ChatList messages={this.state.messages}/>
                    <ChatInput/>
                </Panel>
            </div>
        );
    }
} );

ReactDOM.render( <ChatBox />, document.getElementById( 'chat' ) );

