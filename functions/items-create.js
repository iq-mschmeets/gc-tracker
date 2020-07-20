

// import { query, Client } from 'faunadb';
const faunadb = require('faunadb')
const q = faunadb.query

exports.handler = async (event, context) => {
    const client = new faunadb.Client( { secret: process.env.FAUNADB_SECRET } );

    const data = JSON.parse( event.body );
    const newItem = {
        data: data
    };

    return client.query(q.Create(
        q.Collection( "event" ),
        newItem
    ) ).then( ( response ) => {
        console.log( "item-create success: ", response );
        return {
            statusCode: 200,
            body: JSON.stringify( response )
        }
    } ).catch( ( error ) => { 
        console.log( "item-create error: ", error );
        return {
            statusCode: 400,
            body: JSON.stringify( error )
        }
    })

}