import React, { Component } from "react";
import fetch from "./fetch";
import Provider from "./fetch/Provider";
import { Quote, Instrument } from "./models";

const Test = fetch({
  quotes: () =>
    Quote.batch([
      "450dfc6d-5510-4d40-abfb-f633b7d9be3e",
      "943c5009-a0bb-4665-8cf4-a95dab5874e4"
    ]),
  instruments: () =>
    Quote.batch([
      "943c5009-a0bb-4665-8cf4-a95dab5874e4",
      "ebab2398-028d-4939-9f1d-13bf38f81c50"
    ]).instrument(),
  upInstrumentNames: () =>
    Instrument.batch([
      "450dfc6d-5510-4d40-abfb-f633b7d9be3e",
      "ebab2398-028d-4939-9f1d-13bf38f81c50"
    ])
      .quote()
      .filter(q => q.last_trade_price >= q.adjusted_previous_close)
      .instrument()
      .simpleName()
})(props => {
  console.log("props are", props);
  return null;
});

export default class App extends Component {
  render() {
    return (
      <Provider>
        <Test />
      </Provider>
    );
  }
}
