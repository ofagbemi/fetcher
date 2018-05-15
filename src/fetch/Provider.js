// @flow
import { Map } from "immutable";
import queryString from "query-string";
import superagent from "superagent";
import { Component } from "react";
import PropTypes from "prop-types";
import withContext from "recompose/withContext";
import DataLoader from "dataloader";

function serializeParams(params) {
  return queryString.stringify(params);
}

function createLoader(model, params) {
  const spec = model.spec();
  return new DataLoader(async keys => {
    const url = spec.batch(keys, params);
    const response = await superagent.get(url);
    return response.body.results;
  });
}

export default class Provider extends Component {
  static childContextTypes = {
    fetch: PropTypes.shape({
      takeLoader: PropTypes.func
    })
  };

  getChildContext() {
    return {
      fetch: {
        takeLoader: this.takeLoader
      }
    };
  }

  _loaders = Map().asMutable();
  _loaderCounts = Map().asMutable();

  takeLoader = (model, params) => {
    const paramsKey = serializeParams(params);
    const keyPath = [model, paramsKey];
    if (!this._loaders.hasIn(keyPath)) {
      this._loaders.setIn(keyPath, createLoader(model, params));
    }
    this._loaderCounts.updateIn(keyPath, value => {
      return (value || 0) + 1;
    });
    return this._loaders.getIn(keyPath);
  };

  releaseLoader = (model, params) => {
    // TODO: Implement
  };

  render() {
    return this.props.children;
  }
}
