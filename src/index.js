import React from 'react';
import ReactDOM from 'react-dom';
import Root from './containers/Root';
import registerServiceWorker from './registerServiceWorker';

// Import styles
import 'foundation-sites';
import './styles/global.scss';

ReactDOM.render(<Root />, document.getElementById('root'));
registerServiceWorker();
