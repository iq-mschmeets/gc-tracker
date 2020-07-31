
export const getStore = () => {
  let store = localStorage.getItem("glucose.store");
  if (store) {
    store = JSON.parse( store );
    store.items = store.items.filter( ( item ) => item )
    store.items = store.items.map(item => {
      let newItem = Object.assign( {}, item, { date: new Date( Number( item.date ) ) } );
      if ( !Array.isArray( newItem.value ) ) {
        newItem.value = [newItem.value]
      }
      return newItem
    } );
    store.items.sort( ( a, b ) => { return (a.id < b.id) ? -1 : 1 })
    console.log("STORE: ", store);
  } else {
    store = {};
    store.items = [];
  }

  return store;
};

export const saveStore = store => {
  let obj = Object.assign( {}, store );
  
  obj.items = obj.items.slice().map( item => {
    if ( !item.date || !item.date.getTime ) { return null; }
    let tVal = item.date.getTime();
    item.date = tVal;
    item.id = tVal;
    return item;
  } );
  
  localStorage.setItem( "glucose.store", JSON.stringify( obj ) );
  
  return getStore();
};
;

export const loadThisMonth = ( user ) => {
  let today = new Date( Date.now() );
  return loadMonth(
    user,
    today.getFullYear(),
    today.getMonth() + 1
  )
}

function transformFaunaDocument( item ) {
  let newItem = Object.assign( {}, item.data, { date: new Date( Number( item.data.id ) ) } );
  if ( !Array.isArray( newItem.value ) ) {
    newItem.value = [newItem.value]
  }
  return newItem
}

function transformFaunaResponse( response, user, year, month ) {
  let fauna = response.data;

  let items = fauna.map(transformFaunaDocument);
  items.sort( ( a, b ) => { return (a.id < b.id) ? -1 : 1 })

  console.log( "loadMonth.then response: %o, %o", items, fauna );

  return {
    fauna: fauna,
    items: items,
    year: year,
    month: month,
    user: user
  };
}

export const loadMonth = (user,year,month) => {
  const data = { user, year, month };

    console.log( "Entering loadMonth: %o", data );
    return fetch( '/.netlify/functions/items-read-month', {
      body: JSON.stringify( data ),
      method: "POST"
    } ).then( ( response ) => {
      return response.json()
    } ).then( ( data ) => { 
      console.log( "Returned from items-read-month: %o", data );
      return transformFaunaResponse( data, user, year, month );
    } ).catch( ( error ) => {
      console.log( "loadMonth.catch %o", error );
     });
  
}

export const filterInPlace = (array, predicate) => {
  let end = 0;

  for (let i = 0; i < array.length; i++) {
      const obj = array[i];

      if (predicate(obj)) {
          array[end++] = obj;
      }
  }

  array.length = end;
};

export const getDBId = (fobj) => {
  if (!fobj.ref) {
    return null
  }
  return fobj.ref['@ref'].id
}