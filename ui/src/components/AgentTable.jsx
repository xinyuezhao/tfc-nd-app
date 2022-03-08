import React, { useState, useEffect, useCallback, useRef } from "react";
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
import { pathPrefix } from "../App";
import emptyImage from "blueprint-react/assets/images/empty-raining.svg";

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
    created: <span className="status-tile-icon text-info icon-add-outline"></span>,
    enabling: <span className="status-tile-icon text-warning-alt icon-animation"></span>,
    errored: <span className="status-tile-icon text-danger icon-error-outline"></span>,
    exited: <span className="status-tile-icon text-dkgray-4 icon-leave-meeting" ></span>,
    idle: <span className="status-tile-icon text-success icon-clock"></span>,
    busy: <span className="status-tile-icon text-darkgreen  icon-diagnostics" ></span>,
    unknown: <span className="status-tile-icon text-warning icon-exclamation-triangle"></span>,
    failed: <span className="status-tile-icon text-danger icon-error-outline"></span>,
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
          <label className="status-tile-text" style={{marginLeft: "5px", paddingTop: "2px"}}>{`${row.value}`}</label>
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
  const [agents, setAgents] = useState([]);
  const [viewSecondarySidebarData, setViewSecondarySidebarData] = useState({});
  const [warningAlert, setWarningAlert] = useState("");
  const [infoAlert, setInfoAlert] = useState("");
  const [successAlert, setSuccessAlert] = useState("");
  const [openSecondarySidebar, setOpenSecondarySidebar] = useState(false);
  // const [filterRemove, setfilterRemove] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
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
    (setLoading, pageSizeLimit, removefilter = true) => {
      setFetchingData(setLoading === false ? false : true);
      fetchAgents()
      .then((res) => {
        setAgents(res.data);
        setFetchingData(false);
      })
      .catch((err) => {
          err.response?.data?.detail?.message &&
            setWarningAlert(err.response.data?.detail?.message);
          setFetchingData(false);
      });
    },
    []
  );
  useEffect(getAgents, [getAgents]);

  function openDeleteConfirm() {
    setShowConfirm(true);
  }

  function handleDeleteAgent() {
    setShowConfirm(false);
    setInfoAlert("Deleting Agents");
    Promise.all(selectedAgents.map(
      (agentsData) => deleteAgent(agentsData.name)
    )).then(() => {
        setSuccessAlert("Deleted Agents Successfully");
        getAgents();
      })
      .catch((error) => {
        console.log(error);
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
        console.log(error);
        setInfoAlert("");
        setSuccessAlert("");
        error.response?.data?.detail?.detail &&
          setWarningAlert(error.response?.data?.detail?.detail);
      });
  },[getAgents]);

  const handleOpenAgent = useCallback(
    (data) => {
      console.log("INFO: User token exists: ", authConfig.tokenExist);
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

  const handleSidebar = useCallback(
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

  const TableData = _.orderBy(
    agents
  ).map((item) => {
    return {id: item.meta.id, ...item.spec}
  });

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
          footerContent={<div style={{textAlign: 'center'}}>Footer content</div>}
        >
        <Card>
          <h3 style={{ textAlign:"center"}}>
            {statuses[`${viewSecondarySidebarData.status}`.toLowerCase()]} {`${viewSecondarySidebarData.status}`}
          </h3>
        </Card>
        <div className="title" style={{ paddingTop: "25px", fontWeight: "bold" }}>General</div>
          <div style={{ paddingTop: "30px", color: "gray" }}>Description</div>
          <div>{`${viewSecondarySidebarData.description}`}</div>
          <div style={{ paddingTop: "30px", color: "gray" }}>Organization</div>
          <div>{`${viewSecondarySidebarData.organization}`}</div>
          <div style={{ paddingTop: "30px", color: "gray" }}>Agent Pool</div>
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
          data === "component-modal-apply-button" && handleDeleteAgent();
        }}
      >
        {`Are you sure want to delete agent(s) ${selectedAgents.map(
          (items) => ' ' + items.name
        )} ?`}
      </Modal>
    )}

      <div className="row">
        <div className="col-xl-12">
          <div  style={{ paddingTop: "30px", paddingBottom: "15px", display: "flex", justifyContent: "space-between" }}>
            <h2 style={{ fontWeight: "350" }}>Agents</h2>
            <div>
              <IconButton className=""
                size={IconButton.SIZE.SMALL}
                icon={IconButton.ICON.REFRESH}
                onClick={getAgents}
                style={{ marginRight:"20px"}}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="filter-table" style={{ backgroundColor: "white", padding: "20px" }}>
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
            {agents?
              <div className="screen flex-center dbl-padding-top">
                <Loader theme={Loader.THEME.LIGHT_GRAY} />
              </div>
              :
              <div align="center">
                <img src={emptyImage} alt="empty" width="15%" height="15%"/>
                <h4 align="center">No results found</h4>
                <p align="center">Create a new Agent</p>
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
          onPageChange={(pageNumber) => {
            setCurrentPage(pageNumber + 1);
          }}
          onRowClick={handleSidebar}
          getSelected={(agentsData) => {
            console.table("Agents selected for deletion: ", agentsData);
            agentsData &&
              agentsData?.selections &&
              setSelectedAgents(agentsData.selections);
          }} // *** get which item is selected
          total={parseInt(TableData.length)}
          showPageJump={true}
          onPageSizeChange={(data) => setPageSize(data)}
          pageSize={checkForTernary(pageSize, pageSize, 10)}
        />}
      </div>
    </div>
  );
}

export default AgentTable;
