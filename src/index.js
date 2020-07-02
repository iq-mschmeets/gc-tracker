import "./styles.css";
import { getStore, saveStore } from "./store.js";
import Measurement from "./Measurement.js";
import GlucoseEntry from "./GlucoseEntry.js";

let store = getStore();

function addMeasurement(payload) {
  let date = new Date(Date.now());
  store = getStore();

  store.items.push({
    date: date,
    value: parseInt(payload.value),
    user: payload.user || "Mark",
    day: payload.date.getDate(),
    month: payload.date.getMonth()+1,
    year: payload.date.getFullYear(),
    id: date.getTime()
  } );
  store = saveStore( store );
}


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
function update() {
  console.log("ENTERING UPDATE");
  renderRecentMeasureList( store.items );
  let gc = new GlucoseEntry();
  /*
  const list = document.getElementById("recent-measure-list");
  list.innerHTML = "";
  store.items.forEach(item => {
    var li = document.createElement("li");

    list.appendChild(li);
    // let measure = document.createElement("gt-measurement");
    let measure = new Measurement();
    let dstr = item.date.toLocaleString("en-US");
    measure.setAttribute("date", dstr);
    measure.setAttribute("value", item.value);
    li.append(measure);
    console.log(item.date);
  });
  */
}

// window.addEventListener("DOMContentLoaded", () => {
try {
  console.log("entering dcl");
  
  
  
  document.body.addEventListener( "new-item", ( evt ) => { 
    console.log("new-item %o", evt);
    addMeasurement(evt.detail.payload);
    update();
  } );

  // let revs = 0;
  // let hndl = setInterval(() => {
  //   update();
  //   revs++;
  //   if (revs > 5) {
  //     window.clearInterval(hndl);
  //   }
  // }, 5000);

  update();
} catch (er) {
  console.error(er);
}
// });
