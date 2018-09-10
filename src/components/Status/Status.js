// Import node dependencies
import React, { Component } from 'react';
import TimeAgo from 'react-timeago';
import $ from 'jquery';

// Import style dependencies
import './status.scss';

// Import image dependencies
import Verified from './verified.svg';
import Heart from './heart.svg';
import Retweet from './retweet.svg';
import Twitter from './twitter.svg';

String.prototype.parseURL = function() {
	return this.replace(/[A-Za-z]+:\/\/[A-Za-z0-9-_]+\.[A-Za-z0-9-_:%&~\?\/.=]+/g, function(url) {
		return url.link(url);
	});
};

String.prototype.parseUsername = function() {
	return this.replace(/[@]+[A-Za-z0-9-_]+/g, function(u) {
		var username = u.replace("@","")
		return u.link("http://twitter.com/"+username);
	});
};

String.prototype.parseHashtag = function() {
	return this.replace(/[#]+[A-Za-z0-9-_]+/g, function(t) {
		var tag = t.replace("#","%23")
		return t.link("http://search.twitter.com/search?q="+tag);
	});
};

class Status extends Component {

  render() {
    const { state } = this.props;
		let statusIndex = state.statusIndex;
    let status = state.statuses[statusIndex];

    if ( ! status ) {
      status = state.statuses[0];
    }

		if ( state.matchUserTheme ) {
			if ( status.user.profile_background_color ) {
				$( 'body' ).css( '--profile-background-color', '#' + status.user.profile_background_color );
			} else {
				$( 'body' ).css( '--profile-background-color', '' );
			}

			if ( status.user.profile_text_color ) {
				$( 'body' ).css( '--profile-text-color', '#' + status.user.profile_text_color );
			} else {
				$( 'body' ).css( '--profile-text-color', '' );
			}

			if ( status.user.profile_link_color ) {
				$( 'body' ).css( '--profile-link-color', '#' + status.user.profile_link_color );
			} else {
				$( 'body' ).css( '--profile-link-color', '' );
			}
		} else {
			$( 'body' ).prop( 'style', '' );
		}

    return (
      <div className="modal">
        {state.displayBanner && status.user.profile_banner_url &&
          <div className="profile-banner">
            <img src={status.user.profile_banner_url} alt={status.user.screen_name} />
          </div>
        }
        <div className="profile-header">
          <div className="profile">
            <div className="profile-image">
              {status.user.url ? (
                <a href={status.user.url} target="_blank"><img src={status.user.profile_image_url_https} alt={status.user.screen_name} /></a>
              ) : (
                <img src={status.user.profile_image_url_https} alt={status.user.screen_name} />
              )}
            </div>
            <div className="profile-info">
              <div className="name">
                {status.user.name} {status.user.verified &&
                  <Verified className="profile-verified" />
                }
              </div>
              <div className="screenname">
                {status.user.url ? (
                  <a href={status.user.url} target="_blank">@{status.user.screen_name}</a>
                ) : (
                  <span>@{status.user.screen_name}</span>
                )}
              </div>
            </div>
          </div>
          <div className="profile-link text-right">
            <a href={'https://twitter.com/' + status.user.screen_name} target="_blank" className="icon-twitter"><Twitter /></a>
          </div>
        </div>
        <div className="status-text" dangerouslySetInnerHTML={{ __html: status.text.parseURL().parseUsername().parseHashtag() }} />
        <div className="status-meta">
          <div className="status-favs"><Heart className="icon-heart" /> {status.favorite_count}</div>
          <div className="status-retweets"><Retweet className="icon-retweet" /> {status.retweet_count}</div>
          <div className="status-date text-right"><TimeAgo date={status.created_at} /></div>
        </div>
      </div>
    );
  }
}

export default Status;
