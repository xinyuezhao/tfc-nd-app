import React, { useCallback, useState, useEffect } from "react";
import {
  DetailScreen,
  Input,
  Card,
  // useScreenActions,
  InfoAlert,
  LABELS,
} from "blueprint-react";
// import _ from 'lodash';
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

  // const action = useScreenActions();



  const [agentName, setName] = useState("");
  const [description, setDescription] = useState("");
  const [agentToken, setAgentToken] = useState("");
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    if (agent) {
      setName(agent.agentName);
      setDescription(agent.description);
      setAgentToken(agent.agentToken);
    }
    console.log("INFO: Create agent without user token");
  }, [agent]);

  const updateDetails = useCallback(() => {
    let payload = {
      name: agentName,
      description: description,
      token: agentToken,
    }

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
    agentToken,
  ]);

  const checkBeforeSubmit = useCallback(() => {
    return true;
  },[]);

  const onAction = useCallback(() => {
    const result = checkBeforeSubmit();
    if (result) {
      updateDetails();
      screenActions.closeScreen("create-agent-modal");
    }
  }, [checkBeforeSubmit, updateDetails, screenActions]);


  const onClose = () => {
    setIsOpen(false);
  };

  let applyButtonProps = {disabled: true};

  if(agentName && description && agentToken){
    applyButtonProps = {};
  }



//  Name is not required, description is.
  return (
    <DetailScreen
      title={title}
      onAction={onAction}
      onClose={onClose}
      cancelButtonLabel={LABELS.cancel}
      applyButtonLabel={`${agent ? "Update" : "Save"}`}
      applyButtonProps={applyButtonProps}
    >
      <div style={{ paddingLeft: "10%" }}>
      <div style={{ fontSize: "20px", paddingTop: "25px",paddingBottom: "25px", }}>General</div>
        <Card className="col" style={{ width: "90%", paddingLeft: "30px", paddingTop: "0px" }}>
          <InfoAlert
          title="Alert Title"
          children="Instruction on how to use authentication. Get terraform user token."
          style={{ marginLeft: "25px" }}
          />
            <div className="agent-container justify-content-center">
              <div className="row">Agent Name
                <span className="text-danger" style={{lineHeight: "0.7em", verticalAlign: "middle"}}>*</span>
              </div>
              <div className="row p-5">
                <Input required=""
                  value={agentName}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              {/* ========================================== */}
              <div className="row" style={{ paddingTop: "30px" }}>Description
                <span className="text-danger" style={{lineHeight: "0.7em", verticalAlign: "middle"}}>*</span>
              </div>
              <div className="row p-5">
                <Input required=""
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              {/* ========================================== */}
              <div className="row" style={{ paddingTop: "30px" }}>Agent Token
                <span className="text-danger" style={{lineHeight: "0.7em", verticalAlign: "middle"}}>*</span>
              </div>
              <div className="row p-5">
                <Input required=""
                  value={agentToken}
                  onChange={(e) => setAgentToken(e.target.value)}
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
