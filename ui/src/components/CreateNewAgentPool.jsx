import React,{useState} from 'react';

import {
  DetailScreen,
  Input,
  Card,
  LABELS
} from 'blueprint-react';
// import _ from 'lodash';
import './CiscoObjectPicker.scss';
import {
  createAgentPool,
} from "../service/api_service";


// /**
//  * A sample of create new renderer function component that is passed as createItemRenderer.
//  * Please see the use of useObjectPickerSubmit to get the click event on Modal create button
//  */

function CreateNewAgentPool(props) {
  const {
    screenId,
    screenActions,
    organization,
    getAgentPools,
    setAgentPool,
  } = props;

  const [poolName, setName] = useState("");
  const [isOpen, setIsOpen] = useState(true);

  const onAction = () => {
    let payload = {
      "spec": {
        organization: organization.name,
        name: poolName,
      }
    }
    createAgentPool(payload)
    .then((res) => {
      getAgentPools(organization);
      setAgentPool(res.data.spec);
      console.log("screen ID = ", screenId)
      screenActions.closeScreen("create-agent-pool-modal"); // screenId
    })
    .catch((error) => {
      console.log(error);;
    });
  };


  const onClose = () => {
    setIsOpen(false);
  };

  const onMinimize = (a) => {
    props.close();
  };

  return (
    <DetailScreen
      onAction={onAction}
      onClose={onClose}
      onMinimize={onMinimize}
      title={"Create Agent Pool"}
      cancelButtonLabel={LABELS.cancel}
      applyButtonLabel={"Create and Save"}
      isOpen={isOpen}
    >
    <div style={{ paddingLeft: "10%" }}>
      <div style={{ fontSize: "20px", paddingTop: "25px",paddingBottom: "25px", }}>General</div>
        <Card className="col" style={{ width: "50%", paddingLeft: "30px", paddingTop: "0px", paddingBottom: "25px" }}>
            <div className="agent-container justify-content-center">
              <div className="row">Agent Pool Name
                <span class="text-danger" style={{lineHeight: "0.7em", verticalAlign: "middle"}}>*</span>
              </div>
              <div className="row p-5" style={{ paddingTop: "10px" }}>
                <Input required=""
                  value={poolName}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              {/* ========================================== */}
            </div>
        </Card>
      </div>
    </DetailScreen>
  );

}


export default CreateNewAgentPool;