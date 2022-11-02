import React from 'react';
import {
  Card,
  CardHeader,
  CardBody
} from "blueprint-react";

/**
 * AgentPoolRenderer component gives user the details on the selected agent pool.
 */

function PoolDetailRenderer(props) {
  const {
    item
  } = props;
  return (
    <Card className="col d-flex justify-content-center relative visible-inline-xs">
    <CardHeader>
      <div>
        <div className="icon-communities icon-medium-large half-padding text-primary"></div>
        <div className="pull-right half-margin-left">
          <div className="text-bold qtr-padding">Agent Pool</div>
          <div className="qtr-padding-left">{item.name }</div>
        </div>
      </div>
    </CardHeader>
    <CardBody className="half-padding-bottom base-padding-top">
    </CardBody>
    </Card>
  );
}

export default PoolDetailRenderer;


