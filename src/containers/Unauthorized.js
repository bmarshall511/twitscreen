// Import node dependencies
import React, { Component } from 'react';

class Unauthorized extends Component {
  render() {
    const { authUrl } = this.props;

    return (
      <div className="view-unauthorized">
        <a href={authUrl}>Authorize</a>
      </div>
    );
  }
}

export default Unauthorized;
