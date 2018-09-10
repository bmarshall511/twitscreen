// Import node dependencies
import React, { Component } from 'react';
import $ from 'jquery';

// Import view dependencies
import Loading from './Loading';
import Unauthorized from './Unauthorized';
import Authorized from './Authorized';
import Message from './Message';
import NotFound from './NotFound';

// Import component dependencies
import Options from './../components/Options/Options';

// Import helper dependencies
import { queryApi, endpointLoop } from './../helpers/Api';

// Import image dependencies
import Menu from './menu.svg';

class Root extends Component {
  constructor() {
    super();

    this.defaultState = {
      view:   'loading',
      authUrl: false,
      statuses: [],
      consumerKey:    localStorage.getItem( 'consumerKey' ) || '',
      consumerSecret: localStorage.getItem( 'consumerSecret' ) || '',
      messages: [],
      apiUrl: localStorage.getItem( 'apiUrl' ) || 'https://trekific.com/twitscreen-api/',
      endpoints: {},
      params: {},
      matchUserTheme: this.getBool(localStorage.getItem( 'matchUserTheme' )),
      displayBanner: this.getBool(localStorage.getItem( 'displayBanner' )),
      pause: localStorage.getItem( 'pause' ) || 5,
      callback: localStorage.getItem( 'callback' ) || 'https://trekific.com/twitscreen/build/',
      debug: this.getBool(localStorage.getItem( 'debug' )),
      debugMessages: [],
      statusIndex: 0,
    };

    this.state = this.defaultState;

    // This binding is necessary to make `this` work in the callback
    this.handleInputChange = this.handleInputChange.bind( this );
    this.reset = this.reset.bind( this );
    this.update = this.update.bind( this );
    this.moveStatusIndex = this.moveStatusIndex.bind( this );
  }

  reset() {
    localStorage.clear();

    this.setState( this.defaultState );

    this.updateFilters();
    this.update();
  }

  addDebug( msg, type, raw ) {
    if ( this.state.debug ) {
      let messages = this.state.debugMessages;

      messages.push({
        date: new Date(),
        msg: msg,
        type: type
      });

      this.setState({
        debugMessages: messages
      });

      console.log( msg );
      if ( raw ) {
        console.log( raw );
      }
    }
  }

  getUrlParam( param ) {
    let query = window.location.search.substring( 1 ),
        vars  = query.split( '&' );

     for ( let i = 0; i<vars.length; i++ ) {
       let pair = vars[ i ].split( '=' );
       if( pair[0] === param ) { return pair[1]; }
     }

     return( false );
  }

  getBool( val ) {
    if ( typeof val === 'string' ) {
      return (/true/i).test(val);
    }

    return val;
  }

  moveStatusIndex() {
    let index = this.state.statusIndex;
    index++;

    if ( ! this.state.statuses[index] ) {
      index = 0;
    }

    this.setState({
      statusIndex: index
    });
  }

  handleInputChange( e ) {
    const target   = e.target;
    let name     = target.name;
    const value    = target.type === 'checkbox' ? target.checked : target.value;

    if ( target.type === 'checkbox' ) {
      name = target.id;
    }

    this.addDebug( 'Input changed: ' + name + ' - ' + value, 'secondary', target );

    localStorage.setItem( name, value ) ;

    this.addDebug( 'Updating state: ' + name + ' - ' + value, 'secondary', {
      [name]: value
    });
    this.setState({
      [name]: value
    });
    this.addDebug( 'State updated: ' + name + ' - ' + value, 'secondary', this.state );

    if ( target.dataset.refresh ) {
      this.update();
    }
  }

  componentDidMount() {
    this.addDebug( 'componentDidMount started: Root.js', 'secondary' );

    this.updateFilters();

    this.updateInterval = setInterval(() => {
      this.update()
    }, 60000);

    this.tweetInterval = setInterval(() => {
      this.moveStatusIndex()
    }, this.state.pause * 1000);

    $( document ).foundation();

    this.addDebug( 'componentDidMount completed: Root.js', 'secondary' );
  }

  componentWillUnmount() {
    clearInterval(this.updateInterval);
  }

  getPostArgs() {
    let postArgs = {};
    postArgs.callback = this.state.callback;

    if ( this.getUrlParam('oauth_token') ) {
      postArgs.oauth_token = this.getUrlParam('oauth_token');
    }

    if ( this.getUrlParam('oauth_verifier') ) {
      postArgs.oauth_verifier = this.getUrlParam('oauth_verifier');
    }

    if ( localStorage.getItem( 'oauth_token_secret' ) ) {
      postArgs.oauth_token_secret = localStorage.getItem( 'oauth_token_secret' );
    }

    if ( localStorage.getItem( 'access_token' ) ) {
      postArgs.access_token = localStorage.getItem( 'access_token' );
    }

    // Add selected endpoints
    for(let i = 0;i < Object.keys(this.state.endpoints).length;i++) {
      let endpoint   = Object.keys(this.state.endpoints)[i],
          stateValue = this.state[this.state.endpoints[endpoint].key];

      if ( stateValue != null && stateValue ) {
        postArgs['endpoints[' + endpoint + ']'] = endpoint;
      }
    }

    // Add available params
    for(let i = 0;i < Object.keys(this.state.params).length;i++) {
      let param = Object.keys(this.state.params)[i],
          val   = this.state[param];
      if ( val != null ) {
        postArgs['endpoint_param[' + param + ']'] = val;
      }
    }

    // Endpoint options
    postArgs.consumer_key = this.state.consumerKey;
    postArgs.consumer_secret = this.state.consumerSecret;

    return postArgs;
  }

  updateFilters() {
    this.addDebug( 'Query started: Requesting filters', 'secondary' );

    // Add available endpoints as state references
    queryApi( this.state.apiUrl, { request_apis: true }, ( result ) => {
      this.addDebug( 'Query completed: Requesting filters', 'secondary', result );

      let newState = {};
      newState.endpoints = result.endpoints;
      newState.params    = result.params;

      endpointLoop( newState.endpoints, ( endpoint ) => {
        // Add endpoint to state endpoints
        newState[newState.endpoints[endpoint].key] = this.getBool(localStorage.getItem( newState.endpoints[endpoint].key ));
      });

      for(let i = 0;i < Object.keys(newState.params).length;i++) {
        let param = Object.keys(newState.params)[i];

        newState[param] = localStorage.getItem( param ) || newState.params[param].default;
      }

      this.addDebug( 'Updating state: Adding available endpoints to state', 'secondary', newState );
      this.setState(newState);
      this.addDebug( 'State updated: Adding available endpoints to state', 'secondary', this.state );

      this.update();
    } );
  }

  update() {
    const Root = this;

    this.addDebug( 'Query started: Requesting statuses', 'secondary' );
    queryApi( this.state.apiUrl, this.getPostArgs(), ( result ) => {
      this.addDebug( 'Query completed: Requesting statuses', 'secondary', result );

      if ( result.errors.length && result.data.url ) {
        this.addDebug( 'Authorization required', 'warning', result );

        // Authorization required
        this.addDebug( 'Updating state: Setting view to unauthorized with auth URL', 'secondary', {
          view:    'unauthorized',
          authUrl: result.data.url
        });
        Root.setState({
          view:    'unauthorized',
          authUrl: result.data.url
        });
        this.addDebug( 'State updated: Setting view to unauthorized with auth URL', 'secondary', this.state );

        if ( result.data.oauth_token_secret ) {
          localStorage.setItem( 'oauth_token_secret', result.data.oauth_token_secret );
        }

        if ( result.data.access_token ) {
          localStorage.setItem( 'access_token', JSON.stringify( result.data.access_token ) );
        }
      } else {
        let newState = {};

        if ( result.errors && result.errors.length ) {
          this.addDebug( 'Errors found', 'alert', result.errors );
          // Setup the message array
          let messages = [];

          // Set the error view & set messages
          newState.view = 'error';

          // Check API errors
          for(let i = 0;i < result.errors.length;i++) {
            if ( typeof result.errors[i] === 'string' ) {
                switch( result.errors[i] ) {
                  case 'no_endpoints_selected':
                    messages.push( 'You\'re almost there, just missing a filter.' );
                  break;
                  default:
                    messages.push( result.errors[i] );
                }
            } else {
              switch( result.errors[i].code ) {
                // Could not authenticate you.
                case 32:
                  messages.push( result.errors[i].message );
                  break;
                // Query parameters are missing.
                case 25:
                  messages.push( result.errors[i].message );
                  break;
                // Rate limit exceeded
                case 88:
                  messages.push( result.errors[i].message );
                  break;
                default:
                  messages.push( result.errors[i].message );
              }
            }
          }

          newState.messages = messages;
        } else if ( result.data && result.data.length ) {
          newState.view     = 'authorized';
          newState.statuses = result.data;
        } else if ( result.data && ! result.data.length ) {
          newState.view     = 'not-found';
          newState.statuses = result.data.response;
        }

        if ( Object.keys(newState).length ) {
          Root.setState(newState);
        }
      }
    }, ( error ) => {
      console.log(error);
    } );
  }

  render() {

    return (
      <div className="off-canvas-wrapper">
        <div className="off-canvas position-right" id="offCanvas" data-off-canvas data-transition="overlap">
          <Options state={this.state} reset={this.reset} update={this.update} handleInputChange={this.handleInputChange} />
        </div>
        <div className="off-canvas-content" data-off-canvas-content>
          <button type="button" className="text-link icon-menu" data-toggle="offCanvas"><Menu /></button>
          <div className="copyright">
            Twitscreen, a React experiment by <a href="https://benmarshall.me/twitscreen">Ben Marshall</a>
          </div>
          {this.state.view === 'loading' &&
            <Loading />
          }
          {this.state.view === 'unauthorized' &&
            <Unauthorized authUrl={this.state.authUrl} />
          }
          {this.state.view === 'authorized' &&
            <Authorized state={this.state} moveStatusIndex={this.moveStatusIndex} />
          }
          {this.state.view === 'error' &&
            <Message messages={this.state.messages} />
          }
          {this.state.view === 'not-found' &&
            <NotFound />
          }
        </div>
      </div>
    );
  }
}

export default Root;
