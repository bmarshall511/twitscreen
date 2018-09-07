import React from 'react';
import ReactDOM from 'react-dom';
import Unauthorized from './containers/Unauthorized';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<Unauthorized />, div);
  ReactDOM.unmountComponentAtNode(div);
});
