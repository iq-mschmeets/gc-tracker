import "./styles.css";
import {
  getStore,
  saveStore,
  loadThisMonth,
  filterInPlace,
  getDBId,
  loadMonth
} from "./store.js";
import Measurement from "./Measurement.js";
import GlucoseEntry from "./GlucoseEntry.js";
import {
  GoogleCharts
} from 'google-charts';
import DayMeasure from "./DayMeasure";

GoogleCharts.load( () => {
  chartReady = true;
  renderRecentChart( store.items );
} );

let pageState = {
  user: null,
  currentYear: new Date().getFullYear(),
  currentMonth : new Date().getMonth() + 1
};

let chartReady = false;
let storeReady = false;
let store = {
  items: []
}


function createItem( data ) {
  console.log( "Entering createItem: %o", data );
  return fetch( '/.netlify/functions/items-create', {
    body: JSON.stringify( data ),
    method: "POST"
  } ).then( ( response ) => {
    return response.json()
  } );
}

function deleteItem( faunaId ) {
  const url = `/.netlify/functions/item-delete/${faunaId}`;
  console.log( "deleteItem arg: %s url %s", faunaId, url );
  return fetch( url, {
    method: 'POST',
  } ).then( response => {
    return response.json()
  } )
}

function addMeasurement( payload ) {

  if ( payload.date == null ) {
    payload.date = new Date( Date.now() )
  }
  if ( !Array.isArray( payload.value ) ) {
    payload.value = [ parseInt( payload.value ) ]
  }
  if ( !payload.user ) {
    payload.user = "mschmeets@gmail.com";
  }
  const newItem = {
    date: payload.date,
    value: payload.value,
    user: payload.user,
    type: payload.type,
    month: payload.date.getMonth() + 1,
    year: payload.date.getFullYear(),
    day: payload.date.getDate(),
    id: payload.date.getTime(),
    note: payload.note
  };


  store.items.push( newItem );
  //store = saveStore( store );

  createItem( newItem ).then( ( response ) => {
    store.fauna.push( response );
    console.log( "API response ", response );
  } ).catch( ( error ) => {
    console.log( "API error ", error );
  } )
}

function deleteMeasurement( payload ) {
  console.log( "deleteMeasurement %o", payload );
  const targetId = parseInt( payload.id );
  let item = store.fauna.filter( ( doc ) => {
    return targetId === doc.data.id;
  } );

  console.log( "deleteMeasurement found document: %o", item, getDBId( item[ 0 ] ) );

  deleteItem( getDBId( item[ 0 ] ) ).then( ( response ) => {
    console.log( "deleteItem return %o", response );
    // if db deleted, then we removed from the local arrays.
    const fDelete = new Set( item );
    const iDelete = new Set( [ targetId ] );
    filterInPlace( store.fauna, obj => !fDelete.has( obj.ts ) );
    filterInPlace( store.items, obj => !iDelete.has( obj.id ) );
    update();
  } ).catch( ( error ) => {
    console.log( "Delete API error: %o", error );
  } );
}

function downloadData() {
  let store = getStore();
  console.log( "downloadData" );
  let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent( JSON.stringify( store.items ) );
  let dlAnchorElem = document.getElementById( 'downloadAnchorElem' );
  dlAnchorElem.setAttribute( "href", dataStr );
  dlAnchorElem.setAttribute( "download", "data.json" );
  dlAnchorElem.click();
  console.log( "leaving downLoadData" );
}

function renderRecentMeasureList( items, selector = "recent-measure-list" ) {
  const list = document.getElementById( selector );
  list.innerHTML = "";

  const dayCollection = items.reduce( ( accum, item ) => {
    if ( !accum.hasOwnProperty( item.day ) ) {
      accum[ item.day ] = [];
    }
    accum[ item.day ].push( item );
    return accum;
  }, {} );

  console.log( "rendermeasureList dayCollection: %o", dayCollection );


  Object.keys( dayCollection ).forEach( ( key ) => {
    const li = document.createElement( "li" );
    const item = dayCollection[ key ];

    const dtMeasure = new DayMeasure();
    dtMeasure.setAttribute( "month", item[0].month );
    dtMeasure.setAttribute( "day", item[0].day );
    dtMeasure.measurements = item;

    li.append( dtMeasure );
    list.appendChild( li );

   })


  if ( items.length > 0 ) {
    let total = items.reduce( ( accum, item ) => {
      return accum + Number( item.value );
    }, 0 );

    let avg = total / items.length;
    let a1c = ( avg + 46.7 ) / 28.7;
    let h3 = null;
    if ( !document.querySelector( "section.recents h3" ) ) {
      h3 = document.createElement( "h3" );
      h3.appendChild( document.createElement( "span" ) );
      h3.appendChild( document.createElement( "span" ) );
      document.querySelector( "section.recents" ).appendChild( h3 );
    } else {
      h3 = document.querySelector( "section.recents h3" );
    }

    h3.querySelector( "span:first-of-type" ).textContent = "Average of "+items.length+" Measures: " + avg.toFixed( 0 );
    h3.querySelector( "span:last-of-type" ).textContent = "  Estimated A1c: " + a1c.toFixed( 1 );

  }
}

function renderRecentChart( items, selector = "#chart-div" ) {

  if ( !items || items.length == 0 ) {
    return;
  }
  items = items.filter( item => item.type === "Glucose" );
  let rows = items.map( item => [ item.day + '/' + item.month, parseInt( item.value ) ] );
  rows.unshift( [ 'Date', 'Glucose' ] );
  // console.log( "Chart data ", rows.slice() );
  try {
    let data = GoogleCharts.api.visualization.arrayToDataTable( rows );
    const options = {
      hAxis: {
        title: 'Date',
        logScale: false
      },
      vAxis: {
        title: 'mg/dl',
        logScale: false,
        viewWindow: {
          min: 65,
          max: 200,
        },
        viewWindowMode: 'explicit'
      },
      legend: {
        position: 'bottom'
      },
      colors: [ '#BEE3FD' ],
      title: "Recent",
      pointSize: 7,
      trendlines: {
        0: {}
      }
    };

    // CandlestickChart  data structure array with Date, low, avg, avg, high, so bucket by day and compute values.

    let chart = new GoogleCharts.api.visualization.LineChart( document.querySelector( selector ) );
    chart.draw( data, options );
  } catch ( er ) {
    console.error( er );
  }
}

function update() {
  if ( storeReady ) {
    console.log( "ENTERING update: %o", store );
    // document.getElementById( 'month-label' ).textContent = store.month + ", " + store.year;
    console.log( "update.storeReady %o", store.items );
    renderRecentMeasureList( store.items );
    renderRecentChart( store.items );
  }

}

// window.addEventListener("DOMContentLoaded", () => {
try {
  console.log( "entering dcl" );
  //downloadData();


  document.body.addEventListener( "new-item", ( evt ) => {
    console.log( "new-item %o", evt );
    addMeasurement( evt.detail.payload );
    update();

  } );

  document.body.addEventListener( "delete-item", ( evt ) => {
    console.log( "delete-item %o", evt );
    deleteMeasurement( evt.detail.payload );
    update();
  } );

  function monthYearChange( evt ) {
    evt.preventDefault;
    // if ( evt.target.id == 'year-selector' ) {
    //   return;
    // }
    pageState.currentYear = parseInt(document.getElementById( 'year-selector' ).value);
    pageState.currentMonth = parseInt(document.getElementById( 'month-selector' ).value);
    loadMonth(
      pageState.user,
      pageState.currentYear,
      pageState.currentMonth
    ).then( ( response ) => {
      store = response;
      update();
    } ).catch( ( error ) => {
      console.error( error );
      store = getStore();
      update();
    } );

  }

  window.addEventListener( "DOMContentLoaded", ( evt ) => { 
    let main = document.querySelector( "main" );
    main.appendChild(
      document.getElementById( "initial-template" ).content.cloneNode( true )
    );
    let userField = main.querySelector( 'input' );
    requestAnimationFrame( () => userField.focus() );
    userField.addEventListener( "change", function(evt) {
      const userID = evt.target.value;
      pageState.user = userID;
      main.innerHTML = "";
      main.appendChild(
        document.getElementById( "app-template" ).content.cloneNode( true )
      );
      
      main.querySelector( '#year-selector' ).addEventListener( 'change', monthYearChange );
      main.querySelector( '#month-selector' ).addEventListener( 'change', monthYearChange );

      main.querySelector( '#year-selector' ).value = pageState.currentYear;
      main.querySelector( '#month-selector' ).value = pageState.currentMonth;

      loadThisMonth( userID ).then( ( data ) => {
        console.log( "loadThisMonth %o", data );
        store = data;
        storeReady = true;
        update();
      } ).catch( ( error ) => {
        console.error( error );
        store = getStore();
        storeReady = true;
        update();
      } )
      

     })
  })
  // update();
} catch ( er ) {
  console.error( er );
}
// });
