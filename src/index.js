import "./styles.css";
import { getStore, saveStore } from "./store.js";
import Measurement from "./Measurement.js";
import GlucoseEntry from "./GlucoseEntry.js";
import { GoogleCharts } from 'google-charts';

let chartReady = false;
GoogleCharts.load( () => { chartReady = true; renderRecentChart( store.items );});

let store = getStore();

function addMeasurement(payload) {
  let date = new Date(Date.now());
  store = getStore();

  store.items.push({
    date: date,
    value: parseInt(payload.value),
    user: payload.user || "Mark",
    type : payload.type,
    day: payload.date.getDate(),
    month: payload.date.getMonth()+1,
    year: payload.date.getFullYear(),
    id: date.getTime(),
    note:''
  } );
  store = saveStore( store );
}
/*
if( payload.date == null ){
  payload.date = new Date(Date.now())
if( !Array.isArray(payload.value) ){
  payload.value = [parseInt(payload.value)]
}
{
  date : payload.date,
  value :payload.value,
  user : payload.user,
  type : payload.type,
  month : payload.date.getMonth()+1,
  year : paylaod.date.getFullYear(),
  day : payload.date.getDate(),
  id : payload.user="_"+payload.date.getTime(),
  note : payload.note
}



*/



function renderRecentMeasureList(items, selector = "recent-measure-list") {
  const list = document.getElementById(selector);
  list.innerHTML = "";
  items.forEach(item => {
    var li = document.createElement("li");
    list.appendChild(li);

    let measure = new Measurement();
    let dstr = item.date.toLocaleString("en-US");
    measure.setAttribute("date", dstr);
    measure.setAttribute("value", item.value);
    li.append(measure);
    console.log(item);
  });

  if (items.length > 0) {
    let total = items.reduce((accum, item) => {
      return accum + Number(item.value);
    }, 0);

    let avg = total / items.length;
    let h3 = null;
    if ( !document.querySelector( "section.recents h3" ) ) {
      h3 = document.createElement( "h3" );
      document.querySelector("section.recents").appendChild(h3);
    } else {
      h3 = document.querySelector( "section.recents h3" );
    }
    h3.textContent = "Average of Recent Measures: " + avg.toFixed(0);
  }
}

function renderRecentChart( items, selector = "#chart-div" ) {

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

  var chart = new GoogleCharts.api.visualization.LineChart(document.querySelector(selector));
  chart.draw(data, options);
}

function update() {
  renderRecentMeasureList( store.items );
  renderRecentChart( store.items );

}

// window.addEventListener("DOMContentLoaded", () => {
try {
  console.log("entering dcl");



  document.body.addEventListener( "new-item", ( evt ) => {
    console.log("new-item %o", evt);
    addMeasurement(evt.detail.payload);
    update();
  } );

  update();
} catch (er) {
  console.error(er);
}
// });
