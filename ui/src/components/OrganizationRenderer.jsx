import React from 'react';
import {
  Card,
  CardHeader,
  CardBody
} from "blueprint-react";

const OrgDetailRenderer = (props) => {
  const {
    item
  } = props;

  return (
    <Card className="col d-flex justify-content-center" style={{ position: "relative", display: "inline-block"}}>
    <CardHeader>
      <div>
        <div className="icon-communities icon-medium-large" style={{ background: "white", color: "#049fd9", padding: "10px"}}></div>
        <div style={{float: "right", marginLeft: "10px"}}>
          <div className="text-bold" style={{  fontSize: "12px", padding: "2px"}}>Organization</div>
          <div style={{ padding: "2px"}}>{item.name }</div>
        </div>
      </div>
    </CardHeader>
    <CardBody className="dbl-padding">
      <div className="text-bold"  style={{  fontSize: "15px"}}>General</div>
      <div style={{ paddingTop: "10px", color: "gray"}}>Description</div>
      <div className="base-padding">{item.description? item.description: "-"}</div>
    </CardBody>
    </Card>
  );
}

export {
  OrgDetailRenderer
}

