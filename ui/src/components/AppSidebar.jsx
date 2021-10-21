import React from "react";
import { Sidebar, IconConstants } from "blueprint-react";
import { pathPrefix } from "../App";

function AppSidebar() {
  const sidebarItems = [
    {
      id: "Dashboard",
      path: `${pathPrefix}/dashboard`,
      title: "Overview",
      icon: IconConstants.LAYERS,
    },
    {
      id: "Agents",
      path: `${pathPrefix}/home`,
      title: "Agents",
      icon: IconConstants.PLUGIN,
    },
    {
      id: "Test Table",
      path: `${pathPrefix}/testtable`,
      title: "TestTable",
      icon: IconConstants.PLUGIN,
    },
  ];

  return (
    <>
      <Sidebar
        theme={Sidebar.THEMES.INDIGO}
        title="Terraform Cloud"
        expanded={true}
        locked={true}
        items={sidebarItems}
      />
    </>
  );
}

export default AppSidebar;
