import ListDescriptor from "./ListDescriptor";

export default class Model {
  static batch(keys /* params */) {
    return new ListDescriptor({ keys, /* params, */ model: this });
  }

  // static query(params) {
  //   return new ListDescriptor({ params, model: this });
  // }
}
