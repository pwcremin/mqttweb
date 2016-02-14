var deviceManager = require( '../libs/deviceManager' ),
    mqttClient = require( '../libs/mqttClient' ),
    emitter = require( '../libs/emitter' ),
    React = require( 'react' ),
    ReactBootstrap = require( 'react-bootstrap' ),
    vis = require( 'vis' );

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
    Well = ReactBootstrap.Well,
    ListGroupItem = ReactBootstrap.ListGroupItem;

var graph = {
    groups: new vis.DataSet(),
    items: new vis.DataSet(),
    container: null,
    graph2d: null,
    options: {
//        dataAxis: {showMinorLabels: false},
        start: vis.moment().add( -60, 'seconds' ), // changed so its faster
        end: vis.moment(),
        dataAxis: {
            left: {
                range: {
                    min: -15, max: 15
                }
            }
        },
        drawPoints: {
            style: 'circle' // square, circle
        }
    },

    renderStep: function ()
    {
        // move the window (you can think of different strategies).
        var now = vis.moment();
        var range = this.graph2d.getWindow();
        var interval = range.end - range.start;
        switch ( "continuous" )//strategy.value )
        {
            case 'continuous':
                // continuously move the window
                this.graph2d.setWindow( now - interval, now, { animation: false } );
                requestAnimationFrame( this.renderStep.bind( this ) );
                break;

            case 'discrete':
                this.graph2d.setWindow( now - interval, now, { animation: false } );
                setTimeout( this.renderStep.bind( this ), DELAY );
                break;

            default: // 'static'
                // move the window 90% to the left when now is larger than the end of the window
                if ( now > range.end )
                {
                    this.graph2d.setWindow( now - 0.1 * interval, now + 0.9 * interval );
                }
                setTimeout( this.renderStep.bind( this ), DELAY );
                break;
        }
    },

    addDataPoint: function ( candidate, score )
    {
        // add a new data point to the items
        var now = vis.moment();
        this.items.add( {
            group: candidate,
            x: now,
            y: score//y( now / 1000 )
        } );

        // remove all data points which are no longer visible
        var range = this.graph2d.getWindow();
        var interval = range.end - range.start;
        var oldIds = this.items.getIds( {
            filter: function ( item )
            {
                return item.x < range.start - interval;
            }
        } );

        // TODO temp not removing old numbers just to see how long it can last
        //this.items.remove( oldIds );

        //setTimeout( addDataPoint, DELAY );
    },

    populateExternalLegend: function ()
    {
        var groupsData = this.groups.get();
        var legendDiv = document.getElementById( "Legend" );
        legendDiv.innerHTML = "";

        // get for all groups:
        for ( var i = 0; i < groupsData.length; i++ )
        {
            // create divs
            var containerDiv = document.createElement( "div" );
            var iconDiv = document.createElement( "div" );
            var descriptionDiv = document.createElement( "div" );

            // give divs classes and Ids where necessary
            containerDiv.className = 'legend-element-container';
            containerDiv.id = groupsData[ i ].id + "_legendContainer"
            iconDiv.className = "icon-container";
            descriptionDiv.className = "description-container";

            // get the legend for this group.
            var legend = this.graph2d.getLegend( groupsData[ i ].id, 15, 15 );

            // append class to icon. All styling classes from the vis.css have been copied over into the head here to be able to style the
            // icons with the same classes if they are using the default ones.
            legend.icon.setAttributeNS( null, "class", "legend-icon" );

            // append the legend to the corresponding divs
            iconDiv.appendChild( legend.icon );
            descriptionDiv.innerHTML = legend.label;

            // determine the order for left and right orientation
            if ( legend.orientation == 'left' )
            {
                descriptionDiv.style.textAlign = "left";
                containerDiv.appendChild( iconDiv );
                containerDiv.appendChild( descriptionDiv );
            }
            else
            {
                descriptionDiv.style.textAlign = "right";
                containerDiv.appendChild( descriptionDiv );
                containerDiv.appendChild( iconDiv );
            }

            // append to the legend container div
            legendDiv.appendChild( containerDiv );

            // bind click event to this legend element.
            containerDiv.onclick = this.toggleGraph.bind( this, groupsData[ i ].id );
        }
    },

    toggleGraph: function ( groupId )
    {
        // get the container that was clicked on.
        var container = document.getElementById( groupId + "_legendContainer" )
        // if visible, hide
        if ( this.graph2d.isGroupVisible( groupId ) == true )
        {
            this.groups.update( { id: groupId, visible: false } );
            this.container.className = this.container.className + " hidden";
        }
        else
        { // if invisible, show
            this.groups.update( { id: groupId, visible: true } );
            this.container.className = this.container.className.replace( "hidden", "" );
        }
    }
};

var TweetCount = React.createClass({
    render(){

        var counts = [];

        var key = 0;
        for(var candidate in this.props.tweetCounts)
        {
            console.log(candidate + ' tweet count: ' + this.props.tweetCounts[candidate]);

            counts.push(<div key={key++}>{candidate} {this.props.tweetCounts[candidate]} </div>);
        }

        return(<Panel header="The number of tweets in the latest measurement" >{counts}</Panel>)
    }
});

var CandidateBox = React.createClass( {

    candidates: [ '@JohnKasich', '@BernieSanders', '@realDonaldTrump', '@HillaryClinton', '@JebBush', '@tedcruz' ],

    getInitialState()
    {
        var tweetCounts = [];
        for ( var i = 0; i < this.candidates.length; i++ )
        {
            tweetCounts[this.candidates[ i ]] = 0;

        }

        return {
            visible: true,
            tweetCounts: tweetCounts
        }
    },

    componentDidMount()
    {
        var now = vis.moment();
        for ( var i = 0; i < this.candidates.length; i++ )
        {
            var candidate = this.candidates[ i ];

            graph.groups.add( {
                id: candidate,
                content: candidate,
                //className: 'custom-style2'
            } );

            graph.items.add( {
                group: candidate,
                x: now,
                y: 0
            } );
        }

        graph.container = document.getElementById( 'visualization' );
        graph.graph2d = new vis.Graph2d( graph.container, graph.items, graph.groups, graph.options );

        graph.populateExternalLegend();
        graph.renderStep();

        emitter.addListener( "candidateScores", this.onCandidateScore )
    },

    onCandidateScore( payload )
    {
        var tweetCounts = this.state.tweetCounts;
        tweetCounts[payload.candidate] = payload.tweetCount;

        this.setState({tweetCounts: tweetCounts});

        graph.addDataPoint( payload.candidate, payload.movingAverage );
    },

    render ()
    {
        var title = <h3>Candidate Tweet Sentiment Analysis</h3>

        return (
            <div style={{ margin:50, display: this.state.visible ? 'block' : 'none'}}>
                <Panel header={title} bsStyle="success">
                    <Well>
                        By using Twitter and Sentiment analysis nodes we can analyze the tweets about presidential
                        candidates and tracks their moving average.
                    </Well>
                    <div id="Legend" class="external-legend"></div>
                    <div id="visualization"></div>


                    <TweetCount tweetCounts={this.state.tweetCounts} />
                </Panel>
            </div>
        );
    }
} );

module.exports = CandidateBox;

