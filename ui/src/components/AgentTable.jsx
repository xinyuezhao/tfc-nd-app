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
  IconConstants
} from "blueprint-react";
import {
  fetchAgents,
  deleteAgents,
  createAgents,
} from "../service/api_service";
import Agent from "./CreateAgent";
import AgentWoToken from "./CreateAgentWoToken";
import { checkForTernary, checkComponentRender } from "../shared/utils";
import { pathPrefix } from "../App";
// import {emptyImage} from "blueprint-react/assets/images/empty-raining.svg";
import { Link } from "react-router-dom";

function AgentTable(props) {
  const menuOptions = [
    {
      id: "Delete Agent",
      Header: "Delete Agent",
      accessor: "Delete Agent",
      align: "center",
      tooltips: true,
    },
  ];
  const allColumns = [
    {
      id: "Status",
      Header: "Status",
      accessor: "status",
      sortable: true,
      align: "center",
      tooltips: true,
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
      Header: 'options',
      width: 300,
      Cell: (row) => (
          <Dropdown row={row} type={Dropdown.TYPE.ICON} icon={Icon.TYPE.MORE} size={Icon.SIZE.SMALL} items={menuOptions}
          key={"dropdown-tool-key-2"}/>
      ),
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
  }, []);


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

  const handleViewAgent = useCallback(
    (data) => {
      console.log("handle view agent", data.name);
      setViewAgent(data);
      const title = `Agent ${data.name}`;
      action.openScreen(
        {
        title: title,
        screenId: "abc",
        viewAgent,
        agent: data,
        close: () => {
          setOpenSidebar(false);
        },
        createAgent: handleCreateAgent,
      });
    },
    [
      action,
      viewAgent,
      handleCreateAgent,
    ]
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



  return (
    <div className="background-container">

    {checkComponentRender(
      showConfirm,
      <Modal
        title={`Delete ${selectedAgents.length} agents`}
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
                style={{ color: "white", borderRadius: "50%", background: "gray", textAlign: "center", lineHeight:"30px", height:"30px", width:"30px"}}>
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
              {/* <img src={emptyImage} alt="empty"></img> */}
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
          onRowClick={handleViewAgent}
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
