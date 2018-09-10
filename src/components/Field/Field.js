// Import node dependencies
import React, { Component } from 'react';

class Field extends Component {

  render() {
    const { param, handleInputChange, state } = this.props;

    let input;

    if ( param.type === 'text' ) {
      input = (
        <input type="text" name={param.key} placeholder={param.placeholder} value={state[param.key]} onChange={handleInputChange} data-refresh="true" />
      );
    } else if ( param.type === 'select' ) {
      input = (
        <select name={param.key} value={state[param.key]} onChange={handleInputChange} data-refresh="true">
          {Object.keys( param.options ).map(( key ) => {
            return (
              <option value={key} key={'select' + key}>{param.options[key]}</option>
            )
          })}
        </select>
      )
    } else if ( param.type === 'number' ) {
      input = (
        <input type="number" name={param.key} placeholder={param.placeholder} value={state[param.key]} onChange={handleInputChange} min="1" data-refresh="true" />
      );
    }

    return (
      <div className="cell medium-4">
        <label>
          {param.label} {param.required &&
            <span className="required">*</span>
          }
          {input}
        </label>
        <p className="help-text">{param.desc}</p>
      </div>
    );
  }
}

export default Field;
