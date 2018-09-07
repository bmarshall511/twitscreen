// Import node dependencies
import React, { Component } from 'react';

class Loading extends Component {
  render() {
    return (
      <div className="modal">
        <h2 cclassName="text-center">Twitscreen is booting up &mdash; {"shouldn't"} be much longer.</h2>
        <p className="text-center">If this continues for more than a few minutes, double-check the <button data-toggle="offCanvas" className="text-link">"Twitscreen API URL"</button>. Be sure {"it's"} a valid endpoint. If the problem persists, please <a href="https://benmarshall.me/contact">report it</a>.</p>
      </div>
    );
  }
}

export default Loading;
