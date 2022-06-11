import React from "react";
import PureRenderMixin from "react-addons-pure-render-mixin";

export const createPureComponent = data => {
  data.mixins = [PureRenderMixin];
  return React.createClass(data);
};
