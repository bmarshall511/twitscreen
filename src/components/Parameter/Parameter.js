// Import node dependencies
import React, { Component } from 'react';

class Parameter extends Component {

  render() {
    const { params, field } = this.props;

    return (
      <div>
        {Object.keys( params ).map((param) => {
          console.log(param);
          return (
            <div className="cell small-6" key={field.key + param}>
              {param}
            </div>
          );
        })}
      </div>
    );
  }
}

export default Parameter;
