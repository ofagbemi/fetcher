import React from "react";
import PropTypes from "prop-types";
import superagent from "superagent";

import { idFromUrl } from "../util";

export default config => WrappedComponent => {
  return class WithData extends React.Component {
    static contextTypes = {
      fetch: PropTypes.shape({
        takeLoader: PropTypes.func
      })
    };

    state = {};

    async componentDidMount() {
      const keys = Object.keys(config);
      const promises = keys.map(async key => {
        const descriptor = config[key](this.props);
        return {
          key,
          value: await descriptor._evaluate(this.context.fetch.takeLoader)
        };
      });

      const nextState = {};
      const objects = await Promise.all(promises);
      objects.forEach(({ key, value }) => {
        nextState[key] = value;
      });

      this.setState(nextState);
    }

    render() {
      return <WrappedComponent {...this.state} />;
    }
  };
};
