import React, { useState, useEffect, useCallback} from "react";
import _ from "lodash";
import {
  FilterableTable,
  Modal,
  useScreenActions,
  Button,
  Dropdown,
  Icon,
  StructuredFilter,
  LABELS,
  IconConstants,
  SecondarySidebar,
  Card,
  IconButton,
  Loader
} from "blueprint-react";
import {
  fetchAgents,
  deleteAgent,
  createAgent,
} from "../service/api_service";
import Agent from "./CreateAgent";
import AgentWoToken from "./CreateAgentWoToken";
import { checkForTernary, checkComponentRender } from "../shared/utils";
import emptyImage from "blueprint-react/assets/images/empty-raining.svg";

/**
 * AgentTable Token component displays all the agents created by the user.
 * If there is no existing agents for the user, then it displays create agent button instead of the table.
 * The filter table at top helps the user to filter the agents based on the conditions.
 * The table contains Status, organization, Agent pool and Description of the agent created.
 */

const stopClick = (e) => {
  e.stopPropagation();
  e.preventDefault();
  return false;
};

function AgentTable(props) {
  const {
    authConfig,
  } = props;

  const statuses = {
    running: <span className="status-tile-icon text-success icon-check-outline" ></span>,
    creating: <span className="status-tile-icon text-info icon-add-outline"></span>,
    initializing: <span className="status-tile-icon text-initialize icon-spinner"></span>,
    enabling: <span className="status-tile-icon text-warning-alt icon-animation"></span>,
    errored: <span className="status-tile-icon text-danger icon-error-outline"></span>,
    exited: <span className="status-tile-icon text-dkgray-4 icon-leave-meeting" ></span>,
    idle: <span className="status-tile-icon text-idle icon-clock"></span>,
    busy: <span className="status-tile-icon text-darkgreen  icon-diagnostics" ></span>,
    unknown: <span className="status-tile-icon text-warning icon-exclamation-triangle"></span>,
    failed: <span className="status-tile-icon text-failed icon-error-outline"></span>,
  }

  const allColumns = [
    {
      id: "Status",
      Header: "Status",
      accessor: "status",
      sortable: true,
      align: "center",
      tooltips: true,
      Cell: (row) => {
        return (
        <div className="StatusTile">
          {statuses[row.value.toLowerCase()]}
          <label className="status-tile-text qtr-margin-left">{`${row.value}`}</label>
        </div>
      )},
    },
    {
      id: "Agent Name",
      Header: "Agent Name",
      sortable: true,
      accessor: "name",
      align: "center",
      tooltips: true,
    },
    {
      id: "Agent Pool",
      Header: "Agent pool",
      accessor: "agentpool",
      sortable: true,
      align: "center",
      tooltips: true,
    },
    {
      id: "Organization",
      Header: "Organization",
      accessor: "organization",
      sortable: true,
      align: "center",
      tooltips: true,
    },
    {
      id: "Description",
      Header: "Description",
      sortable: true,
      accessor: "description",
      align: "center",
      tooltips: true,
    },
    {
      Header: '',
      width: 75,
      icon: IconConstants.COG,
      Cell: (row) => {

        const menuOptions = [
          {
            label: "Delete",
            action: () => {
              setSelectedAgents([row.original]);
              openDeleteConfirm();
            }
          },
        ];

        return (
          <div id={row.dn} onClick={stopClick}>
            <Dropdown
              type={Dropdown.TYPE.ICON}
              icon={Icon.TYPE.MORE}
              size={Icon.SIZE.SMALL}
              items={menuOptions}
              key={"dropdown-tool-key-2"}/>
          </div>
        )
      },
    },
  ];

  const action = useScreenActions();

  const [selectedAgents, setSelectedAgents] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const [agents, setAgents] = useState(null);
  const [viewSecondarySidebarData, setViewSecondarySidebarData] = useState({});
  const [warningAlert, setWarningAlert] = useState("");
  const [infoAlert, setInfoAlert] = useState("");
  const [successAlert, setSuccessAlert] = useState("");
  const [openSecondarySidebar, setOpenSecondarySidebar] = useState(false);
  const [pageSize, setPageSize] = useState(
    checkForTernary(
      localStorage.getItem("per_page_value"),
      parseInt(localStorage.getItem("per_page_value")),
      10
    )
  );

  useEffect(() => {
    if (warningAlert || successAlert) {
      setTimeout(() => {
        setWarningAlert("");
        setSuccessAlert("");
      }, 5000);
    }
  }, [warningAlert, successAlert]);

  const getAgents = useCallback(
    (setLoading) => {
      setFetchingData(setLoading === false ? false : true);
      fetchAgents()
      .then((res) => {
        setAgents(res.data);
        setFetchingData(false);
        console.info("Fetch agent(s) from backend agent service.")
      })
      .catch((error) => {
        console.error("Failed to fetch agent(s) from backend agent service.", error);
        error.response?.data?.detail?.message &&
          setWarningAlert(error.response.data?.detail?.message);
        setFetchingData(false);
      });
    },
    []
  );
  useEffect(getAgents, [getAgents]);

  function openDeleteConfirm() {
    setShowConfirm(true);
  }

  function handleDeleteAgents() {
    setShowConfirm(false);
    setInfoAlert("Deleting Agents");
    Promise.all(selectedAgents.map(
      (agentsData) => deleteAgent(agentsData.name)
    )).then(() => {
        setSuccessAlert("Deleted Agent(s) Successfully");
        getAgents();
      })
      .catch((error) => {
        console.error("Failed to delete the agent(s).", error);
        setInfoAlert("");
        setSuccessAlert("");
        error.response?.data?.detail?.detail &&
          setWarningAlert(error.response?.data?.detail?.detail);
      });
  }

  const handleCreateAgent = useCallback((payload) => {
    setInfoAlert("Creating Agent");
    createAgent(payload)
      .then((res) => {
        setInfoAlert("");
        setSuccessAlert("Created Agent Successfully", res);
        getAgents();
      })
      .catch((error) => {
        console.error("Failed to create agent.", error);
        setInfoAlert("");
        setSuccessAlert("");
        error.response?.data?.detail?.detail &&
          setWarningAlert(error.response?.data?.detail?.detail);
      });
  },[getAgents]);

  const handleOpenAgent = useCallback(
    (data) => {
      console.info("Verifying the user token: ", authConfig.tokenExist);
      let agentComponent = AgentWoToken;
      if(authConfig.tokenExist){
        agentComponent = Agent;
      }
      const title = `${data ? "Update" : "Create"} Agent`;
      action.openScreen(agentComponent, {
        title: title,
        screenId: "create-agent-modal",
        agent: data,
        createAgent: handleCreateAgent,
      });
    },
    [
      action,
      handleCreateAgent,
      authConfig,
    ]
  );

  const handleSecondarySidebar = useCallback(
    (data) => {
      setViewSecondarySidebarData(data); //setViewSecondarySidebarData-> setSecondarySidebarData
      setOpenSecondarySidebar(!openSecondarySidebar);
    }, [openSecondarySidebar]);

  const menuItems = [
    {
      label: "Create Agent",
      action: () => handleOpenAgent(),
    },
    {
      label: "Delete Agent(s)",
      action: () => openDeleteConfirm(),
      disabled: !selectedAgents.length,
    },
  ];

  const TableData = _.orderBy(agents).map((item) => {return {id: item.meta.id, ...item.spec}});

  const secondarySidebarHeaderContent = {
    title: "Agent", subtitle: `${viewSecondarySidebarData.name}`,
  }

  return (
    <div className="background-container">
      {checkComponentRender(
          openSecondarySidebar,
          <SecondarySidebar
            closable={true}
            key="sidebar-key"
            opened={openSecondarySidebar}
            headerContent={secondarySidebarHeaderContent}
          >
          <Card>
            <h2 className="text-center base-padding-bottom">
              {statuses[`${viewSecondarySidebarData.status}`.toLowerCase()]} {`${viewSecondarySidebarData.status}`}
            </h2>
          </Card>
          <div className="title text-bold dbl-padding-top text-large">General</div>
            <div className="secondary-sidebar-subtitles text-large qtr-padding-bottom">Description</div>
            <div>{`${viewSecondarySidebarData.description}`}</div>
            <div className="secondary-sidebar-subtitles text-large qtr-padding-bottom">Organization</div>
            <div>{`${viewSecondarySidebarData.organization}`}</div>
            <div className="secondary-sidebar-subtitles text-large qtr-padding-bottom">Agent Pool</div>
            <div>{`${viewSecondarySidebarData.agentpool}`}</div>
          </SecondarySidebar>
        )}

      {checkComponentRender(
        showConfirm,
        <Modal
          title={`Delete ${selectedAgents.length} agent(s)`}
          isOpen={showConfirm}
          applyButtonLabel="Delete"
          contentTextAlign={Modal.CONTENT_TEXT_ALIGN.LEFT}
          onClose={() => {
            setShowConfirm(false);
          }}
          onAction={(data) => {
            data === "component-modal-apply-button" && handleDeleteAgents();
          }}
        >
          {`Are you sure want to delete the agent(s) ${selectedAgents.map(
            (items) => ' ' + items.name
          )} ?`}
        </Modal>
      )}

      <div className="row">
        <div className="col-xl-12">
          <div className="base-padding-left base-padding-right base-padding-top flex justify-content-sm-between">
            <h1 className="page-title ">Agents</h1>
            <div>
              <IconButton
                size={IconButton.SIZE.SMALL}
                icon={IconButton.ICON.REFRESH}
                onClick={getAgents}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="filter-table base-padding bg-color-white">
        {TableData.length === 0 ?
          <div className="no-data-container">
            <div className="filterable-table">
              <header>
              <span />
                <StructuredFilter placeholder={LABELS.searchAndFilterPlaceholder}/>
                <span className="header--tools">
                <Dropdown
                  key={"dropdown-tool-key-2"}
                  preferredPlacements={["bottom"]}
                  type={Dropdown.TYPE.BUTTON}
                  size={Button.SIZE.SMALL}
                  label="Actions"
                  theme={"btn--primary-ghost"}
                  items={menuItems}
                />
                </span>
              </header>
            </div>
            { agents === null ?
              <div className="screen flex-center dbl-padding-top">
                <Loader theme={Loader.THEME.LIGHT_GRAY} />
              </div>
              :
              <div align="center">
                <img src={emptyImage} alt="empty" width="205px" />
                <h4>No results found</h4>
                <p>Create a new Agent</p>
                <Button theme={"btn--primary"} onClick={() => handleOpenAgent()}>Create Agent</Button>
              </div>
            }
          </div>
          : <FilterableTable
          loading={fetchingData}
          tools={[
            <Dropdown
              key={"dropdown-tool-key-2"}
              preferredPlacements={["bottom"]}
              type={Dropdown.TYPE.BUTTON}
              size={Button.SIZE.SMALL}
              label="Actions"
              theme={"btn--primary-ghost"}
              items={menuItems}
            />,
          ]}
          data={TableData}
          keyField="id" // *** this is for the checkbox to appear.
          columns={allColumns}
          selectable={true}
          onRowClick={handleSecondarySidebar}
          getSelected={(agentsData) => {
            console.table("Agents selected for deletion: ", agentsData);
            agentsData &&
              agentsData?.selections &&
              setSelectedAgents(agentsData.selections);
          }} // *** get which item is selected
          total={parseInt(TableData.length)}
          showPageJump={true}
          onPageSizeChange={(data) => {
            setPageSize(data);
            localStorage.setItem("per_page_value", data);
          }}
          pageSize={checkForTernary(pageSize, pageSize, 10)}
        />}
      </div>
    </div>
  );
}

export default AgentTable;
