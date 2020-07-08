

const GlucoseEntryTemplate = document.createElement( "template" );
GlucoseEntryTemplate.innerHTML = `
    <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.7.1/css/all.css" integrity="sha384-fnmOCqbTlWIlj8LyTjo7mOUStjsKC4pOpQbqyi7RrhN7udi9RwhKkMHpvLbHG9Sr" crossorigin="anonymous">
    <style>
        input{ padding: .5em; border: 1px solid #dadada;min-width:11em;height:1.5em;}
        label{ color: #888; display:block;}
        button{ 
            padding: .5em 1.5em; 
            background-color:#77BC07;
            color:white;
            border:1px solid white;/*#685069; */
            height:2.5em;
            display:block;
            margin: 1.2em auto;
        }
        .bar{
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            grid-template-rows: 1fr;
            grid-column-gap: 13px;
            grid-row-gap: 0px;
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
        <div>
            <label for="bgc">Enter meter reading</label>
            <input type="number" id="bgc" placeholder="Enter glucose" />
        </div>

        <button id="addMeasure">
            <i class="fas fa-plus"></i> Add
        </button>

    </div>
`;

function normalizeTimeDate( value ) {
    if ( value < 10 ) {
        value = "0" + value;
    }
    return value;
}

class GlucoseEntry extends HTMLElement{
    constructor() {
        super();

        this._isAttached = false;

        this.onClick = this.onClick.bind( this );
        this.attachShadow({ mode: "open" });
        this.shadowRoot.appendChild( GlucoseEntryTemplate.content.cloneNode( true ) );

    }
    onClick( evt ) {
        console.log( "GlucoseEntry.onClick %o, %o", evt, this.shadowRoot.querySelector( 'input' ) );

        const input = this.shadowRoot.querySelector( 'input#bgc' );
        const dateBox = this.shadowRoot.querySelector( 'input#date' );
        const timeBox = this.shadowRoot.querySelector( 'input#time' );
        console.log( "GlucoseEntery date %s, time %s", dateBox.value, timeBox.value );
            this.dispatchEvent( new CustomEvent( "new-item", {
                bubbles: true,
                detail: {
                    type: 'new-item',
                    payload: {
                        value: input.value,
                        date: new Date( Date.parse(dateBox.value+" "+timeBox.value) )
                    }
                }
            } ) );

            input.value = "";
            input.focus();

    }
    connectedCallback() {
        console.log( "GlucoseEntry.connectedCallback" );
        this._isAttached = true;
        this.shadowRoot.querySelector( "button#addMeasure" ).addEventListener( "click", this.onClick );

        this.initializeTimeDateControls( new Date() )
    }
    disconnectedCallback() {
        this._isAttached = false;
        this.shadowRoot.querySelector( "button#addMeasure" ).removeEventListener( "click", this.onClick );
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