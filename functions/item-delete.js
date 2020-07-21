
const faunadb = require('faunadb')
const q = faunadb.query

exports.handler = async ( event, context ) => {

    
    const id = getId( event.path );

    const client = new faunadb.Client( { secret: process.env.FAUNADB_SECRET } );
    return client.query(
        q.Delete(
            q.Ref(
                q.Collection( "event" ),
                id
            )
        )
    ).then( ( response ) => {
        response.removedId = id;
        return {
            statusCode: 200,
            body: JSON.stringify( response )
        };
    } ).catch( ( error ) => {
        console.log( "items-read-month error: ", error );
        return {
            statusCode: 400,
            body: JSON.stringify(error)
        }
    } );

 }

function getId(urlPath) {
    return urlPath.match(/([^\/]*)\/*$/)[0]
}