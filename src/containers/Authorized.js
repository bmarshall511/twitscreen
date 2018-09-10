// Import node dependencies
import React, { Component } from 'react';

// Import component dependencies
import Status from './../components/Status/Status';

class Authorized extends Component {
  render() {
    const { state } = this.props;

    return (
      <Status state={state}  />
    );
  }
}

export default Authorized;
