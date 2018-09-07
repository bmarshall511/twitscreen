// Import node dependencies
import React, { Component } from 'react';
import $ from 'jquery';

// Import component dependencies
import Status from './../components/Status/Status';

class Authorized extends Component {
  constructor(props) {
    super();

    this.state = {
      statusIndex: 0
    }
  }

  componentDidMount() {
    const { state } = this.props;
    const statuses = state.statuses;
    const Authorized = this;

    this.statusInterval = setInterval(() => {
      let index = Authorized.state.statusIndex + 1;
      if ( (index + 1) > statuses.length ) {
        index = 0;
      }

      this.setState({
        status: statuses[index],
        statusIndex: index,
      });

      if ( state.matchUserTheme ) {
        if ( statuses[index].user.profile_background_color ) {
          $( 'body' ).css( '--profile-background-color', '#' + statuses[index].user.profile_background_color );
        } else {
          $( 'body' ).css( '--profile-background-color', '' );
        }

        if ( statuses[index].user.profile_text_color ) {
          $( 'body' ).css( '--profile-text-color', '#' + statuses[index].user.profile_text_color );
        } else {
          $( 'body' ).css( '--profile-text-color', '' );
        }

        if ( statuses[index].user.profile_link_color ) {
          $( 'body' ).css( '--profile-link-color', '#' + statuses[index].user.profile_link_color );
        } else {
          $( 'body' ).css( '--profile-link-color', '' );
        }
      } else {
        $( 'body' ).prop( 'style', '' );
      }
    }, (state.pause * 1000));
  }

  componentWillUnmount() {
    clearInterval(this.statusInterval);
  }

  render() {
    const { state } = this.props;

    return (
      <div className="view-authorized">
        <Status statusIndex={this.state.statusIndex} state={state}  />
      </div>
    );
  }
}

export default Authorized;
