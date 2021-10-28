import React, { useEffect } from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import { withRouter } from "react-router";
import { ScreenManager, ErrorBoundary } from "blueprint-react";

import AgentTable from "./components/AgentTable";
import AppSidebar from "./components/AppSidebar";
// import LoginPage from "./components/LoginPage";
// import Dashboard from "./components/Dashboard";
import "./App.css";
// import { isUserLogin } from "./service/api_service";

export const pathPrefix = "/appcenter/cisco/terraformcloud/ui";

function App(props) {
  useEffect(() => {
    const payload = {
      nd_url: window.location.origin,
    };
    // isUserLogin(payload)
    //   .then((response) => {
    //     if (response.status === 200) {
    //       localStorage.setItem("login_type", response.data.login_mechanism);
    //       localStorage.setItem(
    //         "instance_url",
    //         response.data.terraformcloud_instance_url
    //       );
    //       window.location.pathname === pathPrefix + "/login" &&
    //         props.history.push(pathPrefix + "/dashboard");
    //     }
    //   })
    //   .catch((err) => {
    //     if (err.response?.status === 401) {
    //       props.history.push({
    //         pathname: pathPrefix + "/login",
    //         state: { sessionExpired: true },
    //       });
    //     }
    //   });
  }, [props.history]);
  return (
    <div>
      <ErrorBoundary>
        <ScreenManager>
          <div id="content-container" style={{ background: "#dfdfdfa1" }}>
            <div
              id="main-content"
              style={{ overflowX: "auto" }}
              className="content-fluid relative"
            >
              <AppSidebar />
              <div className="content-header"></div>
              <main className="main-con">
                <header className="header header--compressed" style={{ background: "transparent" }}>
                  <div className="header-bar container">
                    <div className="header-bar__main"></div>
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

