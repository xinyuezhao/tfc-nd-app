import React, { useState, useEffect, useCallback, useRef } from "react";
import _ from "lodash";
import {
  FilterableTable,
  Modal,
  useScreenActions,
  Button,
  Icon,
  DangerAlert,
  InfoAlert,
  SuccessAlert,
  Dropdown,
} from "blueprint-react";
import {
  fetchAgents,
  deleteAgentsInBulk,
  updateAgents,
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
      filter: {
        type: "text",
      },
      tooltips: true,
    },
    {
      id: "Description",
      Header: "Description",
      sortable: true,
      accessor: "description",
      align: "center",
      filter: {
        type: "text",
      },
      tooltips: true,
    },
    {
      id: "Agent Pool",
      Header: "Agent pool",
      accessor: "agentpool",
      sortable: true,
      align: "center",
      filter: {
        type: "text",
      },
      tooltips: true,
    },
    {
      id: "Organization",
      Header: "Organization",
      accessor: "organization",
      sortable: true,
      align: "center",
      filter: {
        type: "text",
      },
      tooltips: true,
    },
    {
      id: "Status",
      Header: "Status",
      accessor: "status",
      sortable: true,
      align: "center",
      filter: {
        type: "text",
      },
      tooltips: true,
    },
  ];

  const action = useScreenActions();

  const [selectedAgents, setSelectedAgents] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showAssignToModal, setShowAssignToModal] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const [agents, setAgents] = useState([]);
  const [viewAgent, setViewAgent] = useState({});
  const [warningAlert, setWarningAlert] = useState("");
  const [infoAlert, setInfoAlert] = useState("");
  const [successAlert, setSuccessAlert] = useState("");
  const [secondarySidebarData, setSecondarySidebarData] = useState({});
  const [openSidebar, setOpenSidebar] = useState(false);
  const [filterRemove, setfilterRemove] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(
    checkForTernary(
      localStorage.getItem("per_page_value"),
      parseInt(localStorage.getItem("per_page_value")),
      10
    )
  );
  const [totalAgents, setTotalAgents] = useState(0);
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

      setfilterRemove(!!!queryParam);
      setFetchingData(setLoading === false ? false : true);
      fetchAgents(
        pageSizeLimit ? pageSizeLimit : limit.current.value,
        offset.current.value,
        queryParam
      )
      .then((res) => {
        setAgents(res.data);
        console.log("Response: ", res.data)
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
    const sys_ids = selectedAgents.map(
      (agentsData) => agentsData.sys_id
    );
    const payload = {
      ids: sys_ids,
    };
    deleteAgentsInBulk(payload)
      .then(() => {
        setInfoAlert("");
        setSuccessAlert("Deleted Agents Successfully");
        _.remove(finalAgent.current.totalAgents, (agent) => {
          return sys_ids.includes(agent.sys_id);
        });
        setAgents(finalAgent.current.totalAgents);
        setSelectedAgents([]);
      })
      .catch((error) => {
        console.log(error);
        setInfoAlert("");
        setSuccessAlert("");
      });
  }

  const handleUpdateAgent = useCallback((sys_id, payload) => {
    setInfoAlert("Updating Agent");
    updateAgents(sys_id, payload)
      .then((res) => {
        setViewAgent(res.data.result);
        finalAgent.current.totalAgents = _.unionBy(
          [res.data.result],
          finalAgent.current.totalAgents,
          "sys_id"
        );
        setAgents(finalAgent.current.totalAgents);
        setInfoAlert("");
        setSuccessAlert("Updated Agent Successfully");
      })
      .catch((error) => {
        console.log(error);
        setInfoAlert("");
        setSuccessAlert("");
        error.response?.data?.detail?.detail &&
          setWarningAlert(error.response?.data?.detail?.detail);
      });
  }, []);

  const handleCreateAgent = useCallback((payload) => {
    console.log("start create agent");
    setInfoAlert("Creating Agent");
    createAgents(payload)
      .then((res) => {
        setInfoAlert("");
        setSuccessAlert("Created Agent Successfully");
        finalAgent.current.totalAgents.push(res.data.result);
        setAgents(finalAgent.current.totalAgents);
      })
      .catch((error) => {
        console.log(error);
        setInfoAlert("");
        setSuccessAlert("");
        error.response?.data?.detail?.detail &&
          setWarningAlert(error.response?.data?.detail?.detail);
      });
  }, []);

  const handleSecondarySidebar = (data) => {
    setSecondarySidebarData(data);
    setOpenSidebar(true);
  };

  const handleOpenAgent = useCallback(
    (data) => {
      console.log("handle open agent");
      if(agentToken){
        const title = `${data ? "Update" : "Create"} Agent`;
        action.openScreen(Agent, {
          title: title,
          screenId: `Agent-${data && data.number}`,
          agent: data,
          updateAgent: handleUpdateAgent,
          createAgent: handleCreateAgent,
        });
      } else {
        const title = `${data ? "Update" : "Create"} Agent`;
        action.openScreen(AgentWoToken, {
          title: title,
          screenId: `Agent-${data && data.number}`,
          agent: data,
          updateAgent: handleUpdateAgent,
          createAgent: handleCreateAgent,
        });
      }
    },
    [
      action,
      handleUpdateAgent,
      handleCreateAgent,
      agentToken,
    ]
  );

  const handleViewAgent = useCallback(
    (data) => {
      console.log("handle view agent");
      setViewAgent(data);
      const title = `Agent ${data.number}`;
      action.openScreen(
        {
        title: title,
        screenId: `agent-display-view-${data && data.number}`,
        viewAgent,
        agent: data,
        close: () => {
          setOpenSidebar(false);
        },
        updateAgent: handleUpdateAgent,
        createAgent: handleCreateAgent,
      });
    },
    [
      action,
      viewAgent,
      handleUpdateAgent,
      handleCreateAgent,
    ]
  );

  useEffect(() => {
    if (
      [50, 100].includes(pageSize) &&
      currentPage % Math.ceil(50 / pageSize) === 0 &&
      currentPage >=
        Math.ceil(finalAgent.current.totalAgents.length / pageSize) &&
      totalAgents > finalAgent.current.totalAgents.length
    ) {
      offset.current.value = finalAgent.current.totalAgents.length;
      getAgents(currentPage === 1, pageSize, false);
    } else if (
      currentPage % Math.ceil(50 / pageSize) === 0 &&
      currentPage >=
        Math.ceil(finalAgent.current.totalAgents.length / pageSize) &&
      currentPage !== 1 &&
      totalAgents > finalAgent.current.totalAgents.length
    ) {
      offset.current.value = finalAgent.current.totalAgents.length;
      getAgents(false, undefined, false);
    }
  }, [currentPage, pageSize, totalAgents, getAgents]);

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

  const removeFilter = () => {
    getAgents(true, undefined, false);
    finalAgent.current.totalAgents = [];
    setAgents(finalAgent.current.totalAgents);
  };


  const handleOrderBy = (orderBy) => {
    const keyMap = {
      Number: "number",
      "Organization": "organization",
      "Agent Name": [
        (item) => item?.assigned_to === "", "agentName"
      ],
      "Agent Pool": [(item) => item?.agentPool === "", "agentPool"],
    };
    return keyMap[orderBy] ? keyMap[orderBy] : "number";
  };

  const TableData = _.orderBy(
    agents,
    handleOrderBy(localStorage.getItem("sort_key_value"))
  ).map((item) => (item.spec));
  console.log("table data = ", TableData);






  if (TableData === []){
    return (
      <div class="card-initial tall">
        <div>
          <img class="illustration" src="static/firmwaresetup-37f69de36b7a81d9d8cbf2da0274305c.svg"></img>
          <div class="card-initial-title">There are no Firmware Updates</div>
          <div class="card-initial-content">Use the wizard to setup a firmware update.</div>
          <div>
            <button type="button" class="btn btn--primary btn--small card-btn">Setup Update</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="background-container">
      {checkComponentRender(
        warningAlert,
        <div className="alert-handler">
          <DangerAlert dismissHandler={() => setWarningAlert("")}>
            <div className="alert-box"> {warningAlert}</div>
          </DangerAlert>
        </div>
      )}

      {checkComponentRender(
        infoAlert,
        <div className="alert-handler">
          <InfoAlert dismissHandler={() => setInfoAlert("")}>
            <div className="alert-box"> {infoAlert}</div>
          </InfoAlert>
        </div>
      )}

      {checkComponentRender(
        successAlert,
        <div className="alert-handler">
          <SuccessAlert dismissHandler={() => setSuccessAlert("")}>
            <div className="alert-box"> {successAlert}</div>
          </SuccessAlert>
        </div>
      )}

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
            (items) => items.number
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
          loading={fetchingData}
          tools={[
            <Button
              key="ft-button2"
              className={filterRemove ? "hidden" : "button-css"}
              type={Button.TYPE.PRIMARY_GHOST}
              size={Button.SIZE.SMALL}
              onAction={removeFilter}
            >
              Remove Dashboard Filter{" "}
              <Icon
                type={Icon.TYPE.CLOSE}
                size={Icon.SIZE.XSMALL}
                style={{ marginLeft: "5px" }}
              />
            </Button>,
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
          keyField="id"
          itemKey="id"
          id="id"
          key={"agent_table"}
          columns={allColumns}
          selectable={true}
          onPageChange={(pageNumber) => {
            setCurrentPage(pageNumber + 1);
          }}
          onRowDoubleClick={handleViewAgent}
          onRowClick={handleSecondarySidebar}
          getSelected={(agentsData) => {
            console.table("getSelected args %O: ", agentsData);
            agentsData &&
              agentsData?.selections &&
              setSelectedAgents(agentsData.selections);
          }}
          total={parseInt(TableData.length)}
          showPageJump={true}
          onPageSizeChange={(data) => setPageSize(data)}
          pageSize={checkForTernary(pageSize, pageSize, 10)}
        />
      </div>
    </div>
  );
}

export default AgentTable;
