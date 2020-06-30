import "./styles.css";
import { getStore, saveStore } from "./store.js";
import Measurement from "./Measurement.js";

let store = getStore();

function addMeasurement(value) {
  let date = new Date();
  store = getStore();
  store.items.push({
    date: date,
    value: value
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

  var total = items.reduce((accum, item) => {
    return accum + Number(item.value);
  }, 0);

  if (items.length > 0) {
    var avg = total / items.length;
    let li = document.createElement("li");
    let h3 = document.createElement("h3");
    li.appendChild(h3);
    h3.textContent = "Recent Measure Average: " + avg.toFixed(0);
    list.appendChild(li);
  }
}
function update() {
  console.log("ENTERING UPDATE");
  renderRecentMeasureList(store.items);
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
  const input = document.getElementById("bgc");
  const button = document.getElementById("addMeasure");

  button.addEventListener("click", evt => {
    console.log("addMeasure click");
    addMeasurement(input.value);
    update();
    input.value = "";
    input.focus();
    console.log("store ", store);
  });

  let revs = 0;
  let hndl = setInterval(() => {
    update();
    revs++;
    if (revs > 5) {
      window.clearInterval(hndl);
    }
  }, 5000);

  update();
} catch (er) {
  console.error(er);
}
// });
