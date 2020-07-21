
const faunadb = require('faunadb')
const q = faunadb.query

exports.handler = async ( event, context ) => {

    let body = JSON.parse(event.body)

    const client = new faunadb.Client( { secret: process.env.FAUNADB_SECRET } );
    return client.query(
        q.Map(
            q.Paginate(
                q.Match(q.Index("user_year_month"), [body.user, body.year, body.month])
            ),
            q.Lambda("X", q.Get(q.Var("X")))
          )
    ).then( ( response ) => {
        console.log( "items-read-month success: ", response );
        response.evt = Object.assign( {},event);
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