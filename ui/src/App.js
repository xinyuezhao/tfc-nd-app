import React, { useEffect, useState} from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import { withRouter } from "react-router";
import {
    ScreenManager,
    ErrorBoundary,
    Modal,
} from "blueprint-react";

import {Header} from "./components/Header";
import AgentTable from "./components/AgentTable";
import AppSidebar from "./components/AppSidebar";
// import Dashboard from "./components/Dashboard";
// import AuthenticationToken from "./components/AuthenticationToken"
import "./App.css";
// import { isUserLogin } from "./service/api_service";

// export const pathPrefix = "/appcenter/cisco/terraformcloud/ui";
export const pathPrefix = "/appcenter/cisco/terraform/ui";

function App(props) {

  const [showAbout, setShowAbout] = useState(false);

  useEffect(() => {
    const payload = {
      nd_url: window.location.origin,
    };

  }, [props.history]);
  return (
    <div>
      <ErrorBoundary>
        <ScreenManager>
          <AboutModal show={showAbout} onClose={() => setShowAbout(false)} />
          <div id="content-container" style={{ background: "#dfdfdfa1" }}>
            <div
              id="main-content"
              style={{ overflowX: "auto" }}
              className="content-fluid relative"
            >
              <AppSidebar />
              <div className="content-header" >
              </div>
              <main className="main-con">
                <Header setShowAbout={setShowAbout}/>
                <div>
                  <div className="container-fluid" style={{ margin: "0" }}>
                    <Switch>
                      {/*
                      <Route
                        exact
                        path={pathPrefix + "/dashboard"}
                        component={Dashboard}
                      />
                    */}
                      <Route
                        exact
                        path={pathPrefix + "/home"}
                        component={AgentTable}
                      />
                      <Route
                        exact
                        path={pathPrefix + "/"}
                        component={AgentTable}
                      />
                      <Redirect exact from="*" to={pathPrefix} />
                    </Switch>
                  </div>
                </div>
              </main>
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
    <Modal class="about-modal"
    title=" "
      isOpen={show}
      onClose={onClose}
      // cancelButtonProps={{ style: { display: 'none' } }}
      cancelButtonLabel={null} // prevent cancel button from being added to footer.
      applyButtonLabel={null} // prevent OK button from being added to footer.
      style={{ color: "white"}}
      // footer={null}
      >
      <div class="icon-cisco icon-medium-large" style={{ background: "white", color: "#049fd9", padding: "10px", marginBottom: "15px"}}/>
      <h3>Nexus Dashboard Connector for Terraform</h3>
      <p>Version ##.#(#)</p>
      <p>Cisco Systems, Inc. All rights reserved.</p>
    </Modal>
  )
}