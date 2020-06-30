
export const getStore = () => {
  let store = localStorage.getItem("glucose.store");
  if (store) {
    store = JSON.parse(store);
    store.items = store.items.map(item => {
      return Object.assign( {},item,{ date: new Date( Number( item.date ) ) }) ;
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
  
  obj.items = obj.items.slice().map(item => {
    item.date = item.date.getTime();
    return item;
  } );
  
  localStorage.setItem( "glucose.store", JSON.stringify( obj ) );
  
  return getStore();
};
;
