<?php
use Abraham\TwitterOAuth\TwitterOAuth;
session_start();

// Load the TwitterOAuth library
require dirname( __FILE__ ) . '/vendor/autoload.php';

// Include the Cache library
require_once dirname( __FILE__ ) . '/CacheBlocks.php';

class Twitscreen {
  private $app_settings = array(
    'consumer_key'    => false,
    'consumer_secret' => false,
    'callback'        => false,
    'cache_expires'   => 0
  );

  public $response = array(
    'error'  => array(),
    'tweets' => array(),
    'url'    => false
  );

  private $options    = array();
  private $cache      = false;
  private $connection = false;

  public function __construct() {
    $this->cache = new CacheBlocks(  dirname( __FILE__ ) . '/cache/', $this->app_settings['cache_expires'] );
  }

  public function consumer_key( $key ) {
    $this->app_settings['consumer_key'] = $key;
  }

  public function consumer_secret( $secret ) {
    $this->app_settings['consumer_secret'] = $secret;
  }

  public function callback( $url ) {
    $this->app_settings['callback'] = $url;
  }

  public function set_tokens( $call, $args ) {
    $this->connection = new TwitterOAuth( $this->app_settings['consumer_key'], $this->app_settings['consumer_secret'] );
    $this->connection->setTimeouts( 10, 15 );

    try {
      $token = $this->connection->oauth( $call, $args );

      $_SESSION['oauth_token']        = ! empty( $token['oauth_token'] ) ? $token['oauth_token'] : false;
      $_SESSION['oauth_token_secret'] = ! empty( $token['oauth_token_secret'] ) ? $token['oauth_token_secret'] : false;
    }
    catch ( Exception $e ) {
      $this->response['error'][] = $e;
    }
  }

  public function twitter_callback() {
    if (
      ! empty( $_REQUEST['oauth_token'] ) &&
      ! empty( $_REQUEST['oauth_verifier'] )
      ) {

      $this->set_tokens( 'oauth/access_token', array(
        'oauth_verifier' => strip_tags( $_REQUEST['oauth_verifier'] ),
        'oauth_token'    => strip_tags( $_REQUEST['oauth_token'] )
      ) );

      header( 'Location: index.html' );
      die();
    }
  }

  public function cache_string( $options ) {
    $string = false;
    foreach( $options as $key => $value ) {
      if ( $value ) {
        if ( is_array( $value ) ) {
          foreach( $value as $k => $v ) {
            if ( $string ) $string .= '-';
            $string .= preg_replace( '/[^a-zA-Z0-9\s]/', '-', $v );
          }
        } else {
          if ( $string ) $string .= '-';
          $string .= preg_replace( '/[^a-zA-Z0-9\s]/', '-', $value );
        }
      }
    }

    return $string;
  }

  public function txt2link( $txt ) {
    $reg_exUrl = "/(http|https|ftp|ftps)\:\/\/[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,3}(\/\S*)?/";
    if ( preg_match( $reg_exUrl, $txt, $url ) ) {
      return preg_replace( $reg_exUrl, "<a href='" . $url[0] . "'>" . $url[0] . "</a> ", $txt );
    } else {
      return $txt;
    }
  }

  public function parse_response( $response ) {
    $result = array();

    if ( ! empty( $response->statuses ) && count( $response->statuses ) ) {
      if ( ! empty( $response->search_metadata ) ) {
        $_SESSION['max_id'] = $response->search_metadata->max_id;
      }

      $response = $response->statuses;
    }

    foreach( $response as $key => $obj ) {
      $obj->text = $this->txt2link( $obj->text );
      $obj->text = preg_replace( "/@(\w+)/i", "<a href=\"http://twitter.com/$1\" target=\"_blank\" class=\"at\">$0</a>", $obj->text );
      $obj->text = preg_replace( "/#(\w+)/i", "<a href=\"http://twitter.com/hashtag/$1\" target=\"_blank\" class=\"hash\">$0</a>", $obj->text );
      $result[$key] = $obj;
    }
    return $result;
  }

  public function make_call( $api_call ) {
    // Check tokens
    if (
      empty( $_SESSION['oauth_token'] ) ||
      empty( $_SESSION['oauth_token_secret'] )
    ) {
      $this->set_tokens( 'oauth/request_token', array(
        'oauth_callback' => $this->app_settings['callback']
      ));
    }

    if ( ! count( $this->response['error'] ) ) {
      $connection = new TwitterOAuth(
        $this->app_settings['consumer_key'],
        $this->app_settings['consumer_secret'],
        $_SESSION['oauth_token'],
        $_SESSION['oauth_token_secret']
      );
      $connection->setTimeouts( 10, 15 );

      $api_response = $connection->get( $api_call, $this->options );
      if ( ! empty( $api_response->errors ) ) {
        // There was a problem
        switch( $api_response->errors[0]->code ) {
          case 89: // Invalid or expired token.
            $this->set_tokens( 'oauth/request_token', array(
              'oauth_callback' => $this->app_settings['callback']
            ));
            $this->response['url'] = $connection->url( 'oauth/authorize', array( 'oauth_token' => $_SESSION['oauth_token'] ) );
            break;
          default:
            $this->response['error'][] = $connection->getLastBody();
        }
      } else {
        if ( count( $this->response['tweets'] ) ) {
          $tweets = array();
          foreach( $this->response['tweets'] as $key => $obj ) {
            $tweets[] = $obj;
          }
          foreach( $this->parse_response( $api_response ) as $key => $obj ) {
            $tweets[] = $obj;
          }

          $this->response['tweets'] = $tweets;
        } else {
          $this->response['tweets'] = $this->parse_response( $api_response );
        }
      }
    }
  }

  public function prepare_options( $api_call, $options ) {
    $this->options = array();
    $args          = array();

    // Set globals
    $this->options['count']            = $options['limit'];
    $this->options['include_entities'] = false;

    if ( ! empty( $_SESSION['max_id'] ) ) {
      $this->options['since_id'] = $_SESSION['max_id'];
    }

    switch( $api_call ) {
      case 'lists/statuses':

        // Set list ID
        if ( is_numeric( $options['listID'] ) ) {
          $this->options['list_id'] = $options['listID'];
        } else {
          $this->options['slug'] = $options['listID'];
        }

        // Set username
        if ( is_numeric( $options['username'] ) ) {
          $this->options['owner_id'] = $options['username'];
        } else {
          $this->options['owner_screen_name'] = $options['username'];
        }
        break;
      case 'statuses/home_timeline':
        $this->options['contributor_details'] = false;
        break;
      case 'statuses/user_timeline':
        $this->options['contributor_details'] = false;

        // Set username
        if ( is_numeric( $options['username'] ) ) {
          $this->options['owner_id'] = $options['username'];
        } else {
          $this->options['owner_screen_name'] = $options['username'];
        }
        break;
      case 'search/tweets':
        $this->options['q'] = $options['q'];
        break;
    }
  }

  public function query_api() {
    $options = array(
      'listID'   => ! empty( $_POST['listID'] ) ? strip_tags( $_POST['listID'] ) : false,
      'apis'     => ! empty( $_POST['apis'] ) ? $_POST['apis'] : false,
      'limit'    => ! empty( $_POST['limit'] ) ? intval( strip_tags( $_POST['limit'] ) ) : 5,
      'username' => ! empty( $_POST['user'] ) ? strip_tags( $_POST['user'] ) : false,
      'q'        => ! empty( $_POST['q'] ) ? strip_tags( $_POST['q'] ) : false,
      'runs'     => ! empty( $_POST['runs'] ) ? intval( strip_tags( $_POST['runs'] ) ) : false
    );

    // Reset max_id if first run
    if ( empty( $options['runs '] ) ) {
      $_SESSION['max_id'] = 0;
    }

    /* Validate options */

    // Must provide API calls
    if ( ! $options['apis'] ) {
      $this->response['error'][] = 'No APIs selected.';
    }

    // Check consumer key
    if ( ! $this->app_settings['consumer_key'] ) {
      $this->response['error'][] = 'Invalid consumer key.';
    }

    // Check consumer secret
    if ( ! $this->app_settings['consumer_secret'] ) {
      $this->response['error'][] = 'Invalid consumer secret.';
    }

    if ( ! count( $this->response['error'] ) ) {

      // Load the cache library
      $cache_string = $this->cache_string( $options );

      if ( ! $tweets = $this->cache->Load( $cache_string ) ) {

        // Cache expired, refresh tweets
        foreach( $options['apis'] as $key => $api_call ) {

          // Prepare options for specific API cal
          $this->prepare_options( $api_call, $options );

          // Make the API call
          $this->make_call( $api_call );

          if ( $this->response['url'] ) {
            break;
          }

          if ( count( $this->response['tweets'] ) ) {
            $this->cache->Save( $this->response, $cache_string );
          }
        }
      }
    }
  }

  public function run() {
    // Check if Twitter redirect
    $this->twitter_callback();

    // Make API call
    $this->query_api();
  }
}

$consumer_key    = ! empty( $_POST['consumerKey'] ) ? strip_tags( $_POST['consumerKey'] ) : false;
$consumer_secret = ! empty( $_POST['consumerSecret'] ) ? strip_tags( $_POST['consumerSecret'] ) : false;
$callback        = ( isset($_SERVER['HTTPS']) ? 'https://' : 'http://' ) . $_SERVER['SERVER_NAME'] . $_SERVER['REQUEST_URI'];

if ( is_file( dirname( __FILE__ ) . '/config.local.php' ) ) {
  require_once( dirname( __FILE__ ) . '/config.local.php' );
}

$Twitscreen = new Twitscreen;
$Twitscreen->consumer_key( $consumer_key );
$Twitscreen->consumer_secret( $consumer_secret );
$Twitscreen->callback( $callback );
$Twitscreen->run();

header( 'Content-Type: application/json' );
echo json_encode( $Twitscreen->response );
die();