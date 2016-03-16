<?php 

error_reporting(E_ALL);

/**
 * Cache data to decrease the page load time
 *
 * @version $Rev$
 */
class CacheBlocks
{
	
	/**
	 * A unique id for this cacheblock
	 *
	 * @var string
	 */
	private $_id;
	
	/**
	 * Cached content
	 * 
	 * @var string
	 */
	private $_content;
	
	/**
	 * Cache directory
	 * 
	 * @var string
	 */
	private $_directory;
	
	/**
	 * Time to live
	 * 
	 * @var int
	 */
	private $_ttl;
	
	/**
	 * Verbose mode
	 * 
	 * @var bool
	 */
	private $_verbose = FALSE;
	
	/**
	 * Verbose states
	 * 
	 * @var array
	 */
	private $_verbose_states;
	
	/**
	 * Execution start time
	 * 
	 * @var int
	 */
	private $_starttime;
	
	/**
	 * Constructor
	 * 
	 * @access public
	 * @param string $directory // The directory where to save the cached content.
	 * @param int $ttl // Cache is refreshed after x seconds
	 * @return void
	 */
	public function __construct($directory, $ttl=86400){
		
		// Set directory
		$this->_directory = substr($directory, -1) == "/" ? $directory : $directory . "/";
		
		// Prepare cache dir
		$this->prepDirectory($this->_directory);
		
		// Set time to live
		$this->_ttl = $ttl;
		
		// Execution start time
		$mtime = microtime(); 
	   	$mtime = explode(" ",$mtime); 
	   	$this->_starttime = $mtime[1] + $mtime[0]; 
		
	}
	
	/**
	 * Destructor
	 * 
	 * @access public
	 * @return void
	 */
	public function __destruct(){
		if($this->_verbose){
			echo "<br />------------ CACHE VERBOSE ------------<br />" . implode("<br />", $this->_verbose_states) . "<br />------------ CACHE VERBOSE ------------<br />";
			
			// Calculate execution time
			$mtime = microtime(); 
			$mtime = explode(" ",$mtime); 
			$mtime = $mtime[1] + $mtime[0]; 
			$endtime = $mtime; 
			$totaltime = ($endtime - $this->_starttime); 
			echo "<br /><strong>Execution time:</strong> " . $totaltime . " seconds.";
		}
	}
	
	/**
	 * Load data from cache
	 * 
	 * @access public
	 * @param string $id
	 * @return string
	 */
	public function Load($id){
		
		$this->_id = $this->clean($id);
		
		// Get clean name
		$filename = $this->_directory . $this->_id . ".cache";
		
		// Check if cache is valid
		if($this->isValid($filename)){
			return $this->read($filename);
		}else{
			return FALSE;
		}
		
	}
	
	/**
	 * Save data to cache
	 * 
	 * @access public
	 * @param string|object|array $data
	 * @param string $id
	 * @param int $ttl
	 * @return string|object|array
	 */
	public function Save($data, $id){
		
		$this->_id = $this->clean($id);
		
		// Get clean name
		$filename = $this->_directory . $this->_id . ".cache";
		
		// Check if cache is valid
		$this->write($data, $filename);
		
	}
	
	/**
	 * Start caching output
	 * 
	 * @access public
	 * @param string id
	 * @return void
	 */
	public function Start($id){
		
		// Get clean name
		$this->_id = $this->clean($id);
		$filename = $this->_directory . $this->clean($id) . ".cache";
		if(!$this->isValid($filename)){
			ob_start();
	        ob_implicit_flush(false);
	        return FALSE;
		}else{
			return TRUE;
		}
		
	}
	
	/**
	 * Get the data from the buffer and write
	 * it to the cache file
	 * 
	 * @access public
	 * @return string
	 */
	public function Stop(){
		
		// Get clean name
		$filename = $this->_directory . $this->_id . ".cache";
		
		if(!$this->isValid($filename)){
			$output = ob_get_contents();
        	ob_end_clean();
        	$this->write($output, $filename, FALSE);
		}else{
			$output = $this->read($filename, FALSE);
		}
        
        return $output;
	}
	
	/**
	 * Activate/Deactivate verbose mode
	 * 
	 * @access public
	 * @param bool $state
	 * @return void
	 */
	public function SetVerbose($state){
		$this->_verbose = $state;
	}
	
	/**
	 * Check if a cache file is valid
	 * 
	 * @access private
	 * @param string $filename
	 * @return bool
	 */
	private function isValid($filename){
		if(file_exists($filename) && (filemtime($filename) > (time() - $this->_ttl))){
			if($this->_verbose) $this->_verbose_states[] = $this->_id . ": load from cache";
			return TRUE;
		}else{
			if($this->_verbose) $this->_verbose_states[] = $this->_id . ": not from cache";
			return FALSE;	
		}
	}
	
	/**
	 * Read cache file
	 * 
	 * @access private
	 * @param string $filename
	 * @param bool $serialize
	 * @return string|object|array|bool
	 */
	private function read($filename, $serialize=TRUE){
		if(file_exists($filename)){
			//$content = file_get_contents($filename);
			$handle = fopen($filename, "r");
			$content = fread($handle, filesize($filename));
			fclose($handle);
			return ($serialize == TRUE) ? unserialize($content) : $content;
		}else{
			return FALSE;
		}
	}
	
	/**
	 * Write content to file
	 * 
	 * @access private
	 * @param string|object|array $data
	 * @param string $filename
	 * @param bool $serialize
	 * @return void
	 */
	private function write($data, $filename, $serialize=TRUE){
		$content = ($serialize == TRUE) ? serialize($data) : $data;
		//file_put_contents($filename, $content);
		$handle = fopen($filename, 'w');
		fwrite($handle, $content);
		fclose($handle);
	}
	
	/**
	 * Cleanup name to use it in the filename
	 * 
	 * @access private
	 * @param string $string
	 * @return string
	 */
	private function clean($string){
		$string = trim($string);
		$string = str_replace(array(" ", "."), array("", "-"), $string);
		$string = strtolower($string);
		return $string;
	}
	
	/**
	 * Prepare directory
	 * 
	 * @access public
	 * @param string $dir
	 * @return void
	 */
	private function prepDirectory($dir){
		if(!is_dir($dir)){
			@mkdir($dir, "0755");
		}
	}
	
	/**
	 * Set the time to live
	 * 
	 * @access public
	 * @param int
	 * @return void
	 */
	public function SetTtl($seconds){
		$this->_ttl = $seconds;
	}
	
	/**
	 * Cache a complete page
	 * 
	 * @todo Finische the page cache
	 * 
	 * @access public
	 * @return void
	 */
	public function Page(){
		$request = $_SERVER['REQUEST_URI'];
		$cachename = str_replace(array("/", "-", "=", "+"), "_", $request);
		$cachefile = $this->_directory . $cachename . ".cache";
		if($this->isValid($cachefile)){
			echo $this->read($cachefile, FALSE);
			exit();
		}
		//echo "*3";
		// Buffer output
		ob_start(array( &$this, "EndPage"));
		
	}
	
	/**
	 * Callback for Page cache
	 * 
	 * @todo Finische the page cache
	 * 
	 * @access public
	 * @return string
	 */
	public function EndPage($buffer){
		
		file_put_contents("qsdfqs", "test.txt");
		// Get filename
		$request = $_SERVER['REQUEST_URI'];
		$cachename = str_replace(array("/", "-", "=", "+"), "_", $request);
		$cachefile = $this->_directory . $cachename . ".cache";
		
		$this->write("sqf", "page.test", FALSE);
		
		return $this->clean("test test"). $buffer . "**-**-**";
		
		// Save buffer
        $this->write($buffer, $cachefile, FALSE);
        //echo $buffer;
	}
	
	/**
	 * Remove all cache files
	 *
	 * @access public
	 * @return void
	 */
	public function Clear(){
		$dirhandle = @opendir($this->_directory) or die("Unable to open " . $this->_directory);
		while ($file = readdir($dirhandle)) 
		{
			if(substr($file, -6) == ".cache") unlink($this->_directory . $file);
		}
		closedir($dirhandle);
	}
	
	/**
	 * Return the execution time
	 * 
	 * @access public
	 * @return double
	 */
	public function GetTime(){
		// Calculate execution time
		$mtime = microtime(); 
		$mtime = explode(" ",$mtime); 
		$mtime = $mtime[1] + $mtime[0]; 
		$endtime = $mtime; 
		return ($endtime - $this->_starttime); 
	}
}



if (! function_exists ( 'file_get_contents' )) {
	define ( 'PHP_COMPAT_FILE_GET_CONTENTS_MAX_REDIRECTS', 5 );
	
	function file_get_contents($filename, $incpath = false, $resource_context = null) {
		if (is_resource ( $resource_context ) && function_exists ( 'stream_context_get_options' )) {
			$opts = stream_context_get_options ( $resource_context );
		}
		
		$colon_pos = strpos ( $filename, '://' );
		$wrapper = $colon_pos === false ? 'file' : substr ( $filename, 0, $colon_pos );
		$opts = (empty ( $opts ) || empty ( $opts [$wrapper] )) ? array () : $opts [$wrapper];
		
		switch ($wrapper) {
			case 'http' :
				$max_redirects = (isset ( $opts [$wrapper] ['max_redirects'] ) ? $opts [$proto] ['max_redirects'] : PHP_COMPAT_FILE_GET_CONTENTS_MAX_REDIRECTS);
				for($i = 0; $i < $max_redirects; $i ++) {
					$contents = php_compat_http_get_contents_helper ( $filename, $opts );
					if (is_array ( $contents )) {
						// redirected
						$filename = rtrim ( $contents [1] );
						$contents = '';
						continue;
					}
					return $contents;
				}
				user_error ( 'redirect limit exceeded', E_USER_WARNING );
				return;
			case 'ftp' :
			case 'https' :
			case 'ftps' :
			case 'socket' :
			// tbc               
		}
		
		if (false === $fh = fopen ( $filename, 'rb', $incpath )) {
			user_error ( 'failed to open stream: No such file or directory', E_USER_WARNING );
			return false;
		}
		
		clearstatcache ();
		if ($fsize = @filesize ( $filename )) {
			$data = fread ( $fh, $fsize );
		} else {
			$data = '';
			while ( ! feof ( $fh ) ) {
				$data .= fread ( $fh, 8192 );
			}
		}
		
		fclose ( $fh );
		return $data;
	}
	

	function php_compat_http_get_contents_helper($filename, $opts) {
		$path = parse_url ( $filename );
		if (! isset ( $path ['host'] )) {
			return '';
		}
		$fp = fsockopen ( $path ['host'], 80, $errno, $errstr, 4 );
		if (! $fp) {
			return '';
		}
		if (! isset ( $path ['path'] )) {
			$path ['path'] = '/';
		}
		
		$headers = array ('Host' => $path ['host'], 'Conection' => 'close' );
		
		// enforce some options (proxy isn't supported) 
		$opts_defaults = array ('method' => 'GET', 'header' => null, 'user_agent' => ini_get ( 'user_agent' ), 'content' => null, 'request_fulluri' => false );
		
		foreach ( $opts_defaults as $key => $value ) {
			if (! isset ( $opts [$key] )) {
				$opts [$key] = $value;
			}
		}
		$opts ['path'] = $opts ['request_fulluri'] ? $filename : $path ['path'];
		
		// build request
		$request = $opts ['method'] . ' ' . $opts ['path'] . " HTTP/1.0\r\n";
		
		// build headers
		if (isset ( $opts ['header'] )) {
			$optheaders = explode ( "\r\n", $opts ['header'] );
			for($i = count ( $optheaders ); $i --;) {
				$sep_pos = strpos ( $optheaders [$i], ': ' );
				$headers [substr ( $optheaders [$i], 0, $sep_pos )] = substr ( $optheaders [$i], $sep_pos + 2 );
			}
		}
		foreach ( $headers as $key => $value ) {
			$request .= "$key: $value\r\n";
		}
		$request .= "\r\n" . $opts ['content'];
		
		// make request
		fputs ( $fp, $request );
		$response = '';
		while ( ! feof ( $fp ) ) {
			$response .= fgets ( $fp, 8192 );
		}
		fclose ( $fp );
		$content_pos = strpos ( $response, "\r\n\r\n" );
		
		// recurse for redirects
		if (preg_match ( '/^Location: (.*)$/mi', $response, $matches )) {
			return $matches;
		}
		return ($content_pos != - 1 ? substr ( $response, $content_pos + 4 ) : $response);
	}
	
	function php_compat_ftp_get_contents_helper($filename, $opts) {
	}
}

if (! function_exists ( 'file_put_contents' )) {
	
	if (! defined ( 'FILE_USE_INCLUDE_PATH' )) {
		define ( 'FILE_USE_INCLUDE_PATH', 1 );
	}
	
	if (! defined ( 'LOCK_EX' )) {
		define ( 'LOCK_EX', 2 );
	}
	
	if (! defined ( 'FILE_APPEND' )) {
		define ( 'FILE_APPEND', 8 );
	}
	
	function file_put_contents($filename, $content, $flags = null, $resource_context = null) {
		// If $content is an array, convert it to a string
		if (is_array ( $content )) {
			$content = implode ( '', $content );
		}
		
		// If we don't have a string, throw an error
		if (! is_scalar ( $content )) {
			user_error ( 'file_put_contents() The 2nd parameter should be either a string or an array', E_USER_WARNING );
			return false;
		}
		
		// Get the length of data to write
		$length = strlen ( $content );
		
		// Check what mode we are using
		$mode = ($flags & FILE_APPEND) ? 'a' : 'wb';
		
		// Check if we're using the include path
		$use_inc_path = ($flags & FILE_USE_INCLUDE_PATH) ? true : false;
		
		// Open the file for writing
		if (($fh = @fopen ( $filename, $mode, $use_inc_path )) === false) {
			user_error ( 'file_put_contents() failed to open stream: Permission denied', E_USER_WARNING );
			return false;
		}
		
		// Attempt to get an exclusive lock
		$use_lock = ($flags & LOCK_EX) ? true : false;
		if ($use_lock === true) {
			if (! flock ( $fh, LOCK_EX )) {
				return false;
			}
		}
		
		// Write to the file
		$bytes = 0;
		if (($bytes = @fwrite ( $fh, $content )) === false) {
			$errormsg = sprintf ( 'file_put_contents() Failed to write %d bytes to %s', $length, $filename );
			user_error ( $errormsg, E_USER_WARNING );
			return false;
		}
		
		// Close the handle
		@fclose ( $fh );
		
		// Check all the data was written
		if ($bytes != $length) {
			$errormsg = sprintf ( 'file_put_contents() Only %d of %d bytes written, possibly out of free disk space.', $bytes, $length );
			user_error ( $errormsg, E_USER_WARNING );
			return false;
		}
		
		// Return length
		return $bytes;
	}

}
