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
      path: `${pathPrefix}/agents`,
      title: "Agents",
      icon: Icon.TYPE.PARTICIPANT_LIST,
    },
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
