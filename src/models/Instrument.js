import Model from "../fetch/Model";
import Quote from "./Quote";

export default class Instrument extends Model {
  static baseUrl = "https://api.robinhood.com/instruments/";

  static spec() {
    return {
      batch: ids => `${this.baseUrl}?ids=${ids.join()}`,
      query: params => this.baseUrl,
      fields: {
        quote: {
          model: Quote,
          key: instrument => instrument.id
        },
        simpleName: instrument => instrument.simple_name || instrument.name
      }
    };
  }
}
