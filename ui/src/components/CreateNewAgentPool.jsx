import React,{useState} from 'react';

import {
  DetailScreen,
  Input,
  Card,
  LABELS
} from 'blueprint-react';
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
    screenActions,
    organization,
    getAgentPools,
    setAgentPool,
  } = props;

  const [poolName, setPoolName] = useState("");
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
      screenActions.closeScreen("create-agent-pool-modal"); // screenId
    })
    .catch((error) => {
      console.log(error); //change error message
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
      applyButtonLabel={"Create"}
      isOpen={isOpen}
    >
    <div style={{ paddingLeft: "10%" }}>
      <div className="base-padding-top base-padding-bottom text-xlarge">General</div>
        <Card className="col-6 no-padding-top base-padding-left">
            <div className="agent-container justify-content-center">
              <div className="row text-large base-padding-bottom">Agent Pool Name
                <span className="text-danger qtr-padding-left icon-">*</span>
              </div>
              <div className="row text-large qtr-padding-bottom">
                <Input required=""
                  value={poolName}
                  onChange={(e) => setPoolName(e.target.value)}
                />
              </div>
            </div>
        </Card>
      </div>
    </DetailScreen>
  );

}


export default CreateNewAgentPool;