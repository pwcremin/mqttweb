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


var Score = React.createClass( {
    render ()
    {
        return (
            <tr>
                <td>{this.props.rank}</td>
                <td>{this.props.name}</td>
                <td>{this.props.score}</td>
            </tr>
        );
    }
} );

var ScoreTable = React.createClass( {
    displayName: 'ScoreTable',

    getInitialState()
    {
        return { scores: [], error: '' }
    },

    componentDidMount() {
        mqttClient.registerListener( mqttClient.cmdTypes.highscore, this.onMessage )
    },

    onMessage( payload )
    {
        this.setState( { scores: payload.scores } );
    },

    render ()
    {
        var scoreNodes = [];

        for ( var i = 0; i < this.state.scores.length; i++ ) {
            var data = this.state.scores[ i ];
            scoreNodes.push(
                <Score name={data.player} rank={i+1} key={i} score={data.score}>
                </Score>
            )
        }

        return (
            <Table striped bordered condensed hover>
                <thead>
                <tr>
                    <th>Rank</th>
                    <th>Player</th>
                    <th>Score</th>
                </tr>
                </thead>
                <tbody>
                {scoreNodes}
                </tbody>
            </Table>
        );
    }
} );

var PlayerScoreInput = React.createClass( {


    getInitialState()
    {
        return {
            scoreValue: '',
            playerValue: ''
        }
    },

    handleScoreChange() {
        this.setState( {
            scoreValue: this.refs.score.getValue()
        } );
    },

    handlePlayerChange() {
        this.setState( {
            playerValue: this.refs.player.getValue()
        } );
    },

    onSendScore()
    {
        var name = this.refs.player.getValue();
        var score = this.refs.score.getValue();

        if ( isNaN( score ) ) {

            this.setState({error: 'the score must be a number'})
            return;
        }

        if(!name)
        {
            this.setState({error: 'looks like you forgot the user'})

            return;
        }


        mqttClient.publishScore( name, score );

        this.setState( {
            scoreValue: '',
            playerValue: '',
            error: ''
        } );
    },

    render(){
        return (
            <Panel header="Add a new score and watch the high score update" style={{margin:50}}>
                <Row bordered>
                    <Col xs={6} lg={3}>
                        <Input
                            type='text'
                            value={this.state.playerValue}
                            placeholder='bubba'
                            label='Player Name: '
                            help=''
                            //bsStyle={this.validationState()}
                            hasFeedback
                            ref='player'
                            onChange={this.handlePlayerChange}
                            style={{width:100, margin: 5}}
                        />
                    </Col>
                    <Col xs={6} lg={3}>
                        <Input
                            type='text'
                            value={this.state.scoreValue}
                            placeholder='1000'
                            label='Score: '
                            help=''
                            //bsStyle={this.validationState()}
                            hasFeedback
                            ref='score'
                            onChange={this.handleScoreChange}
                            style={{width:100, margin: 5}}
                        />
                        <ButtonInput onClick={this.onSendScore} type='submit' value='send new score' bsSize='small'
                                     disabled={false}/>
                    </Col>
                </Row>

                <div><font color="red">{this.state.error}</font></div>
            </Panel>
        )
    }
} );

var ScoreBox = React.createClass( {
    displayName: 'ScoreBox',

    getInitialState()
    {
        return { visible: false }
    },

    componentWillMount()
    {
        mqttClient.registerListener( "connected", function ()
        {
            this.setState( { visible: true } )
        }.bind( this ) )
    },

    render ()
    {
        return (
            <div style={{ display: this.state.visible ? 'block' : 'none'}}>
                <div>
                    <PlayerScoreInput/>
                </div>
                <div className='scoreBox' style={{margin:50}}>
                    <h1>High Scores</h1>
                    <ScoreTable />
                </div>
            </div>
        );
    }
} );

ReactDOM.render( <ScoreBox />, document.getElementById( 'highscore' ) );

