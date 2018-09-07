// Import node dependencies
import React, { Component } from 'react';

class NotFound extends Component {
  render() {
    return (
      <div className="modal">
        <h3>{"It's"} not meant to be.</h3>
        <p>Twitscreen scoured Twitterverse, but {"hasen't"} been able to locate any tweets &mdash; with <button data-toggle="offCanvas" className="text-link">the current filters</button>. If you want to find some tweets, <em>{"you'll"} need to lower your expectations</em>. Try <button data-toggle="offCanvas" className="text-link">adjusting some knobs</button> &mdash; see what happens. If it still {"can't"} come up with anything, <a href="https://benmarshall.me" target="_blank">report it</a>.</p>
      </div>
    );
  }
}

export default NotFound;
