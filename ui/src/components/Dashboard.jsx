import React from "react";

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
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}

export default Dashboard;
