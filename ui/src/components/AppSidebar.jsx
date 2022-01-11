import React from "react";
import { Sidebar, Icon } from "blueprint-react";
import { pathPrefix } from "../App";

function AppSidebar() {
  const sidebarItems = [
    // {
    //   id: "Dashboard",
    //   path: `${pathPrefix}/dashboard`,
    //   title: "Overview",
    //   icon: IconConstants.LAYERS,
    // },
    {
      id: "Agents",
      path: `${pathPrefix}/home`,
      title: "Agents",
      icon: Icon.TYPE.PARTICIPANT_LIST,
      // icon-participant-list
    },
    // {
    //   id: "Auth",
    //   path: `${pathPrefix}/auth`,
    //   title: "Auth",
    //   icon: IconConstants.COG,
    // },
  ];

  return (
      <Sidebar
        theme={Sidebar.THEMES.INDIGO}
        title="Terraform Cloud"
        expanded={true}
        locked={true}
        items={sidebarItems}
      />
  );
}

export default AppSidebar;
