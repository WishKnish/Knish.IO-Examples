const express = require('express')
const path = require('path')
const parseUrl = require('body-parser')
const { KnishIOClient } = require( "@wishknish/knishio-client-js/src" );
const PORT = process.env.PORT || 5000
const encodeUrl = parseUrl.urlencoded({ extended: false })

express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .post('/', encodeUrl, (req, res) => {
    console.log('Form request:', req.body)

    const client = new KnishIOClient( {
      uri: req.uri,
      cellSlug: req.cell,
      serverSdkVersion: req.legacy === 'true' ? 2 : 3
    } );

    console.log(client);

    res.sendStatus(200)
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
