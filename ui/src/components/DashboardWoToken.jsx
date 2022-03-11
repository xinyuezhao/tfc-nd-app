import React, { useEffect, useCallback, useState } from "react";
import { Button,
  Loader,
  Charts,
  IconButton
} from "blueprint-react";
import emptyImage from "blueprint-react/assets/images/empty-raining.svg";
import {
  fetchAgents,
} from "../service/api_service";

function DashboardWoToken() {

  const [agentsData, setAgentsData] = useState([]);

  const getAgents = useCallback(() => {
      fetchAgents()
      .then((res) => {
        setAgentsData(res.data);
        console.info("Successfully fetched agent(s).", res.data)
      })
      .catch((error) => {
        console.error("Failed to fetch agent(s) from from backend agent service.",error)
      });
    },
    []
  );
  useEffect(getAgents, [getAgents]);

  const colorByStatus = {
    Running: '#6ebe4a',
    Creating: '#64bbe3',
    Initializing: '#faba64',
    Enabling: '#ffcc00',
    Errored: '#e2231a',
    Exited: '#888',
    Idle: '#98d280',
    Busy: '#487b32',
    Unknown: '#fbab18',
    Failed: '#9d2b2f',
  }

  let ndCreatedAgentsStatusData = {
    Running: 0,
    Creating: 0,
    Initializing: 0,
    Enabling: 0,
    Errored: 0,
    Exited: 0,
    Idle: 0,
    Busy: 0,
    Unknown: 0,
    Failed: 0,
  };

  agentsData.forEach((agent) => {
    ndCreatedAgentsStatusData[agent.spec.status] += 1;
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
      <div className="row">
        <div className="header-bar__main no-margin-left col-xl-12">
          <div className="section">
            <div className=" dbl-padding-left flex justify-content-sm-between">
              <h1 className="page-title ">Overview</h1>
              <div>
                <IconButton
                  size={IconButton.SIZE.SMALL}
                  icon={IconButton.ICON.REFRESH}
                  onClick={getAgents}
                />
              </div>
            </div>
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
