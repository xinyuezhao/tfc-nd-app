import React, { useCallback, useState } from "react";
import {
  DetailScreen,
  Input,
  Card,
  InfoAlert,
  LABELS,
  DangerAlert
} from "blueprint-react";
import './CiscoObjectPicker.scss';

/**
 * CreateAgentWoToken component lets the user to create an agent
 * when the user has chosen not to add the authentication token in the initial setup.
 * The user have to input the agent token every time a new agent is created.
 */

function Agent(props) {
  const {
    screenActions,
    title,
    createAgent,
    refreshAgents,
  } = props;

  const [agentName, setAgentName] = useState("");
  const [description, setDescription] = useState("");
  const [agentToken, setAgentToken] = useState("");
  const [isOpen, setIsOpen] = useState(true);
  const [warningAlert, setWarningAlert] = useState("");

  const updateDetails = useCallback(() => {
    let payload = {
      "spec": {
        name: agentName,
        description: description,
        token: agentToken,
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
    agentToken,
    screenActions
  ]);

  const onClose = () => {
    setIsOpen(false);
  };

  let applyButtonProps = {disabled: true};

  if(agentName && description && agentToken){
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
          <InfoAlert
            children= {<div>To generate a Terraform Cloud Agent Token to associate with this agent you will
            need to create an Agent Pool on Terraform Cloud, see: 
            <a
                href="https://www.terraform.io/cloud-docs/agents#create-a-new-agent-pool"
                target="_blank" rel="noreferrer">
                https://www.terraform.io/cloud-docs/agents#create-a-new-agent-pool</a> for details.
                <br />
                <br />
                <i>Note: </i> This integration can do those steps for you if you configure a User Authentication Token.
                To change the current configuration, go back and click on the top right <span className="icon-cog"></span> &gt; Setup.</div>}
          />
          <form onSubmit={(proxy, evt) => proxy.preventDefault()} className="base-padding-top">
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
            <Input
              required
              classes={{root:'no-padding-bottom'}}
              label="Agent Token"
              value={agentToken}
              onChange={(e) => setAgentToken(e.target.value)}
            />
          </form>
        </Card>
      </div>
    </DetailScreen>
  );
}

export default Agent;
