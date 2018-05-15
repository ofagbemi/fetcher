import superagent from "superagent";

export default class ListDescriptor {
  constructor({ keys, model, _getKeys, _parent }) {
    this._keys = keys;
    this._getKeys = _getKeys;
    this._model = model;
    this._spec = model.spec();
    this._actions = [];

    const fields = Object.keys(this._spec.fields);
    fields.forEach(field => {
      this[field] = () => {
        const fieldSpec = this._spec.fields[field];

        if (typeof fieldSpec === "function") {
          return this.map(fieldSpec);
        }

        if (fieldSpec.key && fieldSpec.model) {
          return new ListDescriptor({
            model: this._spec.fields[field].model,
            _getKeys: async takeLoader => {
              const list = await this._evaluate(takeLoader);
              const relationKeys = list.map(this._spec.fields[field].key);
              return relationKeys;
            }
          });
        }
      };
    });
  }

  _addAction(action, args) {
    this._actions.push({ action, args });
    return this;
  }

  filter(...args) {
    return this._addAction("filter", args);
  }

  map(...args) {
    return this._addAction("map", args);
  }

  async _evaluate(takeLoader) {
    let keys = [];
    if (this._keys) {
      keys = this._keys;
    } else if (this._getKeys) {
      keys = await this._getKeys(takeLoader);
    }

    const loader = takeLoader(this._model);
    let list = await loader.loadMany(keys);
    this._actions.forEach(({ action, args }) => {
      list = list[action](...args);
    });
    return list;
  }
}
