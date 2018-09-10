// Import node dependencies
import React, { Component } from 'react';

class Unauthorized extends Component {
  render() {
    const { authUrl } = this.props;

    return (
      <div className="modal text-center">
        <h2>Welcome to Twitscreen &mdash; <em>billboardy-tweeder-thingy!</em></h2>
        <p>Twitscreen displays real-time tweets &mdash; <em>billboard-like!</em> Perfect for office TVs billboard to communciate updates. To get started, click the 'Request Authorization' button below. Once authorized, Twitscreen will have <b>read-only</b> access to tweets &mdash; <em>{"don't"} worry, {"it's"} not saving anything except on your computer.</em></p>
        <p><a href={authUrl} className="button">Request Authorization &raquo;</a></p>
      </div>
    );
  }
}

export default Unauthorized;
