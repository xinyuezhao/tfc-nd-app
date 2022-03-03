import React, { useEffect, useCallback, useState } from "react";
import { Button, Gauge, Charts } from "blueprint-react";
import emptyImage from "blueprint-react/assets/images/empty-raining.svg";
import {
  fetchAgents,
} from "../service/api_service";
import _ from 'lodash';

function DashboardWoToken(props) {

  const [agentsData, setAgentsData] = useState([]);


  const getAgents = useCallback(() => {
      fetchAgents()
      .then((res) => {
        setAgentsData(res.data);
      })
      .catch((err) => {
        console.error("error is: ",err)
      });
    },
    []
  );
  useEffect(getAgents, [getAgents]);

const chartData = [
  {name: 'Organization A', value: 40},
  {name: 'Organization B', value: 10},
  {name: 'Organization c', value: 20}
]


  return (
    <div className="background-container">
      <header
        className="header header--compressed"
        style={{ background: "transparent" }}
      >
        <div className="header-bar container" style={{ paddingLeft: "0px" }}>
          <div className="header-bar__main" style={{ marginLeft: "0px" }}>
            <div className="section">
              <h2 className="page-title" style={{ fontWeight: "350" }}>
                Overview
              </h2>
                <div className="container-fluid">
                  <div className="row max-width">
                      <div className="section max-width">
                        <div className="panel panel--fluid panel--loose base-margin-bottom">
                          <h4 className="subtitle text-bold" >ND Created Agents Status</h4>
                          {!agentsData?
                            <div class="row base-padding-top base-padding-bottom" style={{ marginLeft: "38%"}}>
                              <Charts.DonutChart key={'donut-size-ex-' + 1}
                                centerContentTitle={'Title'}
                                data={chartData}
                                centerContent={"10"}
                                size={Charts.DonutChart.MEDIUM}
                              />
                            </div>
                            :<div className="no-data-container">
                              <div className="base-margin base-padding-top" align="center" >
                                <img src={emptyImage} alt="empty" width="15%" height="15%"/>
                                <h4 className="subtitle">No results found</h4>
                                <p className="subtitle">Create a new Agent</p>
                                <Button theme={"btn--primary"}>Create Agent</Button>
                                {/*<Button theme={"btn--primary"} onClick={() => handleOpenAgent()}>Create Agent</Button> */}
                              </div>
                            </div>
                          }
                        </div>
                      </div>
                  </div>
                </div>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}

export default DashboardWoToken;
