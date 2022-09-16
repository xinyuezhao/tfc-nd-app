import React, { useCallback, useState, useEffect, log } from "react";
import {
  DetailScreen,
  Input,
  Card,
  ObjectPicker,
  useScreenActions,
  LABELS,
  DangerAlert
} from "blueprint-react";
import _ from 'lodash';
import PoolDetailRenderer from './AgentPoolRenderer';
import OrgDetailRenderer from './OrganizationRenderer';
import CreateNewAgentPool from './CreateNewAgentPool';
import './CiscoObjectPicker.scss';
import { fetchAgentPools } from "../service/api_service";

/**
 * CreateAgent component lets the user to create an agent
 * when the user has already added the authentication token in the initial setup.
 * It displays a set of organizations to users based on the authentication token given by them.
 * Once the organization is selected, it displays all the agent pools within the selected organization.
 */

function Agent(props) {
  const {
    screenActions,
    title,
    createAgent,
    refreshAgents,
    orgData,
    refreshOrgnizations,
    fetchingOrgData,
  } = props;

  const action = useScreenActions();

  const [agentName, setAgentName] = useState("");
  const [description, setDescription] = useState("");
  const [agentPool, setAgentPool] = useState({});
  const [organization, setOrganization] = useState({});
  const [isOpen, setIsOpen] = useState(true);
  const [organizations, setOrganizations] = useState([]);
  const [agentPools, setAgentPools] = useState([]);
  const [warningAlert, setWarningAlert] = useState("");

  const updateDetails = useCallback(() => {
    let payload = {
      "spec": {
        name: agentName,
        description: description,
        agentpool: agentPool.name,
        organization: organization.name,
      }
    }

    createAgent(payload)
    .then((response) => {
      console.log("CREATE AGENT ", + response.status)
        refreshAgents();
        console.log("CREATE AGENT ", + response.status)
        screenActions.closeScreen("create-agent-modal");
      },
      ({response = {}}) => {
        const {data = {}} = response;
        const {errors = []} = data;
        const [msg = "Unknow Error"] = errors;
        console.log("CREATE AGENT ERROR", msg)
        setWarningAlert(msg);
      });
  }, [
    agentName,
    description,
    createAgent,
    refreshAgents,
    agentPool,
    organization,
    screenActions
  ]);

  const onClose = () => {
    setIsOpen(false);
  };

  const getAgentPools = (org) => {
    fetchAgentPools(org.name)
      .then((res) => {
        const agentPoolResult = res.data.spec.agentpools;
        const agentPoolsData =  _.orderBy(agentPoolResult);
        setAgentPools(agentPoolsData);
        console.info("Successfully fetched agent pool(s).")
      })
      .catch(error => {
        console.error("Failed to fetch agent pool(s) from from backend agentpool service.", error);
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
      if (orgData === []){
        refreshOrgnizations();
      }
      const organizationData =  _.orderBy(orgData).map((item) => (item.spec));
      setOrganizations(organizationData);
  }, [orgData, refreshOrgnizations]);

  const formatedOrganizationData = organizations.map((org) => ({
    name: org.Name,
    id: org.ExternalID
  }));

  const onCreateObjectPickerNewAgentPool = useCallback(() => {
    action.openScreen(CreateNewAgentPool, {
      screenId: "create-agent-pool-modal",
      organization: organization,
      getAgentPools: getAgentPools,
      setAgentPool: setAgentPool,
    });
  }, [organization, action]);

  let applyButtonProps = {disabled: true};

  if(agentName && description && !_.isEmpty(organization) && !_.isEmpty(agentPool)){
    applyButtonProps = {};
  }

  const show = warningAlert ? (<DangerAlert>{warningAlert}</DangerAlert>) : null;

  return (
    <DetailScreen
      title={title}
      onAction={updateDetails}
      onClose={onClose}
      cancelButtonLabel={LABELS.cancel}
      applyButtonLabel={"Save"}
      applyButtonProps={applyButtonProps}
      isOpen={isOpen}
    >
      <div className="col-xl-10 offset-xl-1">
        <h5 className="base-padding-bottom">General</h5>
        {show}
        <Card className="no-padding-top base-padding-left base-padding-right base-padding-bottom">
          <form onSubmit={(proxy, evt) => proxy.preventDefault()}>
            <Input
              required
              label="Agent Name"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
            />
            <Input
              required
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <div className="form-group">
              <div className="form-group__text">
                <label className="input-label">
                  <span className="input-label-text" required>Organization</span>
                </label>
                <ObjectPicker required
                    loading={fetchingOrgData}
                    data={formatedOrganizationData}
                    multiSelect={false}
                    filterBy={(item, str) => item.name.indexOf(str) !== -1}
                    labelSuffix={'Organizations'}
                    buttonLabel="Select"
                    value={organization}
                    onSelect={handleOrgSelect}
                    detailItemRenderer={OrgDetailRenderer}
                    idBy='id'
                  />
                {/* } */}
              </div>
            </div>
            <div className="form-group no-padding-bottom">
              <div className="form-group__text">
                <label className="input-label">
                  <span className="input-label-text" required>Agent Pool</span>
                </label>
                <ObjectPicker required disabled={!(organization !== null && Object.keys(organization).length !== 0)}
                  data={agentPools}
                  multiSelect={false}
                  filterBy={(item, str) => item.name.indexOf(str) !== -1}
                  labelSuffix={'Agent Pool'}
                  buttonLabel="Select"
                  value={agentPool}
                  onSelect={handlePoolSelect}
                  detailItemRenderer={PoolDetailRenderer}
                  idBy='id'
                  onCreate={onCreateObjectPickerNewAgentPool}
                />
              </div>
            </div>
          </form>
        </Card>
      </div>
    </DetailScreen>
  );
}

export default Agent;
