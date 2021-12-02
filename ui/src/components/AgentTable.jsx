import React, { useState, useEffect, useCallback, useRef } from "react";
import _ from "lodash";
import {
  FilterableTable,
  Modal,
  useScreenActions,
  Button,
  Dropdown,
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

function AgentTable(props) {
  const allColumns = [
    {
      id: "Agent Name",
      Header: "Agent Name",
      sortable: true,
      accessor: "name",
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
      id: "Status",
      Header: "Status",
      accessor: "status",
      sortable: true,
      align: "center",
      tooltips: true,
    },
  ];

  const action = useScreenActions();

  const [selectedAgents, setSelectedAgents] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  // const [fetchingData, setFetchingData] = useState(false);
  const [agents, setAgents] = useState([]);
  // const [viewAgent, setViewAgent] = useState({});
  const [warningAlert, setWarningAlert] = useState("");
  const [infoAlert, setInfoAlert] = useState("");
  const [successAlert, setSuccessAlert] = useState("");
  // const [openSidebar, setOpenSidebar] = useState(false);
  // const [filterRemove, setfilterRemove] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(
    checkForTernary(
      localStorage.getItem("per_page_value"),
      parseInt(localStorage.getItem("per_page_value")),
      10
    )
  );
  const [agentToken, setAgentToken] = useState(true);

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

      const queryParam = removefilter
        ? props.history.location?.state?.queryParam
          ? props.history.location?.state?.queryParam
          : ""
        : "";

      // setfilterRemove(!!!queryParam);
      // setFetchingData(setLoading === false ? false : true);
      console.log("INSIDE GET AGENTSSS.....")
      fetchAgents(
        pageSizeLimit ? pageSizeLimit : limit.current.value,
        offset.current.value,
        queryParam
      )
      .then((res) => {
        setAgents(res.data);
        console.log("GET agents API Response: ", res.data)
        // setFetchingData(false);
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
          // setFetchingData(false);
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
  // use same function as build table on first time.
  // delete and and refresh (GET->UPDATE STATE)

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
      if(agentToken){
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
      agentToken,
    ]
  );

  // const handleViewAgent = useCallback(
  //   (data) => {
  //     console.log("handle view agent");
  //     setViewAgent(data);
  //     const title = `Agent ${data.number}`;
  //     action.openScreen(
  //       {
  //       title: title,
  //       screenId: `agent-display-view-${data && data.number}`,
  //       viewAgent,
  //       agent: data,
  //       close: () => {
  //         setOpenSidebar(false);
  //       },
  //       createAgent: handleCreateAgent,
  //     });
  //   },
  //   [
  //     action,
  //     viewAgent,
  //     handleCreateAgent,
  //   ]
  // );

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
  ).map((item) => (item.spec));
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
          <div className="section">
            <h2 style={{ fontWeight: "350" }}>Agents</h2>
          </div>
        </div>
      </div>
      <div className="filter-table">
        <FilterableTable
          // loading={fetchingData}
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
          // itemKey="id"
          // id="id"
          // key={"agent_table"}
          columns={allColumns}
          selectable={true}
          onPageChange={(pageNumber) => {
            setCurrentPage(pageNumber + 1);
          }}
          // onRowDoubleClick={handleViewAgent}
          getSelected={(agentsData) => {
            console.table("getSelected args %O: ", agentsData);
            agentsData &&
              agentsData?.selections &&
              setSelectedAgents(agentsData.selections);
          }} // *** get which item is selected
          // total={parseInt(TableData.length)}
          // showPageJump={true}
          // onPageSizeChange={(data) => setPageSize(data)}
          // pageSize={checkForTernary(pageSize, pageSize, 10)}
        />
      </div>
    </div>
  );
}

export default AgentTable;
