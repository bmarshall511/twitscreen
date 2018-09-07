// Import node dependencies
import React, { Component } from 'react';

// Import component dependencies
import Field from './../Field/Field';

class Options extends Component {
  render() {
    const { handleInputChange, state, reset } = this.props;

    return (
      <div>
        <div className="grid-x grid-margin-x">
          <div className="cell">
            <ul className="accordion" data-accordion>
              {process.env.NODE_ENV !== 'production' &&
                <li className="accordion-item is-active" data-accordion-item>
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
              <li className="accordion-item" data-accordion-item>
                <a href="#" className="accordion-title">Filters</a>
                <div className="accordion-content" data-tab-content>
                  <div className="grid-x grid-margin-x">
                    <fieldset className="cell checkboxes">
                      <div className="grid-x grid-margin-x">
                        {Object.keys( state.endpoints ).map(( endpoint ) => {
                          let field = state.endpoints[ endpoint ];

                          return (
                            <div className="cell medium-6" key={field.key}>
                              <input type="checkbox" name="apis[]" value={endpoint} id={field.key} onChange={handleInputChange} checked={state[field.key]} /><label htmlFor={field.key}>{field.label}</label>
                              <p className="help-text">({endpoint})</p>
                            </div>
                          )
                        })}
                        <div className="cell">
                          <hr />
                        </div>
                        {Object.keys( state.params ).map(( p ) => {
                          let param = state.params[p];

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
                          <div className="cell">
                            <hr />
                          </div>
                        </div>
                      </div>
                    }
                    <div className="cell">
                      <p className="text-center"><button className="button" onClick={reset}>Reset Twitscreen</button> <em>&mdash; deauthorizes Twitscreen & clears locally cached data</em></p>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
}

export default Options;
