import React, { useEffect, useCallback, useState } from "react";
import { Button,
  Loader,
  Charts,
  IconButton
} from "blueprint-react";
import emptyImage from "blueprint-react/assets/images/empty-raining.svg";

/**
 * DashboardWoToken component gives user the summary on the agents.
 * It displays the total number of agents created by the user,
 * or displays a create agent button if there are no existing agents.
*/

function DashboardWoToken(props) {
  const {
    agents,
    refreshAgents,
    fetchingAgentData,
  } = props;

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

  if(agents !== null){
    agents.forEach((agent) => {
      ndCreatedAgentsStatusData[agent.spec.status] += 1;
    })
  }

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
        <div className="col-xl-12">
          <div className="section">
            <div className="base-padding-left base-padding-right flex justify-content-sm-between">
              <h1 className="page-title">Overview</h1>
              <div>
                <IconButton
                  size={IconButton.SIZE.SMALL}
                  icon={IconButton.ICON.REFRESH}
                  onClick={() => {
                    refreshAgents()
                  }}
                />
              </div>
            </div>
            <div className="container-fluid">
              <div className="row max-width no-margin-left no-margin-right">
                  <div className="section max-width">
                    <div className="panel panel--fluid panel--loose base-margin-bottom">
                      <h4 className="subtitle text-bold" >ND Created Agents Status</h4>
                      { agents === null  || fetchingAgentData ?
                        <div className="base-padding flex-fill flex-center">
                          <Loader theme={Loader.THEME.LIGHT_GRAY} />
                        </div>
                      :
                        agents.length > 0 ?
                        <div className="row base-padding-top base-padding-bottom flex-center">
                          <Charts.DonutChart key={'donut-nd-created-agents'}
                            centerContentTitle={'Agents'}
                            data={ndCreatedAgentsChartData}
                            centerContent={agents.length}
                            size={Charts.DonutChart.MEDIUM}
                            colors={colors}
                          />
                        </div>
                        :
                        <div align="center" className="base-padding-top">
                          <img src={emptyImage} alt="empty" width="205px" />
                          <h4>No results found</h4>
                          <p>Create a new Agent</p>
                          <Button theme={"btn--primary"} onAction={() => {window.location.href = './agents';}}>Create Agent</Button>
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
