import React, { useEffect, useCallback, useState } from "react";
import { Button, Charts, Loader } from "blueprint-react";
import emptyImage from "blueprint-react/assets/images/empty-raining.svg";
import {
  fetchOrganizations,
  fetchAgents,
} from "../service/api_service";
import OrganizationDashboardWidget from "./OrganizationDashboardWidget";

function Dashboard(props) {

  const [agentsData, setAgentsData] = useState([]);
  const [orgData, setOrgData] = useState([]);

  const getOrganizations = useCallback(() => {
    fetchOrganizations()
      .then((res) => {
        setOrgData(res.data);
        console.log("Successfully fetched organization(s).",)
      })
      .catch(error => {
        console.error("Failed to fetch organization(s) from HashiCorp Terraform cloud.", error);
    });
  }, []);

  const getAgents = useCallback(() => {
      fetchAgents()
      .then((res) => {
        setAgentsData(res.data);
        console.log("Successfully fetched agent(s).",)
      })
      .catch((error) => {
        console.error("Failed to fetch agent(s) from HashiCorp Terraform cloud.",error)
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
    creating: '#64bbe3',
    initializing: '#faba64',
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
    creating: 0,
    initializing: 0,
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

  const totalAppliesChartData = orgData.map((org) => ({
    name: org.spec.Name,
    value: org.spec.Usage.TotalApplies,
  })).sort((a, b) => a.value < b.value ? 1 : -1);

  const sumTotalApplies = totalAppliesChartData.reduce((total, org) => total + org.value, 0);

  if(!agentsData){
    return(
      <div className="screen-container flex-center">
        <Loader theme={Loader.THEME.INFO} message="Loading" />
      </div>
    )
  }
  if(!orgData){
    return(
      <div className="screen-container flex-center">
        <Loader theme={Loader.THEME.INFO} message="Loading" />
      </div>
    )
  }

  return (
    <div className="background-container">
      <div className="header-bar container no-padding-left">
        <div className="header-bar__main no-margin-left">
          <div className="section">
            <h1 className="page-title base-padding">
              Overview
            </h1>
            <div className="container-fluid">
              <div className="row">
                <div className="col-xl-4">
                  <div className="section no-padding-bottom">
                    <div className="panel panel--loose  base-margin-bottom">
                      <h4 className="subtitle text-bold" >ND Created Agents Status</h4>
                      {agentsData.length === 0 ?
                        <div className="base-padding flex-fill flex-center">
                          <Loader theme={Loader.THEME.LIGHT_GRAY} />
                        </div>
                      :
                        agentsData?
                        <div className="base-padding dbl-margin-left">
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
                          <div className="base-margin base-padding-top rc-calendar-week-number-cell">
                            <img src={emptyImage} alt="empty" width="55%" height="55%"/>
                            <h4 className="base-padding-top">No results found</h4>
                            <p className="subtitle">Create a new Agent</p>
                            <Button theme={"btn--primary"} onAction={() => {window.location.href = './agents';}}>Create Agent</Button>
                          </div>
                        </div>
                      }
                    </div>
                  </div>
                </div>
                <div className="col-xl-4 flex">
                  <div className="section no-padding-bottom flex flex-fill">
                    <div className="panel panel--loose  base-margin-bottom flex flex-column flex-fill">
                      <h4 className="subtitle text-bold">Active Workspaces</h4>
                      {orgData.length === 0 ?
                        <div className="base-padding flex-fill flex-center">
                          <Loader theme={Loader.THEME.LIGHT_GRAY} />
                        </div>
                      :
                        <div className="base-padding flex-fill flex-center-vertical">
                          <Charts.DonutChart
                            key='donut-active-workspaces'
                            centerContentTitle={'Workspaces'}
                            data={activeWorkspacesChartData}
                            centerContent={totalActiveWorkspaces}
                            size={Charts.DonutChart.MEDIUM}
                          />
                        </div>
                      }
                    </div>
                  </div>
                </div>
                <div className="col-xl-4 flex">
                  <div className="section no-padding-bottom flex flex-fill">
                    <div className="panel panel--loose base-margin-bottom flex flex-column flex-fill">
                      <h4 className="subtitle text-bold">Total Applies</h4>
                      {orgData.length === 0 ?
                        <div className="base-padding flex-fill flex-center">
                          <Loader theme={Loader.THEME.LIGHT_GRAY} />
                        </div>
                      :
                        <div className="base-padding flex-fill flex-center-vertical">
                          <Charts.DonutChart
                            key='donut-active-agents'
                            centerContentTitle={'Agents'}
                            data={totalAppliesChartData}
                            centerContent={sumTotalApplies}
                            size={Charts.DonutChart.MEDIUM}
                          />
                        </div>
                      }
                    </div>
                  </div>
                </div>
              </div>
              {orgData.length === 0 ?
                <div className="base-padding"><Loader theme={Loader.THEME.LIGHT_GRAY} /></div>
              :OrganizationDashboardWidgets}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
