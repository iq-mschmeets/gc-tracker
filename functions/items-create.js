

import faunadb from 'faunadb';


const q = faunadb.query;
const client = new faunadb.Client( { secret: process.env.FAUNADB_SECRET } );

exports.handler = ( event, context, callback ) => {
    const data = JSON.parse( event.body );

    const newItem = {
        data: data
    };

    return client.query(q.Create(
        q.Collection( "event" ),
        newItem
    ) ).then( ( response ) => {
        console.log( "item-create success: ", response );
        return callback( null, {
            statusCode: 200,
            body: JSON.stringify( response )
        } );
    } ).catch( ( error ) => { 
        console.log( "item-create error: ", error );
        return callback( null, {
            statusCode: 400,
            body: JSON.stringify( error );
        })
    })

}