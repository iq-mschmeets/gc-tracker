
// import faunadb from 'faunadb'
const faunadb = require('faunadb')
const q = faunadb.query

exports.handler = async (event, context) =>  {
    const user = event.body.user;
    const month = event.body.month;
    const year = event.body.year;
    
    const client = new faunadb.Client( { secret: process.env.FAUNADB_SECRET } );
    return client.query(
        q.Map(
            q.Paginate(
              q.Match(q.Index("user_year_month"), ["mschmeets@gmail.com", 2020, 7])
            ),
            q.Lambda("X", q.Get(q.Var("X")))
          )
        // q.Map(
            // q.Paginate(
            //     q.Match( q.Index( "event_user_year_month" ), [
            //         { data: { user: user } },
            //         { data: { year: year } },
            //         { data: { month: month} }
            //     ] )
            // )
        // )
    ).then( ( response ) => {
        console.log( "items-read-month success: ", response );
        response.evt = event.body;
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