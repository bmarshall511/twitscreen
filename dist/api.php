<?php
use Abraham\TwitterOAuth\TwitterOAuth;
session_start();

// Helper functions
function txt2link( $txt ) {
  $reg_exUrl = "/(http|https|ftp|ftps)\:\/\/[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,3}(\/\S*)?/";
  if ( preg_match( $reg_exUrl, $txt, $url ) ) {
    return preg_replace( $reg_exUrl, "<a href='" . $url[0] . "'>" . $url[0] . "</a> ", $txt );
  } else {
    return $txt;
  }
}

function parseTweets( $tweets ) {
  $result = array();
  foreach( $tweets as $key => $obj ) {
    $obj->text = txt2link( $obj->text );
    $obj->text = preg_replace( "/@(\w+)/i", "<a href=\"http://twitter.com/$1\" target=\"_blank\" class=\"at\">$0</a>", $obj->text );
    $obj->text = preg_replace( "/#(\w+)/i", "<a href=\"http://twitter.com/hashtag/$1\" target=\"_blank\" class=\"hash\">$0</a>", $obj->text );
    $result[$key] = $obj;
  }
  return $result;
}

// Define variables
$connected      = false;
$id             = isset( $_REQUEST['id'] ) ? strip_tags( $_REQUEST['id'] ) : false;
$type           = isset( $_REQUEST['type'] ) ? strip_tags( $_REQUEST['type'] ) : false;
$limit          = isset( $_REQUEST['limit'] ) ? intval( strip_tags( $_REQUEST['limit'] ) ) : 5;
$username       = isset( $_REQUEST['user'] ) ? strip_tags( $_REQUEST['user'] ) : false;
$consumerKey    = isset( $_REQUEST['consumerKey'] ) ? strip_tags( $_REQUEST['consumerKey'] ) : false;
$consumerSecret = isset( $_REQUEST['consumerSecret'] ) ? strip_tags( $_REQUEST['consumerSecret'] ) : false;
$callback       = isset( $_REQUEST['callback'] ) ? strip_tags( $_REQUEST['callback'] ) : false;
$tweets         = array();
$connection     = false;

// Load the config
if ( file_exists( dirname( __FILE__ ) . '/config.local.php' ) ) {
  require_once( dirname( __FILE__ ) . '/config.local.php' );
} else {
  require_once( dirname( __FILE__ ) . '/config.php' );
}

if ( $consumerKey ) {
  $config['TWITTER_CONSUMER_KEY'] = $consumerKey;
}

if ( $consumerSecret ) {
  $config['TWITTER_CONSUMER_SECRET'] = $consumerSecret;
}

if ( $callback ) {
  $config['TWITTER_OAUTH_CALLBACK'] = $callback;
}


// Load the TwitterOAuth library
require 'vendor/autoload.php';

// Check if authorized
if (
  empty( $_SESSION['oauth_token'] ) ||
  empty( $_SESSION['oauth_token_secret'] )
  ) {
  $connection = new TwitterOAuth( $config['TWITTER_CONSUMER_KEY'], $config['TWITTER_CONSUMER_SECRET'] );
  $connection->setTimeouts(10, 15);
  try {
    $request_token = $connection->oauth( 'oauth/request_token', array( 'oauth_callback' => $config['TWITTER_OAUTH_CALLBACK'] ) );

    $_SESSION['oauth_token']        = ! empty( $request_token['access_token'] ) ? $request_token['access_token'] : false;
    $_SESSION['oauth_token_secret'] = ! empty( $request_token['oauth_token_secret'] ) ? $request_token['oauth_token_secret'] : false;

    $connected = true;
  }
  catch ( Exception $e ) {
  }
} else {
  $connected = true;
}

if ( $connected ) {
  // Load the cache library
  $cache_string = $type . '-' . $id . '-' . $limit;
  require_once dirname( __FILE__ ) . '/CacheBlocks.php';
  $Cache = new CacheBlocks( 'cache/', $config['CACHE_TIME'] );
  if ( ! $tweets = $Cache->Load( $cache_string ) ) {
    if(
      ! empty( $config['TWITTER_CONSUMER_KEY'] ) &&
      ! empty( $config['TWITTER_CONSUMER_SECRET'] ) &&
      ! empty( $_SESSION['oauth_token'] ) &&
      ! empty( $_SESSION['oauth_token_secret'] )
      ) {
      $connection = new TwitterOAuth(
        $config['TWITTER_CONSUMER_KEY'],
        $config['TWITTER_CONSUMER_SECRET'],
        $_SESSION['oauth_token'],
        $_SESSION['oauth_token_secret']
      );
      $connection->setTimeouts(10, 15);
    }
    // Get list tweets
    if ( is_numeric( $id ) ) {
      $call = [
        'list_id' => $id,
        'count'   => $limit
      ];
    } else {
      $call = [
        'slug'              => $id,
        'owner_screen_name' => $username,
        'count'             => $limit
      ];
    }
    $list_tweets = $connection->get( 'lists/statuses', $call );

    if ( $connection->getLastHttpCode() == 200 ) {
      $tweets = parseTweets( $list_tweets );
      $Cache->Save( $tweets, $cache_string );
    }
  }
} else {
  $tweets = false;
}

header( 'Content-Type: application/json' );
echo json_encode( $tweets );
die();