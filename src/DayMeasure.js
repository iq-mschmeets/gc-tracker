const DayMeasureItemTemplate = document.createElement( "template" );
DayMeasureItemTemplate.innerHTML = `
<li class="dm-item">
    <button id="delete"><i class="fas fa-trash"></i></button>
    <span class="dm-time"></span>
    <span class="dm-value"></span>
</li>
`
const DayMeasureTemplate = document.createElement( "template" );
DayMeasureTemplate.innerHTML = `
    <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.7.1/css/all.css" integrity="sha384-fnmOCqbTlWIlj8LyTjo7mOUStjsKC4pOpQbqyi7RrhN7udi9RwhKkMHpvLbHG9Sr" crossorigin="anonymous">
    <style>
      .dmeasure{
        font-size: 1.2em;
      }
      .dmeasure .dm-item{
        margin-left:30%;
        display:flex;
        justify-content: space-between;
      }
      .dmeasure .day{
        font-size: 1.3em;

        color:white;
        padding: .25em .45em;
        border-radius: 50%;
        background-color:rgba(56, 88, 191, 1);
      }
      .dmeasure h4{
          margin: .5em 0 0 0;
          border-bottom: 1px solid #eaeaea;
          padding-bottom: .5em;
      }
      .dmeasure ul{
          padding: 0;
          margin: 0;
      }
      .dm-value{
        font-weight: 500;
        flex-basis: 30%;
        font-size: 1.4em;
        text-align:right;
        padding-right: 1em;
      }
      .dm-time{
        flex-basis: 70%;
        font-weight: 400;
        line-height: 1.6em;
        align-self:center;
      }
      .high{
        color: rgba(202, 32, 39, 1);
        font-weight:600;
      }
      .normal{
        color: #2E4EA1;
        color: #0C8341;
      }
      .month{
        font-size: 1em;
        color: #777;
      }
      .fa-trash{ color: rgba(243, 120, 32, 1); display:inline-block; margin:0 .5em;}
      button{ background-color:white;border:none;}
    </style>

    <div class="dmeasure">
      <h4>
        <span class="day"></span> - <span class="month"></span>
      </h4>
      <ul>
      </ul>
    </div>
`;

function getNewTemplate( template ){ return template.content.cloneNode( true ) };
function setTemplateInShadow(_this) {
    _this.shadowRoot.innerHTML = "";
    _this.shadowRoot.appendChild( getNewTemplate(DayMeasureTemplate) );
}
function getTimeAsText( date ) {
    return date.toLocaleTimeString( 'en-US' );
}
const months = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
function getMonth( mon ) {
    return months[ parseInt( mon ) ];
}
class DayMeasure extends HTMLElement {
    constructor() {
        super();

        this._day = null;
        this._month = null;
        this._isAttached = false;
        this._highValue = 139;
        this._measureItems = [];

        this.attachShadow( {
            mode: "open"
        } );
        setTemplateInShadow( this ); //this.shadowRoot.appendChild( MeasurementTemplate.content.cloneNode( true ) );
        this.onDelete = this.onDelete.bind( this );
    }

    static get observedAttributes() {
        return [ "day", "month", "data-id", "data-high-value" ];
    }

    attributeChangedCallback( name, oldVal, newVal ) {
        if ( name === "day" ) {
            this.day = newVal;
        } else if ( name == "month" ) {
            this.month = newVal;
        } else if ( name == "data-high-value" ) {
            this._highValue = parseInt( newVal );
        }
    }

    get month() {
        return this._month;
    }

    get day() {
        return this._day;
    }

    set measurements( coll ) {
        this._measureItems = coll;
        this.render();
    }

    set day( val ) {
        this._day = val;
    }

    set month( val ) {
        this._month = val;
    }

    connectedCallback() {
        this._isAttached = true;
        this.addNormalButtons();
        this.render();

    }

    addNormalButtons() {
        // this.shadowRoot.querySelector( '#delete' ).addEventListener( "click", this.onDelete );
    }

     removeNormalButtons() {
        // this.shadowRoot.getElementById( 'delete' ).removeEventListener( "click", this.onDelete );
    }


    disconnectedCallback() {
        this._isAttached = false;
        // this.removeNormalButtons();

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
                    id: this.measureId || this.getAttribute( 'data-id' )
                }
            }
        } ) );
    }

    renderItems() {
        const listEl = this.shadowRoot.querySelector( 'ul' );
        this._measureItems.forEach( ( item ) => { 
            var node = getNewTemplate( DayMeasureItemTemplate );

            node.querySelector( '.dm-time' ).textContent = getTimeAsText( item.date );
            const valEl = node.querySelector( '.dm-value' );
            valEl.textContent = item.value; // ?item.value[0]?
            if ( item.value > this._highValue ) {
                valEl.classList.add( "high" );
                valEl.classList.remove( "normal" );
            } else {
                valEl.classList.add( "normal" );
            }
            listEl.appendChild( node );
        } )
        

    }
    render() {
        if ( this._isAttached ) {
            
            this.shadowRoot.querySelector( ".day" ).textContent = this.day;
            this.shadowRoot.querySelector( ".month" ).textContent =  getMonth( this.month - 1 );
            this.renderItems();
        }
    }

}
export default DayMeasure;
try {
    customElements.define( "gt-day-measure", DayMeasure );
} catch ( er ) {
    console.error( er );
}