const MeasurementTemplate = document.createElement("template");
MeasurementTemplate.innerHTML = `
  <style>
    div.measure{ 
      display:flex; 
      flex-direction:row; 
      justify-content:space-between;
      width:100%;
      border: 1px solid #eaeaea;
    }
    #value{
      font-weight:500;
      flex-basis: 30%;
    }
    #date{
      flex-basis: 70%;
      font-weight: 400;
    }
  </style>
  <div class="measure">
    <span id="value"></span>
    <span id="date"></span>
  </div>
`;

class Measurement extends HTMLElement {
  constructor() {
    super();
    this._value = null;
    this._date = null;
    this._isAttached = false;

    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(MeasurementTemplate.content.cloneNode(true));
  }
  static get observedAttributes() {
    return ["value", "date"];
  }
  attributeChangedCallback(name, oldVal, newVal) {
    if (name === "value") {
      this.value = newVal;
    } else if (name === "date") {
      this.date = newVal;
    }
  }
  get value() {
    return this._value;
  }
  get date() {
    return this._date;
  }
  set value(val) {
    this._value = val;
    this.render();
  }
  set date(val) {
    this._date = val;
    this.render();
  }
  connectedCallback() {
    this._isAttached = true;
    this.render();
  }
  disconnectedCallback() {
    this._isAttached = false;
  }
  render() {
    if (this._isAttached) {
      this.shadowRoot.getElementById("date").textContent = this.date;
      this.shadowRoot.getElementById("value").textContent = this.value;
    }
  }
}
export default Measurement;
try {
  customElements.define("gt-measurement", Measurement);
} catch (er) {
  console.error(er);
}
