import React, { useEffect, useCallback, useState } from "react";
import { Button, Loader, Charts } from "blueprint-react";
import emptyImage from "blueprint-react/assets/images/empty-raining.svg";
import {
  fetchAgents,
} from "../service/api_service";

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

  const colorByStatus = {
    running: '#6ebe4a',
    created: '#64bbe3',
    enabling: '#ffcc00',
    errored: '#e2231a',
    exited: '#888',
    idle: '#98d280',
    busy: '#487b32',
    unknown: '#fbab18',
    failed: '#9d2b2f',
  }

  let ndCreatedAgentsStatusData = {
    running: 0,
    created: 0,
    enabling: 0,
    errored: 0,
    exited: 0,
    idle: 0,
    busy: 0,
    unknown: 0,
    failed: 0,
  };

  agentsData.forEach((agent) => {
    ndCreatedAgentsStatusData[agent.spec.status.toLowerCase()] += 1;
  })

  const ndCreatedAgentsChartData = Object.keys(ndCreatedAgentsStatusData).map((key, index) => ({
    name: key,
    value: ndCreatedAgentsStatusData[key],
  })).sort((a, b) => a.value < b.value ? 1 : -1);

  let colors = [];

  ndCreatedAgentsChartData.forEach((status) => {
    colors.push(colorByStatus[status.name])
  })

  return (
    <div className="background-container">
      <div className="header-bar container no-padding-left">
        <div className="header-bar__main no-margin-left">
          <div className="section">
            <h1 className="page-title base-padding">
              Overview
            </h1>
            <div className="container-fluid">
              <div className="row max-width dbl-padding-left">
                  <div className="section max-width">
                    <div className="panel panel--fluid panel--loose base-margin-bottom">
                      <h4 className="subtitle text-bold" >ND Created Agents Status</h4>
                      {agentsData.length === 0 ?
                        <div className="base-padding flex-fill flex-center">
                          <Loader theme={Loader.THEME.LIGHT_GRAY} />
                        </div>
                      :
                        agentsData?
                        <div className="row base-padding-top base-padding-bottom flex-center">
                          <Charts.DonutChart key={'donut-nd-created-agents'}
                            centerContentTitle={'Agents'}
                            data={ndCreatedAgentsChartData}
                            centerContent={agentsData.length}
                            size={Charts.DonutChart.MEDIUM}
                            colors={colors}
                          />
                        </div>
                        :<div className="no-data-container">
                          <div className="base-margin base-padding-top rc-calendar-week-number-cell">
                            <img src={emptyImage} alt="empty" width="15%" height="15%"/>
                            <h4 className="subtitle">No results found</h4>
                            <p className="subtitle">Create a new Agent</p>
                            <Button theme={"btn--primary"} onAction={() => {window.location.href = './agents';}}>Create Agent</Button>
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
    </div>
  );
}

export default DashboardWoToken;
