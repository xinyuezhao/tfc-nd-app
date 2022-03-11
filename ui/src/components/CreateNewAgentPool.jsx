import React,{useState} from 'react';

import {
  DetailScreen,
  Input,
  Card,
  LABELS,
  Modal
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

  const handleCreateNewAgentPool = (sourceId) => {
    if(sourceId === Modal.BUTTON_IDS.APPLY){
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
        console.error("Failed to create new agent pool.",error); //change error message
      });
    }
  };

  return (
    <DetailScreen
      onAction={handleCreateNewAgentPool}
      onClose={() => { setIsOpen(false); }}
      title={"Create Agent Pool"}
      cancelButtonLabel={LABELS.cancel}
      applyButtonLabel={LABELS.create}
      isOpen={isOpen}
    >
    <div className="div_padding_left">
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