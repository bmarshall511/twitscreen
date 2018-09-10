// Import node dependencies
import React, { Component } from 'react';
import $ from 'jquery';

// Import component dependencies
import Field from './../Field/Field';

class Options extends Component {
  render() {
    $( document ).foundation();
    const { handleInputChange, state, reset, update } = this.props;

    // Set the active paramters based on the selected endpoints
    let activeParams = {};
    for(let i = 0;i < Object.keys(state.endpoints).length;i++) {
      const endpoint    = Object.keys(state.endpoints)[i];
      const endpointObj = state.endpoints[Object.keys(state.endpoints)[i]];

      for(let x = 0;x < Object.keys(state.params).length;x++) {
        const param          = state.params[Object.keys(state.params)[x]];
        const paramEndpoints = param.endpoint;

        if ( $.inArray( endpoint, paramEndpoints ) > -1 && state[endpointObj.key] ) {
          activeParams[param.key] = param;
        }
      }
    }

    return (
      <div>
        <div className="grid-x grid-margin-x">
          <div className="cell">
            <ul className="accordion" data-accordion>
              {process.env.NODE_ENV !== 'production' &&
                <li className="accordion-item" data-accordion-item>
                  <a href="#" className="accordion-title">API Credentials</a>
                  <div className="accordion-content" data-tab-content>
                    <div className="grid-x grid-margin-x">
                      <div className="cell">
                        <p>For security reasons and to help prevent abuse, a registered Twitter consumer key and secret is required for Twitscreen to communicate with Twitter. Once {"you've"} <a href="https://dev.twitter.com/apps" target="_blank" rel="noopener noreferrer">registered an app</a>, enter those credentials below.</p>
                      </div>
                      <div className="cell medium-6">
                        <label>
                          Consumer Key
                          <input type="text" name="consumerKey" placeholder="Consumer Key (API Key)" value={state.consumerKey} onChange={handleInputChange} />
                        </label>
                      </div>
                      <div className="cell medium-6">
                        <label>
                          Consumer Secret
                          <input type="text" name="consumerSecret" placeholder="Consumer Secret (API Secret)" value={state.consumerSecret} onChange={handleInputChange} />
                        </label>
                      </div>
                      <div className="cell">
                        <p className="help-text">Get your Twitter application API key &amp; secret here: <a href="https://dev.twitter.com/apps" target="_blank" rel="noopener noreferrer">dev.twitter.com/apps</a></p>
                      </div>
                    </div>
                  </div>
                </li>
              }
              <li className="accordion-item is-active" data-accordion-item>
                <a href="#" className="accordion-title">Filters</a>
                <div className="accordion-content" data-tab-content>
                  <div className="grid-x grid-margin-x">
                    <fieldset className="cell checkboxes">
                      <div className="grid-x grid-margin-x">
                        {Object.keys( state.endpoints ).map(( endpoint ) => {
                          let field = state.endpoints[ endpoint ];

                          return (
                            <div className="cell medium-6" key={field.key}>
                              <input type="checkbox" name="apis[]" value={endpoint} id={field.key} onChange={handleInputChange} data-refresh="true" checked={state[field.key]} /><label htmlFor={field.key}>{field.label}</label>
                              <p className="help-text">({endpoint})</p>
                            </div>
                          )
                        })}
                        <div className="cell">
                          <hr />
                        </div>
                        {Object.keys( activeParams ).map(( p ) => {
                          const param = activeParams[p];

                          return (
                            <Field param={param} state={state} handleInputChange={handleInputChange} key={p} />
                          )
                        })}
                      </div>
                    </fieldset>
                  </div>
                </div>
              </li>
              <li className="accordion-item" data-accordion-item>
                <a href="#" className="accordion-title">Theme Options</a>
                <div className="accordion-content" data-tab-content>
                  <div className="grid-x grid-margin-x">
                    <fieldset className="cell checkboxes">
                      <div className="grid-x grid-margin-x">
                        <div className="cell medium-7">
                          <input type="checkbox" name="matchUserTheme" id="matchUserTheme" checked={state.matchUserTheme} onChange={handleInputChange} /><label htmlFor="matchUserTheme">Use user profile colors</label>
                        </div>
                        <div className="cell medium-5">
                          <input type="checkbox" name="displayBanner" id="displayBanner" checked={state.displayBanner} onChange={handleInputChange} /><label htmlFor="displayBanner">Display user banner</label>
                        </div>
                      </div>
                    </fieldset>
                  </div>
                </div>
              </li>
              <li className="accordion-item" data-accordion-item>
                <a href="#" className="accordion-title">Advanced Options</a>
                <div className="accordion-content" data-tab-content>
                  <div className="grid-x grid-margin-x">
                    {process.env.NODE_ENV !== 'production' &&
                      <div className="cell">
                        <div className="grid-x grid-margin-x">
                          <div className="cell medium-4">
                            <label>
                              Twitscreen API URL
                              <input type="url" name="apiUrl" placeholder="ex. https://benmarshall.me/api.php" value={state.apiUrl} onChange={handleInputChange} />
                            </label>
                            <p className="help-text">Enter the URL location of the Twitscreen API.</p>
                          </div>
                          <div className="cell medium-4">
                            <label>
                              Callback URL
                              <input type="url" name="callback" placeholder="ex. https://trekific.com/twitscreen/build" value={state.callback} onChange={handleInputChange} />
                            </label>
                            <p className="help-text">Enter the URL location of the Twitscreen API.</p>
                          </div>
                          <div className="cell medium-4">
                            <label>
                              Pause
                              <input type="number" name="pause" value={state.pause} onChange={handleInputChange} />
                            </label>
                            <p className="help-text">Number of seconds to display a tweet.</p>
                          </div>
                        </div>
                      </div>
                    }
                    <div className="cell">
                      <input type="checkbox" name="debug" id="debug" checked={state.debug} onChange={handleInputChange} /><label htmlFor="debug">Display debug information</label>
                      <p className="help-text">Open the browser console when enabled to view more information.</p>
                    </div>
                    <div className="cell medium-6">
                      <p className="text-center"><button className="button expanded" onClick={update}>Force Refresh</button></p>
                      <p className="help-text"><b>WARNING:</b> Could cause the rate limit to be exceeded.</p>
                    </div>
                    <div className="cell medium-6">
                      <p className="text-center"><button className="button expanded" onClick={reset}>Reset Twitscreen</button></p>
                      <p className="help-text">Deauthorizes Twitscreen & clears locally cached data.</p>
                    </div>
                  </div>
                </div>
              </li>
              {state.debug &&
                <li className="accordion-item" data-accordion-item>
                  <a href="#" className="accordion-title">Debug Panel</a>
                  <div className="accordion-content" data-tab-content>
                    <div className="grid-x grid-margin-x">
                      <div className="cell">
                        <div className="grid-x grid-margin-x">
                          <div className="cell medium-6">
                            <b>Total statuses in state:</b> {state.statuses.length}
                          </div>
                          <div className="cell medium-6">
                            <b>Current status index:</b> {state.statusIndex}
                          </div>
                        </div>
                        <ul className="debug-log">
                        {state.debugMessages.map((msg) => {
                          const timestamp = msg.date;
                          let diff;

                          if ( this.currentTime ) {
                            diff = ( this.currentTime.getTime() - timestamp.getTime() )
                          }

                          this.currentTime = msg.date;

                          return (
                            <li>
                              <span className={'label ' + msg.type}>{msg.type}</span>
                              <span className="debug-msg">{msg.msg}</span>
                              <span className="debug-date">{timestamp.getHours() + ':' + timestamp.getMinutes() + ':' + timestamp.getSeconds() + '.' + timestamp.getMilliseconds()}</span>
                              <span className="debug-diff text-right">{diff}</span>
                            </li>
                          )
                        })}
                        </ul>
                      </div>
                    </div>
                  </div>
                </li>
              }
            </ul>
          </div>
          <div className="cell text-center">
            <p>Twitscreen, a React experiment by <a href="https://benmarshall.me/twitscreen">Ben Marshall</a></p>
          </div>
        </div>
      </div>
    );
  }
}

export default Options;
