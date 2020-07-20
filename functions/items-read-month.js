
// import faunadb from 'faunadb'
const faunadb = require('faunadb')
const q = faunadb.query

exports.handler = async (event, context) =>  {
    const user = event.queryStringParameters.user;
    const month = event.queryStringParameters.month;
    const year = event.queryStringParameters.year;
    
    const client = new faunadb.Client( { secret: process.env.FAUNADB_SECRET } );
    return client.query(
        q.Map(
            q.Paginate(
                q.Match( q.Index( "item_user_year_month" ), [ user, year, month ] )
            )
        )
    ).then( ( response ) => {
        console.log( "items-read-month success: ", response );
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