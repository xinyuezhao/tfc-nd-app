import React, { useEffect, useState, useCallback} from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import { withRouter } from "react-router";
import {
    ScreenManager,
    ErrorBoundary,
    Modal,
    Loader,
} from "blueprint-react";

import {Header} from "./components/Header";
import AgentTable from "./components/AgentTable";
import AppSidebar from "./components/AppSidebar";
import Dashboard from "./components/Dashboard";
import DashboardWoToken from "./components/DashboardWoToken";
import AuthenticationToken from "./components/AuthenticationToken"
import "./App.css";
import { fetchAuthenticationToken } from "./service/api_service";

export const pathPrefix = "/appcenter/cisco/terraform/ui";

function App(props) {

  const [showAbout, setShowAbout] = useState(false);
  const [authConfig, setAuthConfig] = useState("");

  useEffect(() => {
    const payload = {
      nd_url: window.location.origin,
    };

  }, [props.history]);

  // check if we need 26-31

  const getAuthConfig = useCallback(() => {
      fetchAuthenticationToken()
      .then((res) => {
        setAuthConfig(res.data.spec);
        console.log(res.data.spec)
      })
      .catch((err) => {
        console.error(err);
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
          <AboutModal show={showAbout} onClose={() => setShowAbout(false)}/>
          <div id="content-container" style={{ background: "#dfdfdfa1" }}>
            <div
              id="main-content"
              style={{ overflowX: "auto" }}
              className="content-fluid relative"
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
                      <div className="container-fluid" style={{ margin: "0" }}>
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


const AboutModal = (props) => {
  const {
    show,
    onClose,
  } = props;

  return (
    <Modal className="about-modal"
    title=" "
      isOpen={show}
      onClose={onClose}
      cancelButtonLabel={null} // prevent cancel button from being added to footer.
      applyButtonLabel={null} // prevent OK button from being added to footer.
      style={{ color: "white"}}
      >
      <div className="icon-cisco icon-medium-large" style={{ background: "white", color: "#049fd9", padding: "10px", marginBottom: "15px"}}/>
      <h3>Nexus Dashboard Connector for Terraform</h3>
      <p>Version ##.#(#)</p>
      <p>Cisco Systems, Inc. All rights reserved.</p>
    </Modal>
  )
}