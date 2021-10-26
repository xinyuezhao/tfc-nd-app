import React from "react";
import _ from "lodash";

function Dashboard(props) {

  return (
    <div className="background-container">
      <header
        class="header header--compressed"
        style={{ background: "transparent" }}
      >
        <div class="header-bar container" style={{ paddingLeft: "0px" }}>
          <div class="header-bar__main" style={{ marginLeft: "0px" }}>
            <div class="section">
              <h2 class="page-title" style={{ fontWeight: "350" }}>
                Overview
              </h2>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}

export default Dashboard;
