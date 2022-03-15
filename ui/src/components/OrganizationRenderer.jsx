import React from 'react';
import {
  Card,
  CardHeader,
  CardBody
} from "blueprint-react";

/**
 * OrganizationRenderer component gives user the details on the selected organization.
 * It displays organization details such as name and description.
 */

function OrgDetailRenderer(props) {
  const {
    item
  } = props;

  return (
    <Card className="col d-flex justify-content-center relative visible-inline-xs">
    <CardHeader>
      <div>
        <div className="icon-communities icon-medium-large half-padding text-primary" ></div>
        <div className="pull-right half-margin-left">
          <div className="text-bold qtr-padding">Organization</div>
          <div className="qtr-padding-left">{item.name }</div>
        </div>
      </div>
    </CardHeader>
    <CardBody className="dbl-padding">
      <div className="text-bold text-large base-padding-top">General</div>
      <div className="text-muted base-padding-top">Description</div>
      <div>{item.description? item.description : "-"}</div>
    </CardBody>
    </Card>
  );
}

export default OrgDetailRenderer;

