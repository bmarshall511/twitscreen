export const queryApi = ( apiUrl, params, callback, error ) => {
  let options = {
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  }

  if ( Object.keys( params ).length ) {
    let postFields = '';
    for(let i = 0;i < Object.keys(params).length;i++) {
      if ( postFields.length ) postFields += '&';
      postFields += Object.keys(params)[i] + '=' + params[Object.keys(params)[i]];
    }

    options.body = postFields;
  }

  fetch( apiUrl, options )
    .then(res => res.json())
    .then(
      ( result ) => {
        if ( typeof callback === 'function' ) {
          callback( result );
        }
      },
      ( error ) => {
        if ( typeof error === 'function' ) {
          callback( error );
        }
      }
    );
};

export const endpointLoop = ( endpoints, endpointCallback ) => {
  for(let i = 0;i < Object.keys(endpoints).length;i++) {
    if ( typeof endpointCallback === 'function' ) {
      endpointCallback( Object.keys(endpoints)[i] );
    }
  }
}
