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

  let applyButtonProps = {disabled: true};

  if(poolName){
    applyButtonProps = {};
  }

  return (
    <DetailScreen
      onAction={handleCreateNewAgentPool}
      onClose={() => { setIsOpen(false); }}
      title={"Create Agent Pool"}
      cancelButtonLabel={LABELS.cancel}
      applyButtonLabel={LABELS.create}
      applyButtonProps={applyButtonProps}
      isOpen={isOpen}
    >
    <div className="col-xl-10 offset-xl-1">
        <h5 className="base-padding-bottom">General</h5>
        <Card className="no-padding-top base-padding-left base-padding-right base-padding-bottom">
          <form onSubmit={(proxy, evt) => proxy.preventDefault()}>
            <Input
              required
              label="Agent Pool Name"
              value={poolName}
              onChange={(e) => setPoolName(e.target.value)}
            />
          </form>
        </Card>
      </div>
    </DetailScreen>
  );

}


export default CreateNewAgentPool;