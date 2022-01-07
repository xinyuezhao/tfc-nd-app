import React, { useEffect, useState} from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import { withRouter } from "react-router";
import { ScreenManager,
  ErrorBoundary, Dropdown, LABELS, IconButton, Modal, useScreenActions  } from "blueprint-react";

import AgentTable from "./components/AgentTable";
import AppSidebar from "./components/AppSidebar";
// import LoginPage from "./components/LoginPage";
// import Dashboard from "./components/Dashboard";
import AuthenticationToken from "./components/AuthenticationToken"
import "./App.css";
// import { isUserLogin } from "./service/api_service";


export const pathPrefix = "/appcenter/cisco/terraformcloud/ui";

function App(props) {

  const [showAbout, setShowAbout] = useState(false);
  const actions = useScreenActions();

  const menuOptions = [
    {
      label: "Setup",
      action: () => {
        actions.openScreen(AuthenticationToken, {
        title: "title",
        screenId: "authentication-token",
      })
      console.log("open screen")
    }
    },
    {
      label: LABELS.about,
      action: () => setShowAbout(true),
    },
  ];


  useEffect(() => {
    const payload = {
      nd_url: window.location.origin,
    };

  }, [props.history]);
  return (
    <div>
      <ErrorBoundary>
      <AboutModal show={showAbout} onClose={() => setShowAbout(false)} />
        <ScreenManager>
          <div id="content-container" style={{ background: "#dfdfdfa1" }}>
            <div
              id="main-content"
              style={{ overflowX: "auto" }}
              className="content-fluid relative"
            >
              <AppSidebar />
              <div className="content-header">
              </div>
              <main className="main-con">
                <header className="header header--compressed" style={{ background: "transparent" }}>
                  <div className="header-bar container">
                    <div className="header-bar__main">
                    <div className="right-menu-icons" style={{ float:"right", paddingTop: "10px" }}>
                    <Dropdown
                    type={Dropdown.TYPE.BUTTON}
                    size={Dropdown.SIZE.SMALL}
                    icon={IconButton.ICON.COG}
                    menuDirection={Dropdown.MENU_DIRECTION.LEFT}
                    items={menuOptions} />
                    </div>
                    </div>
                  </div>
                </header>
                <div>
                  <div className="container-fluid" style={{ margin: "0" }}>
                    <Switch>
                      {/* <Route
                        exact
                        path={pathPrefix + "/login"}
                        component={LoginPage}
                      />
                      <Route
                        exact
                        path={pathPrefix + "/dashboard"}
                        component={Dashboard}
                      />*/}
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
                      <Route
                        exact
                        path={pathPrefix + "/auth"}
                        component={AuthenticationToken}
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

  return (<Modal title="Terraform Cloud" isOpen={show} onClose={onClose}>
  <p>Version ##.#(#)</p>
  <p>Cisco Systems, Inc. All rights reserved.</p>
  {/*<p>Current System Time: <Timestamp relative date={Date} autoUpdate /> </p>  */}
</Modal>)
}