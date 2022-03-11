import React, { useCallback, useState } from "react";
import {
  DetailScreen,
  Input,
  Card,
  InfoAlert,
  LABELS,
  Modal,
} from "blueprint-react";
import './CiscoObjectPicker.scss';

function Agent(props) {
  const {
    screenActions,
    title,
    createAgent,
  } = props;

  const [agentName, setName] = useState("");
  const [description, setDescription] = useState("");
  const [agentToken, setAgentToken] = useState("");
  const [isOpen, setIsOpen] = useState(true);

  const updateDetails = useCallback(() => {
    let payload = {
      name: agentName,
      description: description,
      token: agentToken,
    }
    createAgent(payload);
  }, [
    agentName,
    description,
    createAgent,
    agentToken,
  ]);

  const handleCreateAgentWoToken = useCallback((sourceId) => {
    if(sourceId === Modal.BUTTON_IDS.APPLY)
    {
        updateDetails();
        screenActions.closeScreen("create-agent-modal");
    }
  }, [updateDetails, screenActions]);

  const onClose = () => {
    setIsOpen(false);
  };

  let applyButtonProps = {disabled: true};

  if(agentName && description && agentToken){
    applyButtonProps = {};
  }

  return (
    <DetailScreen
      title={title}
      onAction={handleCreateAgentWoToken}
      onClose={onClose}
      cancelButtonLabel={LABELS.cancel}
      applyButtonLabel={"Save"}
      applyButtonProps={applyButtonProps}
      isOpen={isOpen}
    >
      <div className="div_padding_left">
      <div className="base-padding-top base-padding-bottom text-xlarge">General</div>
        <Card className="col-11 no-padding-top base-padding-left">
          <InfoAlert className="dbl-marginLeft"
          title="Alert Title"
          children= {<div>To generate a Terraform Cloud Agent Token to associate with this agent you will
            need to create an Agent Pool on Terraform Cloud, see:
            <a
                href="https://www.terraform.io/cloud-docs/agents#create-a-new-agent-pool"
                target="_blank" rel="noreferrer">
                https://www.terraform.io/cloud-docs/agents#create-a-new-agent-pool</a> for details.
                <br />
                <br />
                <i>Note: </i> This integration can do those steps for you if you configure a User Authentication Token.
                To change the current configuration, go back and click <span className="icon-cog"></span> &gt; Setup.</div>}
          />
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
              <div className="row base-padding-top text-large qtr-padding-bottom">Agent Token
                <span className="text-danger qtr-padding-left icon-">*</span>
              </div>
              <div className="row text-large qtr-padding-bottom">
                <Input required=""
                  value={agentToken}
                  onChange={(e) => setAgentToken(e.target.value)}
                />
              </div>
            </div>
        </Card>
      </div>
    </DetailScreen>
  );
}

export default Agent;
