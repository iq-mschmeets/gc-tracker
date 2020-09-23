const DayMeasureItemTemplate = document.createElement( "template" );
DayMeasureItemTemplate.innerHTML = `
<li class="dm-item">
    <button class="dm-item-delete" title="Click to delete this measure">
        <i class="fas fa-trash"></i>
    </button>
    <span class="dm-time"></span>
    <span class="dm-type"></span>
    <span class="dm-value"></span>
</li>
`
const DayMeasureTemplate = document.createElement( "template" );
DayMeasureTemplate.innerHTML = `
    <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.7.1/css/all.css" integrity="sha384-fnmOCqbTlWIlj8LyTjo7mOUStjsKC4pOpQbqyi7RrhN7udi9RwhKkMHpvLbHG9Sr" crossorigin="anonymous">
    <style>
      .dmeasure{
        font-size: 1.2em;
        display:flex;
        justify-content-space-between;
      }

      .dmeasure .dm-item{
        margin-left:10%;
        display:flex;
        justify-content: space-between;
      }
      .dmeasure .day{
        font-size: 1.0em;
        width: 1.25em;
        color:white;
        padding: .5em .5em;
        border-radius: 50%;
        background-color:rgba(56, 95, 225, 0.8);
        text-align:center;
      }
      .dmeasure h4{
          margin: .25em 0 0 .25em;
          flex-grow:1;
      }
      .dmeasure ul{
          padding: 0;
          margin: 0;
          flex-grow:3;
      }
      .dm-value{
        font-weight: 500;
        flex-basis: 30%;
        font-size: 1.4em;
        text-align:right;
        padding-right: 1em;
      }
      .bp{
          font-size: 1em;
          color: #444;
          font-weight: 400;
          padding-top: .4em;
      }
      .dm-time{
        flex-basis: 70%;
        font-weight: 400;
        line-height: 1.6em;
        align-self:center;
      }
      .dm-type{
        font-size: .7em;
        font-style:italic;
        font-weight: 400;
        color: #ccc;
        padding-top:.55em;
        vertical-align: bottom;
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
        font-size: .8em;
        color: #333;
        font-weight: 400;
        padding-left: .4em;
      }
      .fa-trash{ color: rgba(243, 120, 32, 1); display:inline-block; margin:0 .5em;}
      button{ background-color:white;border:none;}
    </style>

    <div class="dmeasure">
      <h4>
        <div class="day"></div>  <span class="month"></span>
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
        this.clickCheck = this.clickCheck.bind( this );
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
        //let list = this.shadowRoot.querySelector('ul');
        //list.addEventListener( 'click', this.onDelete );
        this.shadowRoot.addEventListener( 'click', this.clickCheck );
        //this.shadowRoot.querySelector( '.dm-item-delete' ).addEventListener( "click", this.onDelete );
    }

    removeNormalButtons() {
        //let list = this.shadowRoot.querySelector('ul');
        //list.removeEventListener('click', this.onDelete);
        //this.shadowRoot.getElementById( 'delete' ).removeEventListener( "click", this.onDelete );
        this.shadowRoot.removeEventListener( 'click', this.clickCheck );
    }


    disconnectedCallback() {
        this._isAttached = false;
        // this.removeNormalButtons();

    }

    clickCheck( evt ) {
        console.log( "%s.clickCheck %o", this.tagName, evt );
        if ( evt.target.matches( ".dm-item-delete" ) || evt.target.matches( "fas fa-trash" ) ) {
            let li = evt.target.closest( 'li.dm-item' );
            this.onDelete( { id: li.getAttribute( 'data-id' ) } );

        }

    }
    onDelete( evt ) {
        evt.preventDefault();
        // find source, looking for the button, but, how do we identify the exact
        // item that button represents? Use the data-id attribute as set in renderItem
        // then we need to look up that item in the day's collection.
        // this._measureItems.filter((item)=>item.id == btnID);
        console.log( "%s.onDelete", this.tagName );
        if ( confirm( "Are you sure you want to delete this measurement?" ) ) {
            this.dispatchEvent( new CustomEvent( "delete-item", {
                bubbles: true,
                detail: {
                    type: 'delete-item',
                    payload: {
//                        value: this.value,
//                        date: this.date,
//                        id: this.measureId || this.getAttribute( 'data-id' )
                        id : evt.id
                    }
                }
            } ) );
        }
    }

    renderItem( item ){
        var node = getNewTemplate( DayMeasureItemTemplate );

        node.querySelector( '.dm-time' ).textContent = getTimeAsText( item.date );
        node.querySelector( '.dm-type' ).textContent = item.type;

        const valEl = node.querySelector( '.dm-value' );

        node.querySelector( 'button.dm-item-delete' ).setAttribute( "data-id", item.id );

        if( item.type == "Blood Pressure" ){
            valEl.textContent = item.value[ 0 ] + "/" + item.value[ 1 ];
            valEl.classList.add("bp")
        } else {
            valEl.textContent = item.value[0];
        }
        if ( item.type == "Glucose" && item.value[0] > this._highValue ) {
            valEl.classList.add( "high" );
            valEl.classList.remove( "normal" );
        } else if ( item.type == "Glucose" ) {
            valEl.classList.add( "normal" );
        }

        node.querySelector('li').setAttribute( 'data-id', item.id );
        // else {
        //     valEl.classList.add( "normal" );
        // }

        return node;
    }


    renderItems() {
        const listEl = this.shadowRoot.querySelector( 'ul' );
        this._measureItems.forEach( ( item ) => {
            listEl.appendChild( this.renderItem( item ) );
        } );

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
