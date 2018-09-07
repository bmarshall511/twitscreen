// Import node dependencies
import React, { Component } from 'react';

class Message extends Component {
  render() {
    const { messages } = this.props;

    return (
      <div className="modal">
        <h2>Something {"isn't"} right. Twitterverse {"isn't"} responding!</h2>
        <p><b>{"Don't"} panic!</b> {"It's"} not the end of the world &mdash; <em>probably</em>. {"Here's"} some of the common reasons Twitter might be giving you the cold shoulder.</p>
        <ul>
          <li><b>{"It's"} just a temporary hiccup</b> &mdash; hopefully a little time apart will settle thing down.</li>
          <li><b>Double-check your <button data-toggle="offCanvas" className="text-link">consumer key &amp; secret</button></b> &mdash; typo much?</li>
          <li>The <b>gate-keeper {"isn't"} happy</b>, see below:
            <ul>
              {messages.map(( msg ) => {
                return (
                  <li key={msg}>{msg}</li>
                );
              })}
            </ul>
          </li>
          <li>Worst-case scenario might be right &mdash; <b>the world is ending!</b></li>
        </ul>
        <p>If this problem persists, please <b><a href="https://benmarshall.me" target="_blank" rel="noopener noreferrer">report it</a></b>.</p>
      </div>
    );
  }
}

export default Message;
