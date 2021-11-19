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
import {getPoolData, PoolDetailRenderer} from './AgentPoolUtils';
import {getOrgData, OrgDetailRenderer} from './OrganizationUtils';
import CreateAgentPool from './CreateNewAgentPool';
import './CiscoObjectPicker.scss';

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

  const onCreate = () => {
    action.openScreen(CreateAgentPool,{});
  }

  const [agentName, setName] = useState("");
  const [description, setDescription] = useState("");
  const [agentPool, setAgentPool] = useState("");
  const [organization, setOrganization] = useState("");
  const [isOpen, setIsOpen] = useState(true);

  const [orgData] = useState(getOrgData(0, 10, 10));
  const [poolData, setPoolData] = useState(getPoolData(0, 10, 10));


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
      agentName,
      description,
      agentPool,
      organization,
    }

    const closeDetailsScreenActions = () => {
      screenActions.closeScreen(screenId);
      props.close();
    };

    if (agent) {
      updateAgent(agent?.sys_id, payload);
    } else {
      createAgent(payload);
    }
    closeDetailsScreenActions();
  }, [
    props,
    agent,
    agentName,
    description,
    screenId,
    screenActions,
    updateAgent,
    createAgent,
    agentPool,
    organization,
  ]);

  const checkBeforeSubmit = useCallback(() => {
    return true;
  },);

  const onAction = useCallback(() => {
    const result = checkBeforeSubmit();
    if (result) {
      updateDetails();
    }
  }, [checkBeforeSubmit, updateDetails]);


  const onClose = () => {
    setIsOpen(false);
  };

  const handleOrgSelect = useCallback((item)=> {
    setOrganization(item);
  }, []);

  const handlePoolSelect = useCallback((item, isNew)=> {
    let newData = poolData;
    if(isNew) {
      newData = [item, ...poolData];
    }
    setAgentPool(item);
    setPoolData(newData);
  }, [poolData]);

  const checkOrg = () => {
    return false;
  };
//  Name is not required, description is.
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
                  data={orgData}
                  multiSelect={false}
                  filterBy={(item, str) => item.name.indexOf(str) !== -1}
                  labelSuffix={'Organization'}
                  value={organization}
                  onSelect={handleOrgSelect}
                  detailItemRenderer={OrgDetailRenderer}
                  idBy='id'
                />
              </div>
              {/* ========================================== */}
              <div className="row" style={{ paddingTop: "30px" }}  disabled={checkOrg}>Agent Pool
                <span class="text-danger" style={{lineHeight: "0.7em", verticalAlign: "middle"}}>*</span>
              </div>
              <div className="row p-5" style={{ paddingBottom: "30px" }}>
                <ObjectPicker required
                  data={poolData}
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