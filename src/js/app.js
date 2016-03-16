(function( $ ) {
  'use strict';

  var App = {
    rotate   : false,
    list     : false,
    current  : 0,
    calling  : false,
    wait     : 3000,
    refresh  : 10000,
    tryCount : 0,
    scheme   : 'black-yellow',
    loading: function( status ) {
      var loading = $( '.button' );

      if ( status ) {
        loading.addClass( 'active' );
      } else {
        loading.removeClass( 'active' );
      }
    },
    listener: function() {
      $( '.button' ).click(function( e ) {
        e.preventDefault();
        $( this ).toggleClass( 'selected' );
        $( '.menu' ).toggleClass( 'active' );
      });

      $( '#color' ).change(function() {
        $( 'body' ).removeClass( App.scheme );
        App.scheme = $( this ).val();
        $( 'body' ).addClass( App.scheme );
      });
    },
    run: function() {
      this.refresh = parseInt( $( '#refresh' ).val() * 1000 );
      if ( this.tryCount <= 3 ) {
        console.info( 'START: Grabbing new tweets (Try: ' + this.tryCount + ')...' );
        App.loadTweets(function() {
          $( '.date' ).timeago();
          console.info( 'END: done grabbing new tweets.' );
          console.info( 'Waiting ' + ( App.refresh / 1000 ) + ' seconds before grabbing new tweets...' );
          setTimeout(function() {
            console.info( 'Attempting to grab new tweets...' );
            App.run();
          }, App.refresh );
        });
      } else {
        $( '.error' ).addClass( 'active' );
        $( '.none' ).removeClass( 'active' );
        console.error( 'Error, stopped. Refreshing in 3 seconds...' );
        setTimeout(function() {
          location.reload();
        }, 3000);
      }
    },
    init: function() {
      this.list = $( '#list' );

      $( '#callback' ).val( window.location.href + 'api.php' )
                      .attr( 'placeholder', window.location.href + 'api.php' );

      this.listener();

      this.startRotate();
    },
    tick: function() {
      if( this.rotate ) {
        console.info( 'Starting tick (Current: ' + this.current + ')...' );
        this.wait = parseInt( $( '#time' ).val() ) * 1000;
        var elements = $( 'li', this.list ),
            length   = elements.length,
            visible  = elements.map(function() {
                         if ( $( this ).css( 'opacity' ) == '1' )
                           return this;
                       });;

        if ( length ) {
          console.info( 'Tweets found.' );
          if ( ! visible.length ) {
            console.info( 'No tweets visible, showing the first...' );
            $( 'li:first-child', this.list ).animate({
              opacity: 1
            }, 500, function() {
              console.info( 'tweet shown.' );
              console.info( 'Waiting ' + ( App.wait / 1000 ) + ' seconds before tick.' );
              setTimeout(function() {
                App.current++;
                if ( App.current >= length ) App.current = 0;
                App.tick();
              }, App.wait );
            });
          } else {
            console.info( 'Tweets visible. Hiding visible...' );
            $( visible ).animate({
              opacity: 0
            }, 500, function() {
              console.info( 'visible hidden.' );
              console.info( 'Showing the next...' );
              $( 'li', this.list ).eq( App.current ).animate({
                opacity: 1
              }, 500, function() {
                console.info('tweet shown.');
                console.info( 'Waiting ' + ( App.wait / 1000 ) + ' seconds before tick.' );
                setTimeout(function() {
                  App.current++;
                  if ( App.current >= length ) App.current = 0;
                  App.tick();
                }, App.wait );
              });
            });
          }
        } else {
          console.error( 'No tweets found.' );
          console.info( 'Waiting ' + ( App.wait / 1000 ) + ' seconds before tick.' );
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
          console.info( tweets.length + ' tweets loaded.' );
          App.tryCount = 0;
          $( '.none' ).removeClass( 'active' );
          var count = tweets.length;
          $.each( tweets, function() {
            App.addTweet( this );
            count--;
            if ( count <= 0 ) callback();
          });
        } else {
          console.error( 'Unable to load tweets.' );
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
          id             : $( '#id' ).val(),
          type           : 'list',
          user           : $( '#user' ).val(),
          limit          : $( '#limit' ).val(),
          consumerKet    : $( '#consumerKet' ).val(),
          consumerSecret : $( '#consumerSecret' ).val(),
          callback       : $( '#callback' ).val()
        }, function( response ) {
          App.calling = false;
          App.loading(0);
          callback( response );
        });
      }
    },
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

      this.list.append( li );

      this.current = 0;
    },
    startRotate: function() {
      console.info( 'Started rotation.' );
      this.rotate = true;
      this.run();
      this.tick();
    },
    stopRotate: function() {
      console.info( 'Rotation stopped.' );
      this.rotate = false;
    }
  };

  $( function() {
    App.init();
  });
})( jQuery );