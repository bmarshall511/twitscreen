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
    updateCookies: function() {
      // Consumer key
      Cookies.set( 'consumerKey', this.elements.consumerKey.val() );

      // Consumer secret
      Cookies.set( 'consumerSecret', this.elements.consumerSecret.val() );

      // User
      Cookies.set( 'user', this.elements.user.val() );

      // List ID
      Cookies.set( 'id', this.elements.listID.val() );

      // Search
      Cookies.set( 'q', this.elements.q.val() );

      // Sound
      Cookies.set( 'sound', this.elements.sound.prop( 'checked' ) ? 1 : 0 );

      // Margin
      Cookies.set( 'margin', this.elements.margin.val() );
      App.elements.body.css( 'margin', '0 ' + this.elements.margin.val() + '%' );

      // Size
      Cookies.set( 'size', this.elements.size.val() );
      App.elements.body.css( 'font-size', this.elements.size.val() + 'px' );

      // Color scheme
      App.elements.body.removeClass( App.scheme );
      App.scheme = this.elements.color.val();
      App.elements.body.addClass( App.scheme );
      Cookies.set( 'scheme', App.scheme );

      // API cookies
      var vals = [];
      this.elements.apis.map(function() {
        if ( $( this ).prop( 'checked' ) ) {
           vals.push( $( this ).val() );
        }
      });
      Cookies.set( 'apis', vals );
    },
    listener: function() {

      // Info hover event
      this.elements.infoTrigger.hover(function() {
        var info = $( this ).data( 'info' );
        $( '[data-id="' + info + '"]' ).show();
      }, function() {
        var info = $( this ).data( 'info' );
        $( '[data-id="' + info + '"]' ).hide();
      });

      // Save options
      this.elements.options.change(function() {
        App.updateCookies();
      });

      // APIs click event
      this.elements.apis.click(function() {
        App.toggleOptions();
      });

      this.elements.button.click(function( e ) {
        e.preventDefault();
        $( this ).toggleClass( 'selected' );
        App.elements.menu.toggleClass( 'active' );
      });
    },
    toggleOptions: function() {
      var show = [];
      this.elements.apis.map(function() {
        var required = $( this ).data( 'require' ) ? $( this ).data( 'require' ) : false;
        if ( required ) {
          required = required.split( '|' );
          if ( $( this ).prop( 'checked' ) ) {
            required.map(function( val ) {
              if ( $.inArray( val, show ) === -1 ) {
                show.push( val );
              }
            });
          }
        }
      });

      $( '[data-option]' ).hide();
      show.map(function( val ) {
        $( '[data-option="' + val + '"]' ).show();
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
      this.elements.apis           = $( '.apis' );
      this.elements.infoTrigger    = $( '.infoTrigger' );
      this.elements.form           = $( '#options' );
      this.elements.options        = $( '.option' );
      this.elements.color          = $( '#color' );
      this.elements.margin         = $( '#margin' );
      this.elements.size           = $( '#size' );
      this.elements.consumerKey    = $( '#consumerKey' );
      this.elements.consumerSecret = $( '#consumerSecret' );
      this.elements.list           = $( '#list' );
      this.elements.sound          = $( '#sound' );
      this.elements.user           = $( '#user' );
      this.elements.listID         = $( '#listID' );
      this.elements.callback       = $( '#callback' );
      this.elements.q              = $( '#q' );
      this.elements.runs           = $( '#runs' );


      this.elements.limit          = $( '#limit' );
      this.elements.button         = $( '.button' );
      this.elements.menu           = $( '.menu' );
      this.elements.body           = $( 'body' );
      this.elements.debug          = $( '#debug' );

       // Set default form values
      this.elements.callback.html( location.protocol + "//" + location.host + location.pathname + 'api.php' );

      // API values
      if ( Cookies.get( 'apis' ) ) {
        var apis = $.parseJSON( Cookies.get( 'apis' ) );
        $( this.elements.apis ).prop( 'checked', false );
        apis.map(function( api ) {
          var opt      = $( '[value="' + api + '"]' ),
              required = opt.data( 'require' ) ? opt.data( 'require' ) : false;

          opt.prop( 'checked', true );

          // Show default options
          if ( required ) {
            required.split( '|' ).map( function( require ) {
              $( '[data-option="' + require + '"]' ).show();
            });
          }
        });
      }

      // Color scheme
      if ( Cookies.get( 'scheme' ) ) {
        this.elements.body.addClass( Cookies.get( 'scheme' ) );
        this.elements.color.val( Cookies.get( 'scheme' ) );
        App.scheme = Cookies.get( 'scheme' );
      }

      // Margin
      if ( Cookies.get( 'margin' ) ) {
        this.elements.margin.val( Cookies.get( 'margin' ) );
        this.elements.body.css( 'margin', '0 ' + Cookies.get( 'margin' ) + '%' );
      }

      // Size
      if ( Cookies.get( 'size' ) ) {
        this.elements.size.val( Cookies.get( 'size' ) );
        this.elements.body.css( 'font-size', Cookies.get( 'size' ) + 'px' );
      }

      // Consumer key
      if ( Cookies.get( 'consumerKey' ) ) {
        this.elements.consumerKey.val( Cookies.get( 'consumerKey' ) );
      }

      // Consumer secret
      if ( Cookies.get( 'consumerSecret' ) ) {
        this.elements.consumerSecret.val( Cookies.get( 'consumerSecret' ) );
      }

      // Sound
      if ( Cookies.get( 'sound' ) ) {
        this.elements.sound.prop( 'checked', true );
      }

      // User
      if ( Cookies.get( 'user' ) ) {
        this.elements.user.val( Cookies.get( 'user' ) );
      }

      // List ID
      if ( Cookies.get( 'listID' ) ) {
        this.elements.listID.val( Cookies.get( 'listID' ) );
      }

      // Search
      if ( Cookies.get( 'q' ) ) {
        this.elements.q.val( Cookies.get( 'q' ) );
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
                       });

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
      this.getTweets( function( response ) {
        if ( response ) {
          if (
            typeof response.error !== 'undefined' &&
            response.error.length  &&
            ! response.tweets.length
          ) {
            App.logDebug( 'Error: ' + response.error );
            if( ! $( 'li', App.list ).length ) {
              $( '.none' ).addClass( 'active' );
            }
            App.run();
          } else if ( typeof response.url !== 'undefined' && response.url.length ) {
            App.logDebug( 'Authorization required, redirecting...' );
            window.location.href = response.url;
          } else {
            var count = response.tweets.length;

            if ( count ) {
              App.logDebug( count + ' tweets loaded.' );
              App.tryCount = 0;

              $( '.none' ).removeClass( 'active' );
              $.each( response.tweets, function() {
                App.addTweet( this );
                count--;
                if ( count <= 0 ) callback();
              });
              App.updateTweetCount();
            } else {
              $( '.none' ).addClass( 'active' );
              if ( ! $( '.menu' ).hasClass( 'active' ) ) {
                App.elements.button.click();
              }
            }
          }
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

        $.post( 'api.php', this.elements.form.serialize(), function( response ) {
          App.calling = false;
          App.loading(0);

          // Update count
          var c = parseInt( App.elements.runs.val() );
          c++;
          App.elements.runs.val( c );

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
          date = new Date( tweet.created_at ),
          visible = $( 'li:visible', this.elements.list );

      $( '.text', li ).html( tweet.text );
      $( '.url', li ).attr( 'href', tweet.user.url );
      $( '.img', li ).attr( 'src', tweet.user.profile_image_url_https );
      $( '.user', li ).html( '@' + tweet.user.screen_name );
      $( '.date', li ).html( date ).attr( 'datetime', date.toISOString() );
      $( '.name', li ).html( tweet.user.name );

      this.elements.list.prepend( li );

      if ( this.elements.sound.prop( 'checked' ) ) {
        ion.sound.play( 'button_tiny' );
      }
    },
    updateTweetCount: function() {
      var total       = $( 'li', this.elements.list ).length,
          apisChecked = $( 'input.apis[type=checkbox]:checked' ).length,
          limit       = parseInt( this.elements.limit.val() ) * apisChecked,
          del         = 0;

      App.logDebug( total + ' tweets in list, ' + apisChecked + ' APIS, only ' + limit + ' allowed.' );

      if ( total > limit ) {
        del = total - limit;
        App.logDebug( 'Too many tweets listed, removing the oldest ' + del );
        $( 'li:gt(' + limit + ')', this.elements.list ).remove();
      }
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