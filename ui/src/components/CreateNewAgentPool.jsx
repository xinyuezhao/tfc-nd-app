import React,{useState, useEffect,useCallback} from 'react';

import {
  useObjectPickerSubmit,
  DetailScreen,
  Input,
  useScreenActions,
  Card,
  LABELS
} from 'blueprint-react';
import _ from 'lodash';
import './CiscoObjectPicker.scss';
import {
  createAgentPool,
} from "../service/api_service";


// /**
//  * A sample of create new renderer funciton component that is passed as createItemRenderer.
//  * Please see the use of useObjectPickerSubmit to get the click event on Modal create button
//  */

function CreateNewAgentPool(props) {
  const {
    agentPoolName,
    agentPoolId,
    screenActions,
  } = props;

  const [name, setName] = useState('');
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    if (agentPoolName) {
      setName(agentPoolName.name);
    }
  }, [agentPoolName]);


  const handleOnNameChange = useEffect((evt) => {
    console.log("handleOnNameChange = ", name)
  }, [name]);

  // const checkBeforeSubmit = useCallback(() => {
  //   return true;
  // },);

  const onAction = useCallback(() => {
      let payload = {
        "spec": {
          organization: "cisco-cn-ecosystem-02",
          name: name,
        }
      }
      console.log("inside on action payload = ", payload)
      createAgentPool(payload)
      console.log("inside on action = ", name)


  }, []);


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
      createItemRenderer={handleOnNameChange}
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
                  value={name}
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