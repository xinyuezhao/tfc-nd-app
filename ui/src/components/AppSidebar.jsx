import React from "react";
import { Sidebar, Icon } from "blueprint-react";
import { pathPrefix } from "../App";

function AppSidebar() {
  const sidebarItems = [
    {
      id: "Dashboard",
      path: `${pathPrefix}/dashboard`,
      title: "Overview",
      icon: Icon.TYPE.LAYERS,
    },
    {
      id: "Agents",
      path: `${pathPrefix}/home`,
      title: "Agents",
      icon: Icon.TYPE.PARTICIPANT_LIST,
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
      title="Connector for Terraform"
      expanded={true}
      locked={true}
      compressed={false}
      items={sidebarItems}
    />
  );
}

export default AppSidebar;
