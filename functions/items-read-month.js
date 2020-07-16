
import faunadb from 'faunadb'

const q = faunadb.query;
const client = new faunadb.Client( { secret: process.env.FAUNADB_SECRET } );

exports.handler = ( event, context, callback ) => {
    const user = event.queryStringParameters.user;
    const month = event.queryStringParameters.month;
    const year = event.queryStringParameters.year;

    return client.query(
        q.Map(
            q.Paginate(
                q.Match( q.Index( "item_user_year_month" ), [ user, year, month ] )
            )
        )
    ).then( ( response ) => {
        console.log( "items-read-month success: ", response );
        return callback( null, {
            statusCode: 200,
            body: JSON.stringify( response )
        } );
    } ).catch( ( error ) => { 
        console.log( "items-read-month error: ", error );
        return callback( null, {
            statusCode: 400,
            body: JSON.stringify(error)
        })
    } );

 };