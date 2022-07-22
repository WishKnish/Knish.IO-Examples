const express = require('express')
const path = require('path')
const parseUrl = require('body-parser')
const PORT = process.env.PORT || 5000
const encodeUrl = parseUrl.urlencoded({ extended: false })
const { KnishIOClient, generateSecret } = require( '@wishknish/knishio-client-js/dist/client.umd.js' );
const secret = generateSecret();

express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, '../views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .post('/', encodeUrl, async (req, res) => {
    console.log('Form request:', req.body)


    const client = new KnishIOClient( {
      uri: req.body.uri,
      cellSlug: req.body.cell,
      serverSdkVersion: req.body.legacy === 'true' ? 2 : 3
    } );
    //  console.log(client);


    // Request an auth token
    let response = await client.requestAuthToken( {
        secret,
        cellSlug: req.cell
    } );
    //  console.log(response);


    let metaType = 'testMetaType';
    let metaId = 'testMetaId';

    // Create a meta instance
    response = await client.createMeta( {
    metaType,
    metaId,
      meta: {
        testKey1: 'testValue1',
        testKey2: 'testValue2'
      },
    } );
    //  console.log(response);

    // Query created meta
    response = await client.queryMeta( {
        metaType,
        metaId
    } )
    console.log(response);
    console.log(response[ 'instances' ][ 0 ].metas);


    res.sendStatus(200)
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
