Say what you want

* I want all the quotes for the instruments in the InstrumentTable component in the `instrumentQuotes` prop
* I want all the underlying instruments of the chains of the `preparing` option events for the stock detail instrument in the `preparingOptionEvents` prop
  * First I need to fetch the `preparingOptionEvents`
  * After that, I want to fetch all the chains for those events
  * But what I _really_ want is to fetch all the underlying instruments for those events
* I want all the quotes for the positions in the `positionQuotes` prop
  * I have to somehow map from positions -> instruments -> quotes
* I want the names of every instrument in my positions that's up today
  * Need to map from position -> instruments -> quotes, then filter on quotes, then get instrument name

```javascript
fetch({
  // can map instruments this component receives from its parent to
  // a descriptor for fetching a bunch of quotes
  instrumentQuotes: ({ instruments }) =>
    QuoteRecord.query(instruments.map(instrument => instrument.id))
})(MyComponent);
```

```javascript
fetch({
  // can take a passed in id and map that to a descriptor for
  // fetching and injecting a single record
  // can then grab the instrument in whatever way is defined
  // by the QuoteRecord
  quoteInstrument: ({ quoteId }) => QuoteRecord.find(quoteId).instrument()
})(MyComponent);
```

```javascript
@fetch({
  preparingOptionEvents: () => OptionEventRecord.fetch(({ preparing: true })),
})
@fetch({
  preparingOptionEventChains: ({ preparingOptionEvents }) =>
    preparingOptionEvents.error
      ? null
      : ChainRecord.fetch(preparingOptionEvents.map(e => e.chain_id))
})

@fetch({
  preparingOptionEventChains: () =>
    ChainRecord.fetch(
      await (
        OptionEventRecord.fetch({ preparing: true })
      ).map(e => e.chain_id) // <-- doubtful there's a good way to get this to work here w/o error checking
    )
})
```

<!-- 
- I want all the underlying instruments of the chains of the `preparing` option events for the stock detail instrument in the `preparingOptionEvents` prop
  - First I need to fetch the `preparingOptionEvents`
  - After that, I want to fetch all the chains for those events
  - But what I *really* want is to fetch all the underlying instruments for those events
-->

```javascript
fetch({
  // fetch returns a list descriptor object for `OptionEventRecord`. Since `chain`
  // is defined on the model as a way to fetch the chain for a single instance,
  // calling it from the list-type should yield a list-type object
  // for`OptionChainRecord`
  preparingOptionEventChains: () =>
    OptionEventRecord.query({ preparing: true }).chain(),

  // Each layer of the query could introduce some error. If the initial fetch fails,
  // `preparingOptionEventChainInstruments` will be an error. If fetching
  // chains fails (whole query or just pieces), `preparingOptionEventChainInstruments` will
  // be a map from event ids to errors. If fetching underlying instruments fails,
  // `preparingOptionEventChainInstruments` will be a map from event ids to lists
  // of errors
  // This means the client always has to check for errors at every possible level 😬
  preparingOptionEventChainInstruments: () =>
    OptionEventRecord.query({ preparing: true })
      .chain()
      .underlyingInstruments() // <-- batch requests the underlying instruments based
      // on the OptionChainRecord defined mechanism for fetching
      // them (i.e. InstrumentRecord.fetch)

      .key(opEvent => opEvent.id) // <-- injected prop will be a map with key from
  // OptionEventRecord id to lists of underlying
  // instruments
  // to implement this, each descriptor should pass along
  // the base record class / instance used to generate
  // the query
})(MyComponent);
```

<!-- @fetch({
  preparingOptionEventChains: () => OptionEventRecord.fetch.chains({ preparing: true })
}) -->

<!-- 
- I want the names of every instrument in my positions that's up today
  - Need to map from position -> instruments -> quotes, then filter on quotes, then get instrument name
-->

```javascript
fetch({
  upInstrumentNames: ({ positions }) =>
    InstrumentRecord.query(positions.map(position => position.instrument))
      .filter(instruments =>
        instruments.quote().get(quote => quote.coreValue > 0)
      )
      .get(instruments => instruments.map(instrument => instrument.name))
});
```

# Descriptor objects

Each descriptor should have a `type` and a promise returning `evaluate` function

get on a record descriptor yields the retrieved value
get on a list descriptor yields a list of the retrieved values
get on a map descriptor yields a map from `key` -> retrieved value

filter on a list descriptor takes in a function that receives a list
descriptor and returns a list descriptor that evaluates to an array
of booleans

filter on a map descriptor takes in a function that receives a map
descriptor and returns a map descriptor that evaluates to a map
of `key` -> boolean

# Mapper

Should specifcy how to map from the object to instances of related
objects

Should somehow yield a record or list descriptor. It can do this by
taking in parameters to yield the results url, e.g. /user/{user_id}/friends/
url. Could also return a descriptor with keys. The results here should be
normalizable.
