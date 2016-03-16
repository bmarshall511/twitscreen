(function( $ ) {
  'use strict';

  var App = {
    elements : {},
    rotate   : false,
    list     : false,
    current  : 0,
    calling  : false,
    wait     : 3000,
    refresh  : 10000,
    tryCount : 0,
    scheme   : 'black-yellow',
    logDebug: function( txt ) {
      if ( this.elements.debug.prop( 'checked' ) ) {
        console.log( txt );
      }
    },
    ionsound: function() {
      ion.sound({
        sounds: [
            {
                name: "button_tiny"
            }
        ],
        volume: 0.5,
        path: "media/",
        preload: true
      });
    },
    loading: function( status ) {
      if ( status ) {
        this.elements.button.addClass( 'active' );
      } else {
        this.elements.button.removeClass( 'active' );
      }
    },
    listener: function() {
      this.elements.button.click(function( e ) {
        e.preventDefault();
        $( this ).toggleClass( 'selected' );
        App.elements.menu.toggleClass( 'active' );
      });

      this.elements.color.change(function() {
        App.elements.body.removeClass( App.scheme );
        App.scheme = $( this ).val();
        App.elements.body.addClass( App.scheme );
        Cookies.set( 'scheme', App.scheme );
      });

      this.elements.consumerKey.change(function() {
        Cookies.set( 'consumerKey', $( this ).val() );
      });

      this.elements.consumerSecret.change(function() {
        Cookies.set( 'consumerSecret', $( this ).val() );
      });

      this.elements.user.change(function() {
        Cookies.set( 'user', $( this ).val() );
      });

      this.elements.id.change(function() {
        Cookies.set( 'id', $( this ).val() );
      });

      this.elements.sound.click(function( e ) {
        Cookies.set( 'sound', $( this ).prop( 'checked' ) ? 1 : 0 );
      });
    },
    run: function() {
      this.refresh = parseInt( $( '#refresh' ).val() * 1000 );
      if ( this.tryCount <= 3 ) {
        $( '.error' ).removeClass( 'active' );
        App.logDebug( 'START: Grabbing new tweets (Try: ' + this.tryCount + ')...' );
        App.loadTweets(function() {
          $( '.date' ).timeago();
          App.logDebug( 'END: done grabbing new tweets.' );
          App.logDebug( 'Waiting ' + ( App.refresh / 1000 ) + ' seconds before grabbing new tweets...' );
          setTimeout(function() {
            App.logDebug( 'Attempting to grab new tweets...' );
            App.run();
          }, App.refresh );
        });
      } else {
        $( '.error' ).addClass( 'active' );
        $( '.none' ).removeClass( 'active' );

        if ( ! $( '.menu' ).hasClass( 'active' ) ) {
          App.elements.button.click();
        }
        App.logDebug( 'Error, stopped. Please verify settings.' );
        setTimeout(function() {
          App.logDebug( 'Attempting to grab new tweets...' );
          App.tryCount = 0;
          App.run();
        }, App.refresh );
      }
    },
    /**
     * Initial configuration of app
     */
    configure: function() {
      this.elements.list           = $( '#list' );
      this.elements.color          = $( '#color' );
      this.elements.callback       = $( '#callback' );
      this.elements.consumerKey    = $( '#consumerKey' );
      this.elements.consumerSecret = $( '#consumerSecret' );
      this.elements.limit          = $( '#limit' );
      this.elements.user           = $( '#user' );
      this.elements.id             = $( '#id' );
      this.elements.button         = $( '.button' );
      this.elements.menu           = $( '.menu' );
      this.elements.body           = $( 'body' );
      this.elements.sound          = $( '#sound' );
      this.elements.debug          = $( '#debug' );

       // Set default form values
      this.elements.callback.val( location.protocol + "//" + location.host + location.pathname + 'api.php' )
                      .attr( 'placeholder', location.protocol + "//" + location.host + location.pathname + 'api.php' );

      if ( Cookies.get( 'scheme' ) ) {
        this.elements.body.addClass( Cookies.get( 'scheme' ) );
        this.elements.color.val( Cookies.get( 'scheme' ) );
        App.scheme = Cookies.get( 'scheme' );
      }

      if ( Cookies.get( 'consumerKey' ) ) {
        this.elements.consumerKey.val( Cookies.get( 'consumerKey' ) );
      }

      if ( Cookies.get( 'consumerSecret' ) ) {
        this.elements.consumerSecret.val( Cookies.get( 'consumerSecret' ) );
      }

      if ( Cookies.get( 'sound' ) ) {
        this.elements.sound.prop( 'checked', true );
      }

      if ( Cookies.get( 'user' ) ) {
        this.elements.user.val( Cookies.get( 'user' ) );
      }

      if ( Cookies.get( 'id' ) ) {
        this.elements.id.val( Cookies.get( 'id' ) );
      }

      // Configure sounds
      this.ionsound();
    },
    /**
     * Initializes the app
     */
    init: function() {
      this.configure();
      this.listener();
      this.startRotate();
    },
    /**
     * Resets the tick timeout
     */
    setPause: function( length ) {
      App.logDebug( 'tweet shown' );
      App.logDebug( 'Waiting ' + ( App.wait / 1000 ) + ' seconds before tick.' );
      setTimeout(function() {
        App.current++;
        if ( App.current >= length ) App.current = 0;
        App.tick();
      }, App.wait );
    },
    tick: function() {
      if( this.rotate ) {
        App.logDebug( 'Starting tick (Current: ' + this.current + ')...' );
        this.wait = parseInt( $( '#time' ).val() ) * 1000;
        var elements = $( 'li', App.elements.list ),
            length   = elements.length,
            visible  = elements.map(function() {
                         if ( $( this ).css( 'opacity' ) == '1' )
                           return this;
                       });;

        if ( length ) {
          App.logDebug( 'Tweets found.' );
          if ( ! visible.length ) {
            App.logDebug( 'No tweets visible, showing the first...' );
            $( 'li:first-child', App.elements.list ).animate({
              opacity: 1
            }, 500, function() {
              App.setPause( length );
            });
          } else {
            App.logDebug( 'Tweets visible. Hiding visible...' );
            $( visible ).animate({
              opacity: 0
            }, 500, function() {
              App.logDebug( 'visible hidden.' );
              App.logDebug( 'Showing the next...' );
              $( 'li', App.elements.list ).eq( App.current ).animate({
                opacity: 1
              }, 500, function() {
                App.setPause( length );
              });
            });
          }
        } else {
          App.logDebug( 'No tweets found.' );
          App.logDebug( 'Waiting ' + ( App.wait / 1000 ) + ' seconds before tick.' );
          setTimeout(function() {
              App.tick();
            }, App.wait );
        }
      }
    },
    loadTweets: function( callback ) {
      App.tryCount++;
      this.getTweets( function( tweets ) {
        if ( tweets ) {
          App.logDebug( tweets.length + ' tweets loaded.' );
          App.tryCount = 0;
          $( '.none' ).removeClass( 'active' );
          var count = tweets.length;
          $.each( tweets, function() {
            App.addTweet( this );
            count--;
            if ( count <= 0 ) callback();
          });
        } else {
          App.logDebug( 'Unable to load tweets.' );
          if( ! $( 'li', App.list ).length ) {
            $( '.none' ).addClass( 'active' );
          }
          App.run();
        }
      });
    },
    getTweets: function( callback ) {
      if ( ! App.calling ) {
        App.loading(1);
        App.calling = true;
        $.post( 'api.php', {
          id             : App.elements.id.val(),
          type           : 'list',
          user           : App.elements.user.val(),
          limit          : App.elements.limit.val(),
          consumerKey    : App.elements.consumerKey.val(),
          consumerSecret : App.elements.consumerSecret.val(),
          callback       : App.elements.callback.val()
        }, function( response ) {
          App.calling = false;
          App.loading(0);
          callback( response );
        });
      }
    },
    /**
     * Appends a tweet to the list
     */
    addTweet: function( tweet ) {
      if ( $( '#tweet-' + tweet.id ).length ) return;
      var tpl = $( '<blockquote />' ).html(
                  '<span class="text"></span>' +
                  '<time class="date" datetime=""></time>' +
                  '<footer>' +
                    '<cite>' +
                      '<a href="#" class="url">' +
                        '<img src="#" class="img">' +
                      '</a>' +
                      '<a href="#" class="url">' +
                        '<span class="name"></span>' +
                        '<span class="user"></span>' +
                      '</a>' +
                    '</cite>' +
                  '</footer>'
                ),
          li = $( '<li />')
                 .css( 'opacity', 0 )
                 .html( tpl )
                 .attr( 'id', 'tweet-' + tweet.id ),
          date = new Date( tweet.created_at );

      $( '.text', li ).html( tweet.text );
      $( '.url', li ).attr( 'href', tweet.user.url );
      $( '.img', li ).attr( 'src', tweet.user.profile_image_url_https );
      $( '.user', li ).html( '@' + tweet.user.screen_name );
      $( '.date', li ).html( date ).attr( 'datetime', date.toISOString() );
      $( '.name', li ).html( tweet.user.name );

      this.elements.list.append( li );

      if ( this.elements.sound.prop( 'checked' ) ) {
        ion.sound.play( 'button_tiny' );
      }

      this.current = 0;
    },
    startRotate: function() {
      App.logDebug( 'Started rotation.' );
      this.rotate = true;
      this.run();
      this.tick();
    },
    stopRotate: function() {
      App.logDebug( 'Rotation stopped.' );
      this.rotate = false;
    }
  };

  $( function() {
    App.init();
  });
})( jQuery );