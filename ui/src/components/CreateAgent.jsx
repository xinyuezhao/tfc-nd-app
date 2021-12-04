import React, { useCallback, useState, useEffect } from "react";
import {
  DetailScreen,
  Input,
  Card,
  ObjectPicker,
  useScreenActions,
  LABELS,
} from "blueprint-react";
import _ from 'lodash';
import {PoolDetailRenderer} from './AgentPoolRenderer';
import {OrgDetailRenderer} from './OrganizationRenderer';
import CreateNewAgentPool from './CreateNewAgentPool';
import './CiscoObjectPicker.scss';
import {
  fetchOrganizations,
  fetchAgentPools,
  createAgentPool
} from "../service/api_service";

function Agent(props) {
  const {
    screenId,
    screenActions,
    title,
    agent,
    updateAgent,
    createAgent,
  } = props;

  const action = useScreenActions();

  const [agentName, setName] = useState("");
  const [description, setDescription] = useState("");
  const [agentPool, setAgentPool] = useState("");
  const [organization, setOrganization] = useState("");
  const [isOpen, setIsOpen] = useState(true);
  const [poolDisplay, setPoolDisplay] = useState(true);

  const [organizations, setOrganizations] = useState([]);
  const [agentPools, setAgentPools] = useState([]);


  useEffect(() => {
    if (agent) {
      setName(agent.agentName);
      setDescription(agent.description);
      setAgentPool(agent.agentPool);
      setOrganization(agent.organization);
    }
    console.log("Inside create agent");
  }, [agent]);

  const updateDetails = useCallback(() => {
    let payload = {
      "spec": {
        name: agentName,
        description: description,
        agentpool: agentPool.name,
        organization: organization.name,
      }
    }
    console.log("payloadddd = ", payload)

    if (agent) {
      updateAgent(agent?.sys_id, payload);
    } else {
      createAgent(payload);
    }
  }, [
    agent,
    agentName,
    description,
    updateAgent,
    createAgent,
    agentPool,
    organization,
  ]);

  const checkBeforeSubmit = useCallback(() => {
    return true;
  },);

  const onAction = () => {
    const result = checkBeforeSubmit();
    if (result) {
      updateDetails();
      console.log("screen action ID = ", screenId)
      screenActions.closeScreen("create-agent-modal"); // screenId
    }
  };

  const onClose = () => {
    setIsOpen(false);
  };

  const getAgentPools = () => {
    fetchAgentPools(organization.name)
        .then((res) => {
          const agentPoolResult = res.data.spec.agentpools;
          const agentPoolsData =  _.orderBy(agentPoolResult);
          setAgentPools(agentPoolsData);
        })
        .catch(error => {
          console.error('There was an error!', error);
      });
  };

  const handleOrgSelect = useCallback((item)=> {
    setOrganization(item);
    console.log("handleOrgSelect", organization)
    if(organization) {
      getAgentPools();
      // fetchAgentPools(organization.name)
      //   .then((res) => {
      //     const agentPoolResult = res.data.spec.agentpools;
      //     const agentPoolsData =  _.orderBy(agentPoolResult);
      //     setAgentPools(agentPoolsData);
      //   })
      //   .catch(error => {
      //     console.error('There was an error!', error);
      // });
    }
    setPoolDisplay(false);
  }, []);

  const handlePoolSelect = useCallback((item)=> {
    setAgentPool(item);
  }, []);

  useEffect(() => {
    fetchOrganizations()
      .then((res) => {
        const orgResult = res.data;
        const OrganizationData =  _.orderBy(orgResult).map((item) => (item.spec));
        setOrganizations(OrganizationData);
      })
      .catch(error => {
        console.error('There was an error!', error);
    });
  }, []);

  const formatOrganizationData = (organizations) => {
    const formatedData = organizations.map((organizations) => ({
      name: organizations.Name,
      id: organizations.ExternalID}));
    return formatedData;
  }

  const formatedOrganizationData = formatOrganizationData(organizations);

  const formatAgentPoolData = (agentPools) => {
    const formatedData = agentPools.map((agentPools) => ({
      name: agentPools.name,
      id: agentPools.id}));
    return formatedData;
  }

  const formatedAgentPoolData = formatAgentPoolData(agentPools);

  // const createNewAgentPool = useCallback((payload) => {
  //   console.log(" create new agent pool in create agent");
  //   // setInfoAlert("Creating Agent Pool");
  //   createAgentPool(payload)
  //     .then((res) => {
  //       console.log("Agent POOL creation data = ", res.data )
  //       // getAgents();
  //     })
  //     .catch((error) => {
  //       console.log(error);;
  //     });
  // }, []);

  const onCreate = () => {
    action.openScreen(CreateNewAgentPool,{
      screenId: "create-agent-pool-modal",
    });
    console.log("getAgentPools();", getAgentPools())
    getAgentPools();
  }
  // const onCreate = useCallback(
  //   () => {
  //     action.openScreen(CreateNewAgentPool, {
  //       screenId: "create-agent-pool-modal",
  //       newAgentPool: createNewAgentPool,
  //     });
  //   },
  //   [
  //     action,
  //     createNewAgentPool,
  //   ]
  // );

  return (
    <DetailScreen
      title={title}
      onAction={onAction}
      onClose={onClose}
      cancelButtonLabel={LABELS.cancel}
      applyButtonLabel={`${agent ? "Update" : "Save"}`}
    >
      <div style={{ paddingLeft: "10%" }}>
      <div style={{ fontSize: "20px", paddingTop: "25px",paddingBottom: "25px", }}>General</div>
        <Card className="col" style={{ width: "90%", paddingLeft: "30px", paddingTop: "0px" }}>
            <div className="agent-container justify-content-center">
              <div className="row">Agent Name</div>
              <div className="row p-5">
                <Input required=""
                  value={agentName}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              {/* ========================================== */}
              <div className="row" style={{ paddingTop: "30px" }}>Description
                <span class="text-danger" style={{lineHeight: "0.7em", verticalAlign: "middle"}}>*</span>
              </div>
              <div className="row p-5">
                <Input required=""
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              {/* ========================================== */}
              <div className="row" style={{ paddingTop: "30px" }}>Organization
                <span class="text-danger" style={{lineHeight: "0.7em", verticalAlign: "middle"}}>*</span>
              </div>
              <div className="row p-5">
                <ObjectPicker required
                  data={formatedOrganizationData}
                  multiSelect={false}
                  filterBy={(item, str) => item.name.indexOf(str) !== -1}
                  labelSuffix={'Organizations'}
                  value={organization}
                  onSelect={handleOrgSelect}
                  detailItemRenderer={OrgDetailRenderer}
                  idBy='id'
                />
              </div>
              {/* ========================================== */}
              <div className="row" style={{ paddingTop: "30px" }}>Agent Pool
                <span class="text-danger" style={{lineHeight: "0.7em", verticalAlign: "middle"}}>*</span>
              </div>
              <div className="row p-5" style={{ paddingBottom: "30px" }}>
                <ObjectPicker required disabled={poolDisplay}
                  data={formatedAgentPoolData}
                  multiSelect={false}
                  filterBy={(item, str) => item.name.indexOf(str) !== -1}
                  labelSuffix={'Agent Pool'}
                  value={agentPool}
                  onSelect={handlePoolSelect}
                  detailItemRenderer={PoolDetailRenderer}
                  idBy='id'
                  onCreate={onCreate}
                />
              </div>
              {/* ========================================== */}
            </div>
        </Card>
      </div>
    </DetailScreen>
  );
}

export default Agent;
