import React from "react";
import { Button } from "blueprint-react";
import emptyImage from "blueprint-react/assets/images/empty-raining.svg";

function Dashboard(props) {


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
                        <div className="panel panel--loose panel--raised base-margin-bottom">
                          <h4 className="subtitle text-bold" >ND Created Agents Status</h4>
                          <div className="no-data-container">
                            <div className="base-margin" style={{ paddingTop:"20px" }} align="center">
                              <img src={emptyImage} alt="empty" width="75%" height="75%"/>
                              <h4 className="subtitle" align="center">No results found</h4>
                              <p className="subtitle" align="center">Create a new Agent</p>
                              <Button theme={"btn--primary"} align="center">Create Agent</Button>
                              {/*<Button theme={"btn--primary"} onClick={() => handleOpenAgent()}>Create Agent</Button> */}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-xl-4">
                      <div className="section">
                        <div className="panel panel--loose panel--raised base-margin-bottom">
                          <h4 className="subtitle text-bold">Average Applies Per Month</h4>
                        </div>
                      </div>
                    </div>
                    <div className="col-xl-4">
                      <div className="section">
                        <div className="panel panel--loose panel--raised base-margin-bottom">
                          <h4 className="subtitle text-bold">Active Agents</h4>
                        </div>
                      </div>
                    </div>
                    <div className="panel panel--loose panel--raised base-margin-bottom">
                      <h2 className="subtitle">Organization X</h2>
                      <div className="section">
                        <button className="btn btn--primary">Primary</button>
                        <button className="btn btn--primary">Primary 1</button>
                        <button className="btn btn--primary">Primary 2</button>
                      </div>
                    </div>

                  </div>
                </div>

            </div>
          </div>
        </div>
      </header>
    </div>
  );
}

export default Dashboard;
