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
  IconButton,
  SecondarySidebar,
  Card
} from "blueprint-react";
import {
  fetchAgents,
  deleteAgents,
  createAgents,
  fetchUserToken,
} from "../service/api_service";
import Agent from "./CreateAgent";
import AgentWoToken from "./CreateAgentWoToken";
import { checkForTernary, checkComponentRender } from "../shared/utils";
import { pathPrefix } from "../App";
import emptyImage from "blueprint-react/assets/images/empty-raining.svg";
import { Link } from "react-router-dom";

const stopClick = (e) => {
  e.stopPropagation();
  e.preventDefault();
  return false;
};

function AgentTable(props) {

  const allColumns = [
    {
      id: "Status",
      Header: "Status",
      accessor: "status",
      sortable: true,
      align: "center",
      tooltips: true,
      // Cell: (row) => {<SmartHealthBadgeIconWrapper value={row.value} showLabel={true}/>}
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
              const {original} = row;
              console.log(`Delete Item`, original.id, original.description)
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
  const [viewAgent, setViewAgent] = useState({});
  const [warningAlert, setWarningAlert] = useState("");
  const [infoAlert, setInfoAlert] = useState("");
  const [successAlert, setSuccessAlert] = useState("");
  const [openSidebar, setOpenSidebar] = useState(false);
  // const [filterRemove, setfilterRemove] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(
    checkForTernary(
      localStorage.getItem("per_page_value"),
      parseInt(localStorage.getItem("per_page_value")),
      10
    )
  );
  const [userToken, setUserToken] = useState(false);

  const offset = useRef({ value: 0 });
  const limit = useRef({ value: 50 });
  const finalAgent = useRef({ totalAgents: agents });

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
      //const flag = removeFilter ? true : flase

      // const queryParam = removefilter
      //   ? props.history.location?.state?.queryParam
      //     ? props.history.location?.state?.queryParam
      //     : ""
      //   : "";

      // setfilterRemove(!!!queryParam);
      setFetchingData(setLoading === false ? false : true);
      console.log("INSIDE GET AGENTSSS.....")
      fetchAgents(
        pageSizeLimit ? pageSizeLimit : limit.current.value,
        offset.current.value,
        // queryParam
      )
      .then((res) => {
        setAgents(res.data);
        console.log("GET agents API Response: ", res.data)
        setFetchingData(false);
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          props.history.push({
            pathname: pathPrefix + "/login",
            state: { sessionExpired: true },
          });
        } else {
          err.response?.data?.detail?.message &&
            setWarningAlert(err.response.data?.detail?.message);
          setFetchingData(false);
        }
      });
    },
    [props.history]
  );
  useEffect(getAgents, [getAgents]);

  function openDeleteConfirm() {
    setShowConfirm(true);
  }

  function deleteAgent() {
    setShowConfirm(false);
    setInfoAlert("Deleting Agents");
    const description = selectedAgents.map(
      (agentsData) => agentsData.description
    );
    console.log("DELETE description", description);
    deleteAgents(description)
      .then(() => {
        setSuccessAlert("Deleted Agents Successfully");
        getAgents();
      })
      .catch((error) => {
        console.log(error);
      });
  }


  const handleCreateAgent = useCallback((payload) => {
    console.log("start create agent");
    setInfoAlert("Creating Agent");
    createAgents(payload)
      .then((res) => {
        setInfoAlert("");
        setSuccessAlert("Created Agent Successfully");
        console.log("agent data = ", agents )
        console.log("Agent creation DONE. data = ", res.data )
        getAgents();
      })
      .catch((error) => {
        console.log(error);
        setInfoAlert("");
        setSuccessAlert("");
        error.response?.data?.detail?.detail &&
          setWarningAlert(error.response?.data?.detail?.detail);
      });
  });

  const handleUserToken = useCallback(() => {
    console.log("start create agent");
    setInfoAlert("Creating Agent");
    // get access token use api
    fetchUserToken()
      .then((res) => {
        setInfoAlert("");
        setSuccessAlert("User Token is accessed Successfully");
        console.log("User Token is  = ", res.data )
        getAgents();
      })
      .catch((error) => {
        console.log(error);
        setInfoAlert("");
        setSuccessAlert("");
        error.response?.data?.detail?.detail &&
          setWarningAlert(error.response?.data?.detail?.detail);
      });
  });

  const handleOpenAgent = useCallback(
    (data) => {
      console.log("handle open agent");
      if(userToken){
        const title = `${data ? "Update" : "Create"} Agent`;
        action.openScreen(Agent, {
          title: title,
          screenId: "create-agent-modal",
          agent: data,
          createAgent: handleCreateAgent,
        });
      } else {
        const title = `${data ? "Update" : "Create"} Agent`;
        action.openScreen(AgentWoToken, {
          title: title,
          screenId: "create-agent-modal",
          agent: data,
          createAgent: handleCreateAgent,
        });
      }
    },
    [
      action,
      handleCreateAgent,
      userToken,
    ]
  );

  const handleSidebar = useCallback(
    (data) => {
      console.log("handle view agent", data);
      setViewAgent(data);
      setOpenSidebar(!openSidebar);
    }
  );

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
  console.log("TableData = ", TableData);

  const headerContent1 = {
    title: "Agent", subtitle: `${viewAgent.name}`,
  }


  return (
    <div className="background-container">

    {checkComponentRender(
        openSidebar,
        <SecondarySidebar
          closable={true}
          key="sidebar-key"
          opened={openSidebar}
          headerContent={headerContent1}
          footerContent={<div style={{textAlign: 'center'}}>Footer content</div>}
        >
        <Card>
          <h3 style={{ textAlign:"center"}}>{`${viewAgent.status}`}</h3>
        </Card>
        <div class="title" style={{ paddingTop: "25px", fontWeight: "bold" }}>General</div>
          {/* ========================================== */}
          <div style={{ paddingTop: "30px", color: "gray" }}>Description</div>
          <div>{`${viewAgent.description}`}</div>
          {/* ========================================== */}
          <div style={{ paddingTop: "30px", color: "gray" }}>Organization</div>
          <div>{`${viewAgent.organization}`}</div>
          {/* ========================================== */}
          <div style={{ paddingTop: "30px", color: "gray" }}>Agent Pool</div>
          <div>{`${viewAgent.agentpool}`}</div>
          {/* ========================================== */}
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
          data === "component-modal-apply-button" && deleteAgent();
        }}
      >
        {`Are you sure want to delete agent(s) ${selectedAgents.map(
          (items) => items.description
        )}?`}
      </Modal>
    )}

      <div className="row">
        <div className="col-xl-12">
          <div  style={{ paddingTop: "30px", paddingBottom: "15px", display: "flex", justifyContent: "space-between" }}>
            <h2 style={{ fontWeight: "350" }}>Agents</h2>
            <a href="/">
              <span className="icon-refresh"
                style={{ color: "white", borderRadius: "50%", background: "gray", textAlign: "center", lineHeight:"30px", height:"30px", width:"30px", marginRight:"20px"}}>
              </span>
            </a>
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
            <div align="center">
              <img src={emptyImage} alt="empty" width="15%" height="15%"/>
              <h4 align="center">No results found</h4>
              <p align="center">Create a new Agent</p>
              <Button theme={"btn--primary"} onClick={() => handleOpenAgent()}>Create Agent</Button>
            </div>
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
            console.table("getSelected args %O: ", agentsData);
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
