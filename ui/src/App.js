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
import { fetchAuthenticationToken } from "./service/api_service";

export const pathPrefix = "/appcenter/cisco/terraform/ui";

function App() {

  const [showAbout, setShowAbout] = useState(false);
  const [authConfig, setAuthConfig] = useState("");

  const getAuthConfig = useCallback(() => {
      fetchAuthenticationToken()
      .then((res) => {
        setAuthConfig(res.data.spec);
        console.log("Successfully fetched Authentication token from Terraform Cloud.")
      })
      .catch((err) => {
        console.error("Failed getting Authentication token from Terraform Cloud.",err);
      });
    },
    []
  );
  useEffect(getAuthConfig, [getAuthConfig]);

  let dashboardComponent = DashboardWoToken;

  if(!authConfig){
    return(
      <div className="screen-container flex-center">
        <Loader theme={Loader.THEME.INFO} message="Loading" />
      </div>
    )
  } else{
    if (authConfig.tokenExist){
      dashboardComponent = Dashboard;
    }

  }

  return (
    <div>
      <ErrorBoundary>
        <ScreenManager>
          <About show={showAbout} onClose={() => setShowAbout(false)}/>
          <div id="content-container">
            <div
              id="main-content"
              className="content-fluid relative textarea bg-color-gray"
            >
              <AppSidebar />
              <div className="content-header" >
              </div>
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