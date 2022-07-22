$( 'document ' ).ready( function () {

  // Hiding "write" fields by default
  $( '#meta' ).addClass( 'collapse' );

  // Showing "write" fields if the option is selection on load
  if ( $( "input[name='operation'][value='write']" ).prop( 'checked' ) ) {
    $( '#meta' ).collapse( 'show' );
  }

  // Ensuring that selecting "write" exposes relevant fields
  $( "input[name='operation']" ).change( function () {
    if ( $( "input[name='operation'][value='write']" ).prop( 'checked' ) ) {
      $( '#meta' ).collapse( 'show' );
    } else {
      $( '#meta' ).collapse( 'hide' );
    }
  } );

} );

/**
 * Handles form submit event
 */
function submit () {

  // Resetting output UX
  $( '#response' ).collapse( 'hide' );
  $( '#error' ).collapse( 'hide' );
  $( '#response .contents' ).html( '' );
  $( '#error .contents' ).html( '' );

  // Collecting form data
  const datastring = $( '#form' ).serialize();

  // POSTing AJAX request
  $.ajax( {
    type: 'POST',
    url: '/',
    data: datastring,
    dataType: 'json',
    success: function ( data ) {

      // Showing response block
      $( '#response' ).collapse( 'show' );

      // Populating response block with content
      switch ( data.operation ) {
        case 'read':
          formatReadResponse( data );
          break;
        case 'write':
          formatWriteResponse( data );
          break;
      }

    },
    error: function () {

      // Showing error block
      $( '.error' ).collapse( 'show' );

      // Populating error block with content
      $( '#error > .contents' ).append( 'There was an error submitting your request!' );

    },
  } );
}

/**
 * Formats the meta asset query response into a data table
 * @param data
 */
function formatReadResponse ( data ) {

  let contents = '';

  // Render table header
  data.instances.forEach( instance => {
    contents += `
      <table id="instancesTable${ instance.metaId }" class="table">
        <thead>
          <tr>
            <th colspan="5" class="text-center">
              ${ instance.metaType }: ${ instance.metaId }
            </th>
          </tr>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Key</th>
            <th scope="col">Value</th>
            <th scope="col">Molecular Hash</th>
            <th scope="col">Timestamp</th>
          </tr>
        </thead>
        <tbody>
    `;

    // Render table body
    for ( let metaCount = 0; metaCount < instance.metas.length; metaCount++ ) {
      contents += `
          <tr>
            <th scope="row">${ metaCount + 1 }</th>
            <td>${ instance.metas[ metaCount ].key }</td>
            <td>${ instance.metas[ metaCount ].value }</td>
            <td>${ instance.metas[ metaCount ].molecularHash }</td>
            <td>${ formatDate( instance.metas[ metaCount ].createdAt ) }</td>
          </tr>
      `;
    }

    // Render table footer
    contents += `
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colspan="5" class="text-right">
              Last updated at ${ formatDate( instance.createdAt ) }
            </td>
          </tr>
        </tfoot>
      </table>
    `;

    // Appending table content to the block
    $( '#response > .contents' ).append( contents );

    // Activating data table overlay
    $( `#instancesTable${ instance.metaId }` ).DataTable();

  } );

}

/**
 * Formats the meta asset write response
 * @param data
 */
function formatWriteResponse ( data ) {

  let contents = '';

  if( data.molecule ) {
    contents += `
      Molecule ${ data.molecule.molecularHash }, created at ${ formatDate( data.molecule.createdAt ) }, was ${ data.molecule.status }.
    `;
  }
  else {
    contents += `
      Unable to retrieve molecule data. Please review server output.
    `;
  }

  $( '#response > .contents' ).append( contents );
}

/**
 * Formats a Knish.IO timestamp into a human-readable, sortable date
 * @param timestamp
 * @returns {string}
 */
function formatDate ( timestamp ) {
  const date = new Date( Number( timestamp ) );
  let month = date.getMonth();
  month = month + 1; //javascript date goes from 0 to 11
  if ( month < 10 ) {
    month = '0' + month;
  } //adding the prefix

  const year = date.getFullYear();
  const day = date.getDate();
  const hour = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  return year + "/" + month + "/" + day + " " + hour + ":" + minutes + ":" + seconds;

}
