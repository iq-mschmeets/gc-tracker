import "./styles.css";
import { getStore, saveStore, loadThisMonth, filterInPlace } from "./store.js";
import Measurement from "./Measurement.js";
import GlucoseEntry from "./GlucoseEntry.js";
import { GoogleCharts } from 'google-charts';

let chartReady = false;
let storeReady = false;
GoogleCharts.load( () => { chartReady = true; renderRecentChart( store.items );});


let store = {items:[]}
loadThisMonth("mschmeets@gmail.com").then( ( data ) => { 
  console.log( "loadThisMonth %o", data );
  store = data;
  storeReady = true;
  update();
})

function createItem( data ) {
  console.log( "Entering createItem: %o", data );
  return fetch( '/.netlify/functions/items-create', {
    body: JSON.stringify( data ),
    method: "POST"
  } ).then( ( response ) => {
    return response.json()
  } );
}

function deleteItem(faunaId) {
  return fetch(`/.netlify/functions/item-delete/${faunaId}`, {
    method: 'POST',
  }).then(response => {
    return response.json()
  })
}

function addMeasurement(payload) {

  if ( payload.date == null ) {
    payload.date = new Date( Date.now() )
  }
  if( !Array.isArray(payload.value) ){
    payload.value = [parseInt(payload.value)]
  }
  if( !payload.user ) {
    payload.user = "mschmeets@gmail.com";
  }
  const newItem =   {
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
  })
}

function deleteMeasurement( payload ) {
  console.log( "deleteMeasurement %o", payload );
  const targetId = parseInt( payload.id );
  let item = store.fauna.filter( ( doc ) => {
    return targetId === doc.data.id;
  } );

  console.log( "deleteMeasurement found document: %o", item );
  
  deleteItem( item ).then( ( response ) => { 
    console.log( "deleteItem return %o", response );
    // if db deleted, then we removed from the local arrays.
    const fDelete = new Set( item );
    const iDelete = new Set( [targetId] );
    filterInPlace( store.fauna, obj => !fDelete.has( obj.id ) );
    filterInPlace( store.items, obj => !iDelete.has( obj.id ) );
    update();
  } ).catch( ( error ) => { 
    console.log( "Delete API error: %o", error );
  });
}

function downloadData() {
  let store = getStore();
  console.log( "downloadData" );
  let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(store.items));
  let dlAnchorElem = document.getElementById('downloadAnchorElem');
  dlAnchorElem.setAttribute("href",     dataStr     );
  dlAnchorElem.setAttribute("download", "data.json");
  dlAnchorElem.click();
  console.log( "leaving downLoadData" );
}
//jkdfsjk  df

function renderRecentMeasureList(items, selector = "recent-measure-list") {
  const list = document.getElementById(selector);
  list.innerHTML = "";
  items.forEach(item => {
    var li = document.createElement("li");
    list.appendChild(li);

    let measure = new Measurement();
    let dstr = item.date.toLocaleString("en-US");
    measure.setAttribute("date", dstr);
    measure.setAttribute("value", item.value );
    measure.setAttribute("data-id", item.id );
    li.append(measure);
  });

  if (items.length > 0) {
    let total = items.reduce((accum, item) => {
      return accum + Number(item.value);
    }, 0);

    let avg = total / items.length;
    let a1c = ( avg + 46.7 ) / 28.7;
    let h3 = null;
    if ( !document.querySelector( "section.recents h3" ) ) {
      h3 = document.createElement( "h3" );
      h3.appendChild( document.createElement( "span" ) );
      h3.appendChild( document.createElement( "span" ) );
      document.querySelector("section.recents").appendChild(h3);
    } else {
      h3 = document.querySelector( "section.recents h3" );
    }

    h3.querySelector( "span:first-of-type" ).textContent = "Average of Recent Measures: " + avg.toFixed( 0 );
    h3.querySelector( "span:last-of-type" ).textContent = "  Estimated A1c: " + a1c.toFixed( 1 );

  }
}

function renderRecentChart( items, selector = "#chart-div" ) {

  if ( !items || items.length == 0 ) {
    return;
  }
  let rows = items.map( item => [ item.day + '/' + item.month, parseInt(item.value) ] );
  rows.unshift( [ 'Date', 'Glucose' ] );
  console.log( "Chart data ", rows.slice() );
  var data = GoogleCharts.api.visualization.arrayToDataTable( rows );
  var options = {
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
    legend :{
      position: 'bottom'
    },
    colors: [ '#BEE3FD' ],
    title: "Recent",
    pointSize: 7,
    trendlines: {
      0: {  }
    }
  };

  // CandlestickChart  data structure array with Date, low, avg, avg, high, so bucket by day and compute values.

  var chart = new GoogleCharts.api.visualization.LineChart(document.querySelector(selector));
  chart.draw(data, options);
}

function update() {
  if ( storeReady ) {
    renderRecentMeasureList( store.items );
    renderRecentChart( store.items );
  }

}

// window.addEventListener("DOMContentLoaded", () => {
try {
  console.log("entering dcl");
  //downloadData();


  document.body.addEventListener( "new-item", ( evt ) => {
    console.log("new-item %o", evt);
    addMeasurement(evt.detail.payload);
    update();
    
  } );

  document.body.addEventListener( "delete-item", ( evt ) => { 
    console.log( "delete-item %o", evt );
    deleteMeasurement( evt.detail.payload );
    update();
  } );

  update();
} catch (er) {
  console.error(er);
}
// });
