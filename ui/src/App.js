import React, { useEffect, useState, useCallback} from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import { withRouter } from "react-router";
import {
    ScreenManager,
    ErrorBoundary,
    Loader,
} from "blueprint-react";

import Header from "./components/Header";
import About from "./components/About";
import AgentTable from "./components/AgentTable";
import AppSidebar from "./components/AppSidebar";
import Dashboard from "./components/Dashboard";
import DashboardWoToken from "./components/DashboardWoToken";
import AuthenticationToken from "./components/AuthenticationToken"
import "./App.css";
import {
  fetchCredentials,
  fetchVersion,
  fetchAgents,
  fetchOrganizations,
} from "./service/api_service";

export const pathPrefix = "/appcenter/cisco/terraform/ui";

function App() {

  if (!(document.cookie && (document.cookie.split('; ').find(row => row.startsWith('AuthCookie')) || '').split('=')[1])) {
    window.location.href = '/'
  }

  const [showAbout, setShowAbout] = useState(false);
  const [authConfig, setAuthConfig] = useState("");
  const [version, setVersion] = useState([]);
  // create state for org and agents
  // const [agentConfig, setagentConfig] = useState("");
  const [agents, setAgents] = useState(null);
  const [orgData, setOrgData] = useState([]);
  const [fetchingData, setFetchingData] = useState(false);
  const [infoAlert, setInfoAlert] = useState("");
  const [warningAlert, setWarningAlert] = useState("");
  
// 38-48 for org and agents
  const getAuthConfig = useCallback(() => {
      fetchCredentials()
      .then((res) => {
        console.log("AUTH CONFIG IS ", res.data.spec);
        setAuthConfig(res.data.spec);
        console.info("Successfully fetched Authentication token from backend credential API.")
      })
      .catch((error) => {
        console.error("Failed to fetch Authentication token from backend credential API.",error);
      });
    },
    []
  );
  useEffect(getAuthConfig, [getAuthConfig]);


  const getAgents = useCallback(
    (setLoading) => {
      setFetchingData(setLoading === false ? false : true);
      fetchAgents()
      .then((res) => {
        setAgents(res.data);
        setFetchingData(false);
        console.info("Fetch agent(s) from backend agent service.")
      })
      .catch((error) => {
        console.error("Failed to fetch agent(s) from backend agent service.", error);
        error.response?.data?.detail?.message &&
          setWarningAlert(error.response.data?.detail?.message);
        setFetchingData(false);
      });
    },
    []
  );
  useEffect(getAgents, [getAgents]);

  const getOrganizations = useCallback(() => {
    fetchOrganizations()
      .then((res) => {
        setOrgData(res.data);
        console.info("Successfully fetched organization(s).",)
      })
      .catch(error => {
        console.error("Failed to fetch organization(s) from backend organization service.", error);
    });
  }, []);
  useEffect(getOrganizations, [getOrganizations]);

  const getVersion = useCallback(() => {
    fetchVersion()
    .then((res) => {
      const ndAppsData = res.data;
      ndAppsData.map(
        (app) => {
          if(app.name === "cisco-terraform"){
            setVersion(app.version);
          }
          return null;
      });
      console.info("Successfully fetched the application version.")
    })
    .catch((error) => {
      console.error("Failed to fetch the application version.",error);
    });
  },[]);
  useEffect(getVersion, [getVersion]);

  let dashboardComponent = <DashboardWoToken agents={agents} refreshAgents={getAgents}/>;

  if(!authConfig){
    return(
      <div className="screen-container flex-center">
        <Loader theme={Loader.THEME.INFO} message="Loading" />
      </div>
    )
  } else if (authConfig.tokenExist) {
      dashboardComponent =  <Dashboard agents={agents} refreshAgents={getAgents} orgData={orgData} refreshOrgnizations={getOrganizations}/>;
  }

  return (
    <div>
      <ErrorBoundary>
        <ScreenManager>
          <About show={showAbout} version={version} onClose={() => setShowAbout(false)}/>
          <div id="content-container">
            <div id="main-content" className="content-fluid relative textarea bg-color-gray">
              <AppSidebar />
                {!authConfig.configured
                  ? <AuthenticationToken authConfig={authConfig} refreshAuthConfig={getAuthConfig}  refreshAgents={getAgents}/>
                : (
                  <main className="main-con">
                    <Header setShowAbout={setShowAbout} authConfig={authConfig} refreshAuthConfig={getAuthConfig}  refreshAgents={getAgents}/>
                    <div>
                      <div className="container-fluid no-margin">
                        {/* pass refreshOrg and refreshAgents in the below routes (refresh when close for auth) */}
                        <Switch>
                          <Route
                            exact
                            path={pathPrefix + "/agents"}
                            render={() => <AgentTable authConfig={authConfig}  agents={agents} refreshAgents={getAgents} fetchingData={fetchingData}/>}
                          />
                          <Route
                            exact
                            path={pathPrefix + "/"}
                            render={() => dashboardComponent}
                          />
                          <Redirect exact from="*" to={pathPrefix}/>
                        </Switch>
                      </div>
                    </div>
              </main>
              )}
            </div>
          </div>
        </ScreenManager>
      </ErrorBoundary>
    </div>
  );
}

export default withRouter(App);