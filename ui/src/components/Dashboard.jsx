import React, { useEffect, useCallback, useState } from "react";
import { Button, Avatar, Charts, BasePalette } from "blueprint-react";
import emptyImage from "blueprint-react/assets/images/empty-raining.svg";
import {
  fetchOrganizations,
  fetchAgents,
} from "../service/api_service";
import OrganizationDashboardWidget from "./OrganizationDashboardWidget";
import _ from 'lodash';

function Dashboard(props) {

  const [agentsData, setAgentsData] = useState([]);
  const [orgData, setOrgData] = useState([]);
  // let organizationData = [];

  const getOrganizations = useCallback(() => {
    fetchOrganizations()
      .then((res) => {
        // const orgResult = res.data;
        // console.log("ORG res.data", orgResult)
        setOrgData(res.data);
        // organizationData =  _.orderBy(orgResult).map((item) => (item.spec));
        console.log("ORG DATA", res.data)
      })
      .catch(error => {
        console.error('There was an error!', error);
    });
  }, []);

  const getAgents = useCallback(() => {
      fetchAgents()
      .then((res) => {
        setAgentsData(res.data);
        console.log("AGENTS res.data", res.data)
      })
      .catch((err) => {
        console.error("error is: ",err)
      });
    },
    []
  );

  useEffect(getOrganizations, [getOrganizations]);
  useEffect(getAgents, [getAgents]);

  const OrganizationDashboardWidgets = orgData.map((org) => {
    return <OrganizationDashboardWidget
      name={org.spec.Name}
      activeAgents={org.spec.Usage.ActiveAgentCount}
      concurrencyLimitReached={org.spec.Usage.ConcurrencyLimitReached}
      averageAppliesPerMonth={org.spec.Usage.AverageAppliesPerMonth}
      adminUserCount={org.spec.Usage.AdminUserCount}
      maxConcurrencyLimitReached={org.spec.Subscription.RunsCeiling}
      maxAverageAppliesPerMonth={org.spec.Subscription.ContractApplyLimit}
      maxAdminUserCount={org.spec.Subscription.ContractUserLimit}
      maxActiveAgents={org.spec.Subscription.AgentsCeiling}
    />
  });


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

  const activeWorkspacesChartData = orgData.map((org) => ({
    name: org.spec.Name,
    value: org.spec.Usage.WorkspaceCount,
  })).sort((a, b) => a.value < b.value ? 1 : -1);

  const totalActiveWorkspaces = activeWorkspacesChartData.reduce((total, org) => total + org.value, 0);

  // const activeAgentsChartData = orgData.map((org) => ({
  //   name: org.spec.Name,
  //   value: org.spec.Usage.ActiveAgentCount,
  // })).sort((a, b) => a.value < b.value ? 1 : -1);

  // const totalActiveAgents = activeAgentsChartData.reduce((total, org) => total + org.value, 0);

  const totalAppliesChartData = orgData.map((org) => ({
    name: org.spec.Name,
    value: org.spec.Usage.TotalApplies,
  })).sort((a, b) => a.value < b.value ? 1 : -1);

  const sumTotalApplies = totalAppliesChartData.reduce((total, org) => total + org.value, 0);

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
                  <div className="row">
                    <div className="col-xl-4">
                      <div className="section">
                        <div className="panel panel--loose  base-margin-bottom">
                          <h4 className="subtitle text-bold" >ND Created Agents Status</h4>
                          {agentsData?
                            <div class="row base-padding-top base-padding-bottom">
                              <Charts.DonutChart
                                key={'donut-nd-created-agents'}
                                centerContentTitle={'Agents'}
                                data={ndCreatedAgentsChartData}
                                centerContent={agentsData.length}
                                size={Charts.DonutChart.MEDIUM}
                                colors={colors}
                              />
                            </div>
                            :<div className="no-data-container">
                            <div className="base-margin" style={{ paddingTop:"20px" }} align="center">
                              <img src={emptyImage} alt="empty" width="75%" height="75%"/>
                              <h4 className="subtitle" align="center">No results found</h4>
                              <p className="subtitle" align="center">Create a new Agent</p>
                              <Button theme={"btn--primary"} align="center"  onClick={() => fetchOrganizations}>Create Agent</Button>
                              {/*<Button theme={"btn--primary"} onClick={() => handleOpenAgent()}>Create Agent</Button> Send to agent table */}
                            </div>
                          </div>}
                        </div>
                      </div>
                    </div>
                    <div className="col-xl-4">
                      <div className="section">
                        <div className="panel panel--loose  base-margin-bottom">
                          <h4 className="subtitle text-bold">Active Workspaces</h4>
                          <div class="row base-padding-top base-padding-bottom">
                            <Charts.DonutChart key='donut-active-workspaces'
                              centerContentTitle={'Workspaces'}
                              data={activeWorkspacesChartData}
                              centerContent={totalActiveWorkspaces}
                              size={Charts.DonutChart.MEDIUM}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-xl-4">
                      <div className="section">
                        <div className="panel panel--loose base-margin-bottom">
                          <h4 className="subtitle text-bold">Total Applies</h4>
                          <div class="row base-padding-top base-padding-bottom">
                            <Charts.DonutChart key='donut-active-agents'
                              centerContentTitle={'Agents'}
                              data={totalAppliesChartData}
                              centerContent={sumTotalApplies}
                              size={Charts.DonutChart.MEDIUM}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {OrganizationDashboardWidgets}

                </div>

            </div>
          </div>
        </div>
      </header>
    </div>
  );
}

export default Dashboard;
