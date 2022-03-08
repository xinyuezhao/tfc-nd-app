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
} from "../service/api_service";

function Agent(props) {
  const {
    screenActions,
    title,
    createAgent,
  } = props;

  const action = useScreenActions();

  const [agentName, setName] = useState("");
  const [description, setDescription] = useState("");
  const [agentPool, setAgentPool] = useState({});
  const [organization, setOrganization] = useState({});
  const [isOpen, setIsOpen] = useState(true);

  const [organizations, setOrganizations] = useState([]);
  const [agentPools, setAgentPools] = useState([]);



  const updateDetails = useCallback(() => {
    let payload = {
      "spec": {
        name: agentName,
        description: description,
        agentpool: agentPool.name,
        organization: organization.name,
      }
    }
      createAgent(payload);
  }, [
    agentName,
    description,
    createAgent,
    agentPool,
    organization,
  ]);

  const checkBeforeSubmit = useCallback(() => {
    return true;
  },[]);

  const onAction = () => {
    const result = checkBeforeSubmit();
    if (result) {
      updateDetails();
      screenActions.closeScreen("create-agent-modal"); // screenId
    }
  };

  const onClose = () => {
    setIsOpen(false);
  };

  const getAgentPools = (org) => {
    fetchAgentPools(org.name)
      .then((res) => {
        const agentPoolResult = res.data.spec.agentpools;
        const agentPoolsData =  _.orderBy(agentPoolResult);
        setAgentPools(agentPoolsData);
      })
      .catch(error => {
        console.error('There was an error!', error); //change error msg
    });
  };

  const handleOrgSelect = useCallback((item)=> {
    setOrganization(item);
    setAgentPool({});
    if(item) {
      getAgentPools(item);
    }
  }, []);

  const handlePoolSelect = useCallback((item)=> {
    setAgentPool(item);
  }, []);

  useEffect(() => {
    fetchOrganizations()
      .then((res) => {
        const orgResult = res.data;
        const organizationData =  _.orderBy(orgResult).map((item) => (item.spec));
        setOrganizations(organizationData);
      })
      .catch(error => {
        console.error('There was an error!', error);//change error msg.
    });
  }, []);

  const formatOrganizationData = (orgs) => {
    return orgs.map((org) => ({
      name: org.Name,
      id: org.ExternalID}));
  }

  const formatedOrganizationData = formatOrganizationData(organizations);


  const onCreateObjectPickerNewAgentPool = useCallback(() => {
    action.openScreen(CreateNewAgentPool,{
      screenId: "create-agent-pool-modal",
      organization: organization,
      getAgentPools: getAgentPools,
      setAgentPool: setAgentPool,
    });
  }, [organization, action]);

  let applyButtonProps = {disabled: true};

  if(agentName && description && organization && agentPool){
    applyButtonProps = {};
  }


  return (
    <DetailScreen
      title={title}
      onAction={onAction}
      onClose={onClose}
      cancelButtonLabel={LABELS.cancel}
      applyButtonLabel={"Save"}
      applyButtonProps={applyButtonProps}
    >
      <div className="div_padding_left">
      <div className="base-padding-top base-padding-bottom text-xlarge">General</div>
        <Card className="col-11 no-padding-top base-padding-left">
            <div className="agent-container justify-content-center">
              <div className="row text-large qtr-padding-bottom">Agent Name
                <span className="text-danger qtr-padding-left icon-">*</span>
              </div>
              <div className="row text-large qtr-padding-bottom">
                <Input required=""
                  value={agentName}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="row base-padding-top text-large qtr-padding-bottom">Description
                <span className="text-danger qtr-padding-left icon-">*</span>
              </div>
              <div className="row text-large qtr-padding-bottom">
                <Input required=""
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="row base-padding-top text-large qtr-padding-bottom">Organization
                <span className="text-danger qtr-padding-left icon-">*</span>
              </div>
              <div className="row text-large qtr-padding-bottom">
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
              <div className="row base-padding-top text-large qtr-padding-bottom">Agent Pool
                <span className="text-danger qtr-padding-left icon-">*</span>
              </div>
              <div className="row base-padding-bottom text-large qtr-padding-bottom">
                <ObjectPicker required disabled={!(organization !== null && Object.keys(organization).length !== 0)}
                  data={agentPools}
                  multiSelect={false}
                  filterBy={(item, str) => item.name.indexOf(str) !== -1}
                  labelSuffix={'Agent Pool'}
                  value={agentPool}
                  onSelect={handlePoolSelect}
                  detailItemRenderer={PoolDetailRenderer}
                  idBy='id'
                  onCreate={onCreateObjectPickerNewAgentPool}
                />
              </div>
            </div>
        </Card>
      </div>
    </DetailScreen>
  );
}

export default Agent;
