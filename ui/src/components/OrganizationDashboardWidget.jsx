import React from "react";
import {  Avatar, BasePalette } from "blueprint-react";

function OrganizationDashboardWidget(props) {
  const {
    name,
    activeAgents,
    concurrencyLimitReached,
    averageAppliesPerMonth,
    adminUserCount,
    maxConcurrencyLimitReached,
    maxAverageAppliesPerMonth,
    maxAdminUserCount,
    maxActiveAgents,
  } = props;


  return (
    <div className="panel panel--loose base-margin-bottom">
			<div className="row">
				<div className="row half-margin-left">
					<Avatar
						key="org-dashboard-widget"
						size={Avatar.SIZE.MEDIUM}
						backgroundColor={BasePalette.White}
						color={BasePalette.DarkGray2}
						borderColor={BasePalette.MedGray2}
						content={"O"}
					/>
					<h4 className="qtr-padding-top half-padding-left">{name}</h4>
				</div>
					<div className="row max-width rc-calendar-week-number-cell">
						<div className="col-3 ">
							<div className="scoreboard__subtitle">Active Agents ({maxActiveAgents})</div>
							<div className="scoreboard__title">{activeAgents}</div>
						</div>
						<div className="col-3">
							<div className="scoreboard__subtitle">Concurrent Run Limit ({maxConcurrencyLimitReached})</div>
							<div className="scoreboard__title">{concurrencyLimitReached}</div>
						</div>
						<div className="col-3">
							<div className="scoreboard__subtitle">Average Applies Per Month ({maxAverageAppliesPerMonth})</div>
							<div className="scoreboard__title">{averageAppliesPerMonth}</div>
						</div>
						<div className="col-3">
							<div className="scoreboard__subtitle">Active Admin Users ({maxAdminUserCount})</div>
							<div className="scoreboard__title">{adminUserCount}</div>
						</div>
					</div>
			</div>
    </div>
  );
}

export default OrganizationDashboardWidget;
