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

    this.state = {
      view:   'loading',
      authUrl: false,
      statuses: [],
      consumerKey:    localStorage.getItem( 'consumerKey' ) || '',
      consumerSecret: localStorage.getItem( 'consumerSecret' ) || '',
      messages: [],
      apiUrl: localStorage.getItem( 'apiUrl' ) || 'https://trekific.com/twitscreen/',
      endpoints: {},
      params: {},
      matchUserTheme: this.getBool(localStorage.getItem( 'matchUserTheme' )),
      displayBanner: this.getBool(localStorage.getItem( 'displayBanner' )),
      pause: localStorage.getItem( 'pause' ) || 5,
    };

    // This binding is necessary to make `this` work in the callback
    this.handleInputChange = this.handleInputChange.bind( this );
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

  handleInputChange( e ) {
    const target   = e.target;
    let name     = target.name;
    const value    = target.type === 'checkbox' ? target.checked : target.value;

    if ( target.type === 'checkbox' ) {
      name = target.id;
    }

    localStorage.setItem( name, value ) ;

    this.setState({
      [name]: value
    });
  }

  isJson( str ) {
    try {
      JSON.parse( str );
    } catch ( e ) {
      return false;
    }

    return true;
  }

  getPostArgs() {
    let postArgs = {};
    postArgs.callback = 'http://localhost:3000';

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

  componentDidMount() {
    // Add available endpoints as state references
    queryApi( this.state.apiUrl, { request_apis: true }, ( result ) => {
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

      this.setState(newState);
      this.update();
    } );

    this.updateInterval = setInterval(() => {
      this.update()
    }, 10000);

    $( document ).foundation();
  }

  componentWillUnmount() {
    clearInterval(this.updateInterval);
  }

  update() {
    const Root = this;

    queryApi( this.state.apiUrl, this.getPostArgs(), ( result ) => {
      if ( result.errors.length && result.data.url ) {
        // Authorization required
        Root.setState({
          view:    'unauthorized',
          authUrl: result.data.url
        });

        if ( result.data.oauth_token_secret ) {
          localStorage.setItem( 'oauth_token_secret', result.data.oauth_token_secret );
        }

        if ( result.data.access_token ) {
          localStorage.setItem( 'access_token', JSON.stringify( result.data.access_token ) );
        }
      } else {
        let newState = {};

        if ( result.errors && result.errors.length ) {
          // Setup the message array
          let messages = [];

          // Set the error view & set messages
          newState.view = 'error';

          // Check API errors
          for(let i = 0;i < result.errors.length;i++) {
            if ( Root.isJson( result.errors[i] ) ) {
              let errors = JSON.parse( result.errors[i] );

              for(let x = 0;x < errors.errors.length;x++) {
                messages.push( '(' + errors.errors[x].code + ') ' + errors.errors[x].message );
              }
            } else {
              messages.push( result.errors[i] );
            }
          }

          newState.messages = messages;
        } else if ( result.data.response &&
          result.data.response.errors ) {
          // Setup the message array
          let messages = [];

          // Set the error view & set messages
          newState.view = 'error';

          for(let i = 0;i < result.data.response.errors.length;i++) {
            switch( result.data.response.errors[i].code ) {
              // Could not authenticate you.
              case 32:
                messages.push( result.data.response.errors[i].message );
                break;
              // Query parameters are missing.
              case 25:
                messages.push( result.data.response.errors[i].message );
                break;
              // Rate limit exceeded
              case 88:
                messages.push( result.data.response.errors[i].message );
                break;
              default:
                messages.push( result.data.response.errors[i].message );
            }
          }

          newState.messages = messages;
        }

        if ( result.data.response &&
          result.data.response.statuses &&
          result.data.response.statuses.length ) {

          newState.view     = 'authorized';
          newState.statuses = result.data.response.statuses;
        } else if ( result.data.response &&
          result.data.response.statuses &&
          ! result.data.response.statuses.length ) {

            newState.view     = 'not-found';
            newState.statuses = result.data.response.statuses;
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
          <Options state={this.state} handleInputChange={this.handleInputChange} />
        </div>
        <div className="off-canvas-content" data-off-canvas-content>
          <button type="button" className="text-link icon-menu" data-toggle="offCanvas"><Menu /></button>
          <div className="copyright">
            Twitscreen built by <a href="https://benmarshall.me">Ben Marshall</a> &bull; <a href="https://benmarshall.me/twitscreen" target="_blank">Lean more</a>
          </div>
          {this.state.view === 'loading' &&
            <Loading />
          }
          {this.state.view === 'unauthorized' &&
            <Unauthorized authUrl={this.state.authUrl} />
          }
          {this.state.view === 'authorized' &&
            <Authorized state={this.state} />
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
