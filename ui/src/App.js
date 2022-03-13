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
} from "./service/api_service";

export const pathPrefix = "/appcenter/cisco/terraform/ui";

function App() {

  if (!(document.cookie && (document.cookie.split('; ').find(row => row.startsWith('AuthCookie')) || '').split('=')[1])) {
    window.location.href = '/'
  }

  const [showAbout, setShowAbout] = useState(false);
  const [authConfig, setAuthConfig] = useState("");
  const [version, setVersion] = useState([]);

  const getAuthConfig = useCallback(() => {
    // getVersion();
      fetchCredentials()
      .then((res) => {
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

  let dashboardComponent = DashboardWoToken;

  if(!authConfig){
    return(
      <div className="screen-container flex-center">
        <Loader theme={Loader.THEME.INFO} message="Loading" />
      </div>
    )
  } else if (authConfig.tokenExist) {
      dashboardComponent = Dashboard;
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
                  ? <AuthenticationToken authConfig={authConfig} refreshAuthConfig={getAuthConfig}/>
                : (
                  <main className="main-con">
                    <Header setShowAbout={setShowAbout} authConfig={authConfig} refreshAuthConfig={getAuthConfig}/>
                    <div>
                      <div className="container-fluid no-margin">
                        <Switch>
                          <Route
                            exact
                            path={pathPrefix + "/dashboard"}
                            component={dashboardComponent}
                          />
                          <Route
                            exact
                            path={pathPrefix + "/agents"}
                            render={() => <AgentTable authConfig={authConfig} />}
                          />
                          <Route
                            exact
                            path={pathPrefix + "/"}
                            component={dashboardComponent}
                          />
                          <Redirect exact from="*" to={pathPrefix} />
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