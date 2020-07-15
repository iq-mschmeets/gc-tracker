
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
    });
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
