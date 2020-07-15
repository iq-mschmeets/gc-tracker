
// key for statsdb = fnADw0NBeuACEkExTTVWhdrq-30IRIxGy68l65_i
Create(
    Collection( "event" ),
    { data: {
        date: 1594819974386,
        id: 1594819974386,
        day: 15,
        month: 7,
        year: 2020,
        user: 'mschmeets@gmail.com',
        note: '',
        type: 'Glucose',
        value: [ 130 ]
      }}
)

// Created a new document.

Map(
  Paginate(
    Match(Index("user_year_month"), ["mschmeets@gmail.com", 2020, 7])
  ),
  Lambda("X", Get(Var("X")))
)

{
  data: [
    {
      ref: Ref(Collection("event"), "271126648306270739"),
      ts: 1594825371010000,
      data: {
        date: 1594819974386,
        id: 1594819974386,
        day: 15,
        month: 7,
        year: 2020,
        user: 'mschmeets@gmail.com',
        note: '',
        type: 'Glucose',
        value: [ 130 ]
      }
    },
    {
      ref: Ref(Collection("event"), "271127141167399442"),
      ts: 1594825841020000,
      data: {
        date: 1594761335789,
        id: 1594761335789,
        day: 14,
        month: 7,
        year: 2020,
        type: 'Glucose',
        user: 'mschmeets@gmail.com',
        value: [ 94 ]
      }
    },
    {
      ref: Ref(Collection("event"), "271127241717449234"),
      ts: 1594825937053800,
      data: {
        date: 1594754374027,
        id: 1594754374027,
        day: 14,
        month: 7,
        year: 2020,
        note: '',
        type: 'Glucose',
        user: 'mschmeets@gmail.com',
        value: [ 108 ]
      }
    },
    {
      ref: Ref(Collection("event"), "271127333631427090"),
      ts: 1594826024573000,
      data: {
        date: 1594731473597,
        id: 1594731473597,
        day: 14,
        month: 7,
        year: 2020,
        note: '',
        type: 'Glucose',
        user: 'mschmeets@gmail.com',
        value: [ 170 ]
      }
    },
    {
      ref: Ref(Collection("event"), "271127432426160658"),
      ts: 1594826118780000,
      data: {
        date: 1594648917744,
        id: 1594648917744,
        day: 13,
        month: 7,
        year: 2020,
        note: '',
        user: 'mschmeets@gmail.com',
        type: 'Glucose',
        value: [ 170 ]
      }
    }
  ]
}


/* This one works... */
CreateIndex({
    name:"user_year_month",
    source: Collection("event"),
    terms:[{field: ["data", "user"]},
           {field: ["data","year"]},
           {field: ["data","month"]}],
    unique:false
})

{
  ref: Index("user_year_month"),
  ts: 1594829462030000,
  active: true,
  serialized: true,
  name: 'user_year_month',
  source: Collection("event"),
  terms: [
    { field: [ 'data', 'user' ] },
    { field: [ 'data', 'year' ] },
    { field: [ 'data', 'month' ] }
  ],
  unique: false,
  partitions: 1
}

CreateIndex({
    name:"item_user_year_month",
    source: Collection("items"),
    terms:[{field: ["data", "user"]},
           {field: ["data","year"]},
           {field: ["data","month"]}],
    unique:false
})