// Import node dependencies
import React, { Component } from 'react';

class Loading extends Component {
  render() {
    return (
      <div className="modal">
        <h3 className="text-center">Twitscreen is booting up &mdash; {"shouldn't"} be much longer.</h3>
      </div>
    );
  }
}

export default Loading;
