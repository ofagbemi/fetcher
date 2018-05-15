import Model from "../fetch/Model";
import Instrument from "./Instrument";
import { idFromUrl } from "../util";

export default class Quote extends Model {
  static baseUrl = "https://api.robinhood.com/quotes/";

  static spec() {
    return {
      batch: ids =>
        `${this.baseUrl}?instruments=${ids
          .map(id => `/instruments/${id}/`)
          .join()}`,
      query: params => this.baseUrl,
      fields: {
        instrument: {
          model: Instrument,
          key: quote => idFromUrl(quote.instrument)
        }
      }
    };
  }
}
