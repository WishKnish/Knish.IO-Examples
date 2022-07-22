const express = require( 'express' )
const path = require( 'path' )
const parseUrl = require( 'body-parser' )
const PORT = process.env.PORT || 5000
const encodeUrl = parseUrl.urlencoded( { extended: false } )
const { KnishIOClient } = require( '@wishknish/knishio-client-js/dist/client.umd.js' );

express()
  .use( '/public', express.static( __dirname + '/public' ) )
  .set( 'views', path.join( __dirname, 'views' ) )
  .set( 'view engine', 'ejs' )
  .get( '/', ( req, res ) => res.render( 'pages/index' ) )
  .post( '/', encodeUrl, async ( req, res ) => {
    console.log( 'Form request:', req.body )

    // Instantiate the Knish.IO client
    const client = new KnishIOClient( {
      uri: req.body.uri,
      cellSlug: req.body.cell,
      serverSdkVersion: req.body.legacy === 'true' ? 2 : 3
    } );

    if ( req.body.legacy !== 'true' ) {

      // Request an auth token
      await client.requestAuthToken( {
        seed: req.body.seed,
      } );

    }

    let response;
    try {
      switch ( req.body.operation ) {

        case 'read':
          // Query created meta
          response = await client.queryMeta( {
            metaType: req.body.metatype,
            metaId: req.body.metaid
          } )
          break;

        case 'write':
          // Create new meta
          const meta = {};
          meta[ req.body.key ] = req.body.value;
          response = await client.createMeta( {
            metaType: req.body.metatype,
            metaId: req.body.metaid,
            meta
          } );

          if ( response.success() ) {
            response = {
              molecule: response.molecule()
            };
          } else {
            response = {
              error: response.reason()
            }
          }
          break;
      }
    } catch ( e ) {
      response.error = e;
    }
    response.operation = req.body.operation;
    res.send( response );
  } )
  .listen( PORT, () => console.log( `Listening on ${ PORT }` ) )
