const MeasurementTemplate = document.createElement("template");
MeasurementTemplate.innerHTML = `
  <style>
    div.measure{
      display:flex;
      flex-direction:row;
      justify-content:space-between;

      border: 1px solid #eaeaea;
      padding: .25em;
    }
    #value{
      font-weight:500;
      flex-basis: 30%;
      font-size: 1.2em;
    }
    #date{
      flex-basis: 70%;
      font-weight: 400;
    }
    .fa-edit{ color: green; }
    .fa-trash{ color: red; display:inline-block; margin:0 .5em;}
    button{ background-color:white;border:none;}
  </style>
  <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.7.1/css/all.css" integrity="sha384-fnmOCqbTlWIlj8LyTjo7mOUStjsKC4pOpQbqyi7RrhN7udi9RwhKkMHpvLbHG9Sr" crossorigin="anonymous">
  <div class="measure">
    <span id="value"></span>
    <span id="date"></span>
    <button id="delete"><i class="fas fa-trash"></i></button>
  </div>
`;
// -- UNUSED now, delete only.
const MeasurementEditTemplate = document.createElement("template");
MeasurementEditTemplate.innerHTML = `
  <style>
    div.measure{
      display:flex;
      flex-direction:row;
      justify-content:space-between;

      border: 1px solid #eaeaea;
      padding: .25em;
    }
    #value{
      font-weight:500;
      flex-basis: 30%;
      font-size: 1.2em;
    }
    #date{
      flex-basis: 70%;
      font-weight: 400;
    }
    .fa-edit{ color: green; }
    .fa-trash{ color: red; display:inline-block; margin:0 .5em;}
    button{ background-color:white;border:none;}
  </style>
  <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.7.1/css/all.css" integrity="sha384-fnmOCqbTlWIlj8LyTjo7mOUStjsKC4pOpQbqyi7RrhN7udi9RwhKkMHpvLbHG9Sr" crossorigin="anonymous">
  <div class="measure">
    <input id="value" type="number"></input>
    <input id="date" type="date></input>
    <input id="time" type="time></input>
    <button id="cancel"><i class="fas fa-undo"></i></button>
    <button id="save"><i class="fas fa-save"></i> Save</button>
  </div>
`;

class Measurement extends HTMLElement {
  constructor() {
    super();
    this._value = null;
    this._date = null;
    this._id = null;
    this._isAttached = false;
    this._isEditing = false;

    this.attachShadow({ mode: "open" });
    this.setTemplateInShadow( true );//this.shadowRoot.appendChild( MeasurementTemplate.content.cloneNode( true ) );
    this.onEdit = this.onEdit.bind( this );
    this.onDelete = this.onDelete.bind( this );
  }

  static get observedAttributes() {
    return ["value", "date"];
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (name === "value") {
      this.value = newVal;
    } else if (name === "date") {
      this.date = newVal;
    } else if ( name === "id" ) {
      this.id = newVal;
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

  set id( val ) {
    this._id = val;
  }

  connectedCallback() {
    this._isAttached = true;
    this.addNormalButtons();
    this.render();

  }

  addNormalButtons() {
    // this.shadowRoot.getElementById( 'edit' ).addEventListener( "click", this.onEdit );
    this.shadowRoot.getElementById( 'delete' ).addEventListener( "click", this.onDelete );
  }

  removeNormalButtons() {
    // this.shadowRoot.getElementById( 'edit' ).removeEventListener( "click", this.onEdit );
    this.shadowRoot.getElementById( 'delete' ).removeEventListener( "click", this.onDelete );
  }

  addEditButtons() {

  }

  removeEditButtons() {

  }

  disconnectedCallback() {
    this._isAttached = false;
    if ( this._isEditing ) {
      this.removeEditButtons();
    } else {
      this.removeNormalButtons();
    }
  }

  setTemplateInShadow( yesno ){
    // if ( yesno ) {
      this.shadowRoot.innerHTML = "";
      this.shadowRoot.appendChild( MeasurementTemplate.content.cloneNode( true ) );
    // } else {
    //   this.shadowRoot.innerHTML = "";
    //   this.shadowRoot.appendChild( MeasurementEditTemplate.content.cloneNode( true ) );
    // }
  }

  onEdit( evt ) {
    evt.preventDefault();
    this._isEditing = true;
    this.setTemplateInShadow( false );

    this.addEditButtons();
    this.render();
    console.log( "%s.onEdit", this.tagName );
  }

  onDelete( evt ) {
    evt.preventDefault();
    console.log( "%s.onDelete", this.tagName );
    this.dispatchEvent( new CustomEvent( "delete-item", {
      bubbles: true,
      detail: {
          type: 'delete-item',
          payload: {
            value: this.value,
            date: this.date,
            id: this._id
          }
      }
  } ) );
  }

  render() {
    if (this._isAttached && !this._isEditing ) {
      this.shadowRoot.getElementById("date").textContent = this.date;
      this.shadowRoot.getElementById("value").textContent = this.value;
    }
    else if ( this._isAttached && this._isEditing ) {
      this.shadowRoot.getElementById("date").setAttribute('value',this.date);
      this.shadowRoot.getElementById("value").setAttribute("valule", this.value);
    }
  }
  
}
export default Measurement;
try {
  customElements.define("gt-measurement", Measurement);
} catch (er) {
  console.error(er);
}
