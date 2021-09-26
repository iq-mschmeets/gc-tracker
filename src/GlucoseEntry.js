

const GlucoseEntryTemplate = document.createElement( "template" );
GlucoseEntryTemplate.innerHTML = `
    <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.7.1/css/all.css" integrity="sha384-fnmOCqbTlWIlj8LyTjo7mOUStjsKC4pOpQbqyi7RrhN7udi9RwhKkMHpvLbHG9Sr" crossorigin="anonymous">
    <style>
        input{ 
            padding: .5em; 
            border: 1px solid #dadada;
            min-width:8em;
            height:1.5em;
        }
        label{ color: #888; display:block;}
        .hidden{ display:none; }
        button{
            padding: .5em 1.5em;
            background-color:#0C8341;
            color:white;
            border:1px solid white;/*#685069; */
            height:2.5em;
            display:block;
            margin: 1.2em auto;
            width: 100%;
        }
        #multi-inputs{
            display:flex;
            flex-direction:column;
        }
        .bar{
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            grid-template-rows: 1fr;
            grid-column-gap: 12px;
            grid-row-gap: 0px;
        }
        @media only screen and (max-width:900px){
            .bar{
                display:flex;
                flex-direction:column;
                justify-content:flex-start;
            }
            .bar input{
                display:block;
                width: 100%;
                width: -webkit-fill-available;
                margin: 0 auto .5em auto;
            }
            .bar button{
                display:block;
                width: 100%;
                margin: 1em auto .5em auto;
            }
        }

        elix-date-combo-box{min-width:10em;height:20px;}
    </style>
    <div class="bar">
        <div>
            <label id="dateLabel" for="date">Date:</label>
            <input type="date" id="date" />
        </div>
        <div>
            <label id="timeLabel" for="time">Time:</label>
            <input type="time" id="time" />
        </div>
        <datalist id="measure-type-list" >
            <option>Glucose</option>
            <option>Blood Pressure</option>
            <option>A1C</option>
            <option>Weight</option>
            <option>Temperature</option>
        </datalist>
        <div>
            <label for="measare-type">Type: </label>
            <input type="text" id="measure-type" list="measure-type-list" />
        </div>
         <div class="single-input">
            <label for="single-value-input">Value: </label>
            <input type="number" id="single-value-input" placeholder="" />
        </div>
        <div class="multi-inputs hidden" >
            <label for="systolic-input">Systolic</label>
            <input type="number" id="systolic-input" />
            <label for="diastolic-input">Diastolic</label>
            <input type="number" id="diastolic-input" />
            <label for="puls-input">Heart Rate</label>
            <input type="number" id="pulse-input" />
        </div>
        <button id="addMeasure">
            <i class="fas fa-plus"></i> Add
        </button>

    </div>
`;

function normalizeTimeDate( value ) {
    if ( Number(value) < 10 ) {
        value = "0" + value;
    }
    return value;
}

function getTimeString( strVal ){
    let prts = strVal.split(":");
    return ( normalizeTimeDate(parseInt(prts[0])) +
        ":"+
        normalizeTimeDate(parseInt(prts[1])) +
        ":00" );
}

function getDate( dateStr, timeStr ){
    let timeVal = getTimeString( timeStr );
    return new Date( Date.parse( dateStr + "T" + timeVal ) );
}

class GlucoseEntry extends HTMLElement{
    constructor() {
        super();

        this._isAttached = false;

        this.onClick = this.onClick.bind( this );
        this.onTypeChange = this.onTypeChange.bind( this );
        this.attachShadow({ mode: "open" });
        this.shadowRoot.appendChild( GlucoseEntryTemplate.content.cloneNode( true ) );

    }

    onClick( evt ) {
        console.log( "GlucoseEntry.onClick %o, %o", evt, this.shadowRoot.querySelector( 'input' ) );

        const typeInput = this.shadowRoot.querySelector( "input#measure-type" );
        const value = [];

        if ( typeInput.value == "Blood Pressure" ) {
            const container = this.shadowRoot.querySelector( '.multi-inputs' );
            value[ 0 ] = container.querySelector( '#systolic-input' ).value;
            value[ 1 ] = container.querySelector( '#diastolic-input' ).value;
            value[ 2 ] = container.querySelector( '#pulse-input' ).value;
        } else {
            value[ 0 ] = this.shadowRoot.querySelector( 'input#single-value-input' ).value;
        }

        const dateBox = this.shadowRoot.querySelector( 'input#date' );
        const timeBox = this.shadowRoot.querySelector( 'input#time' );
        const measureDate = getDate( dateBox.value, timeBox.value );

        console.log( "GlucoseEntery date %s, time %s, measureDate: %s", dateBox.value, timeBox.value, measureDate );
            this.dispatchEvent( new CustomEvent( "new-item", {
                bubbles: true,
                detail: {
                    type: 'new-item',
                    payload: {
                        value: value,
                        date: measureDate, 
                        type : typeInput.value
                    }
                }
            } ) );

            input.value = "";
            input.focus();

    }

    onTypeChange( evt ) {
        let input = this.shadowRoot.querySelector( "input#measure-type" );
        if ( input.value == "Blood Pressure" ) {
            this.shadowRoot.querySelector( ".single-input" ).classList.add( "hidden" );
            this.shadowRoot.querySelector( ".multi-inputs" ).classList.remove( "hidden" );
            requestAnimationFrame( () => this.shadowRoot.querySelector( "input#systolic-input" ).focus() );
        } else {
            this.shadowRoot.querySelector( ".single-input" ).classList.remove( "hidden" );
            this.shadowRoot.querySelector( ".multi-inputs" ).classList.add( "hidden" );
            this.shadowRoot.querySelector( "label[for='single-value-input']" ).textContent = "Enter "+input.value+" value";
            requestAnimationFrame( () => this.shadowRoot.querySelector( "input#single-value-input" ).focus() );
        }

        console.log( "GlucoseEntry.onTypeChange %o, %s", evt, input.value );

    }

    connectedCallback() {
        console.log( "GlucoseEntry.connectedCallback" );
        this._isAttached = true;
        this.shadowRoot.querySelector( "button#addMeasure" ).addEventListener( "click", this.onClick );
        this.shadowRoot.querySelector( "input#measure-type" ).addEventListener( "change", this.onTypeChange );

        this.initializeTimeDateControls( new Date() )
    }

    disconnectedCallback() {
        this._isAttached = false;
        this.shadowRoot.querySelector( "button#addMeasure" ).removeEventListener( "click", this.onClick );
        this.shadowRoot.querySelector( "input#measure-type" ).removeEventListener( "change", this.onTypeChange );
    }

    initializeTimeDateControls( dt ) {
        const dateStr = dt.getFullYear() + "-" + normalizeTimeDate( dt.getMonth() + 1 ) + "-" + normalizeTimeDate( dt.getDate() );
        const timeStr = normalizeTimeDate( dt.getHours() ) + ":" + normalizeTimeDate( dt.getMinutes() );
        this.shadowRoot.querySelector( 'input#date' ).setAttribute("value", dateStr);
        this.shadowRoot.querySelector( 'input#time' ).setAttribute( "value", timeStr );

    }

}


export default GlucoseEntry;
try {
  customElements.define("gt-glucose-entry", GlucoseEntry);
} catch (er) {
  console.error(er);
}
