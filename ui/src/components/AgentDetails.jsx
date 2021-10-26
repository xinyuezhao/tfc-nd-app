import React from "react";
import { SecondarySidebar, Card, Icon } from "blueprint-react";

function AgentDetails(props) {
  const {
    secondarySidebarData,
    handleOpenAgent,
    openSidebar,
    setOpenSidebar,
  } = props;

  const agentCardContent = (
    <div>
      <Card
        key="ss-card-1"
        uid="ss-card-1"
        collapsible={true}
        bordered={false}
        headerContent={{
          title: <b>Agent Details</b>,
        }}
        className="pt-10"
      >
        <div className="row mt-10">
          <div className="col-5">Agent Name:</div>
          <div className="col-6">{secondarySidebarData.name}</div>
        </div>
        <div className="row mt-11">
          <div className="col-7">Agent Pool:</div>
          <div className="col-8">{secondarySidebarData.agent_pool}</div>
        </div>
        <div className="row mt-12">
          <div className="col-9">Organization:</div>
          <div className="col-10">{secondarySidebarData.organization}</div>
        </div>

      </Card>
      <Card
        key="ss-card-3"
        uid="ss-card-3"
        collapsible={true}
        bordered={false}
        headerContent={{
          title: <b>Create Details</b>,
        }}
        className="pt-10"
      >
        <div className="row mt-10">
          <div className="col-5">Created:</div>
          <div className="col-6">{secondarySidebarData.sys_created_on}</div>
        </div>
        <div className="row mt-10">
          <div className="col-5">Created By:</div>
          <div className="col-6">{secondarySidebarData.sys_created_by}</div>
        </div>
        {secondarySidebarData?.caller_id?.display_value && (
          <div className="row mt-10">
            <div className="col-5">Caller:</div>
            <div className="col-6">
              {secondarySidebarData?.caller_id?.display_value}
            </div>
          </div>
        )}
        {secondarySidebarData.category && (
          <div className="row mt-10">
            <div className="col-5">Category:</div>
            <div className="col-6">{secondarySidebarData.category}</div>
          </div>
        )}
        {secondarySidebarData?.assignment_group?.display_value && (
          <div className="row mt-10">
            <div className="col-5">Assignment group:</div>
            <div className="col-6">
              {secondarySidebarData?.assignment_group?.display_value}
            </div>
          </div>
        )}
        {secondarySidebarData?.assigned_to?.display_value && (
          <div className="row mt-10">
            <div className="col-5">Assign to:</div>
            <div className="col-6">
              {secondarySidebarData?.assigned_to?.display_value}
            </div>
          </div>
        )}
      </Card>
    </div>
  );

  return (
    <div>
      <SecondarySidebar
        key="ss-0a"
        opened={openSidebar}
        headerContent={{
          icon: (
            <Icon
              key="icon-0"
              type={Icon.TYPE.CHECK_OUTLINE}
              size={Icon.SIZE.MEDIUM_SMALL}
              style={{ color: "#6ebe4a" }}
            />
          ),
          title: "Agents",
          subtitle: "Agent Details",
        }}
        closable={true}
        onChange={(sidebarState) => {
          sidebarState === "secondary-sidebar__opened"
            ? setOpenSidebar(true)
            : setOpenSidebar(false);
        }}
        tools={[
          <Icon
            key="icon-2"
            type={Icon.TYPE.JUMP_OUT}
            onClick={() => handleOpenAgent(secondarySidebarData)}
          />,
        ]}
      >
        {agentCardContent}
      </SecondarySidebar>
    </div>
  );
}

export default AgentDetails;
