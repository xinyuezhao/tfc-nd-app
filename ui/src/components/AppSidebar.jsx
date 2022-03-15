import React from "react";
import { Sidebar, Icon } from "blueprint-react";
import { pathPrefix } from "../App";

/**
 * AppSidebar Token component is the sidebar on the Left with two options .
 * Dashboard -> It redirects the user to Overview page (Dashboard component).
 * Agents -> It redirects the user to Agent Table  (AgentTable Component).
 */

function AppSidebar() {
  const sidebarItems = [
    {
      id: "Dashboard",
      path: `${pathPrefix}/`,
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
