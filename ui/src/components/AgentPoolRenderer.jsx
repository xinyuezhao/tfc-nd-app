import React from 'react';
import _ from 'lodash';
import {
  Card,
  CardHeader,
  CardBody
} from "blueprint-react";

// const getPoolData = (page, pageSize, max) => {
//   const start = page * pageSize;
//   const end = Math.min(start + pageSize, max)
//   const data = _.range(start, end).map((i) => ({
//     name: 'Agent Pool ' + i,
//     id: 'id_' + i}));
//   return data;
// }

// const getSearchData = (page, pageSize, max, str = '') => {
//   const allData = _.range(0, max)
//     .map((i) => ({
//       name: 'Agent Pool ' + i,
//       id: i })
//     )
//     .filter((item) => item.name.indexOf(str) !== -1);
//   const pageData = allData.slice(page * pageSize, page * pageSize + pageSize);
//   return {
//     data: pageData,
//     total: allData.length
//   }
// }

const PoolDetailRenderer = (props) => {
  const {
    item
  } = props;
  return (
    <Card className="col d-flex justify-content-center" style={{ position: "relative", display: "inline-block"}}>
    <CardHeader>
      <div>
        <div class="icon-insights icon-medium-large" style={{ background: "white", color: "#049fd9", padding: "10px"}}></div>
        <div style={{float: "right", marginLeft: "10px"}}>
          <div style={{ fontWeight: "bold", fontSize: "12px", padding: "2px"}}>Agent Pool</div>
          <div style={{ padding: "2px"}}>{item.name }</div>
        </div>
      </div>
    </CardHeader>
    <CardBody style={{ paddingTop: "25px", paddingBottom: "10px"}}>
    </CardBody>
    </Card>
  );
}

export {
  // getPoolData,
  PoolDetailRenderer,
  // getSearchData
}

