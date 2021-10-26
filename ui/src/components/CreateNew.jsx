// import React, {useState, useCallback} from 'react';
// import {
//     useObjectPickerSubmit,
//     Modal
// } from 'blueprint-react';
// import _ from 'lodash';
import './CiscoObjectPicker.scss';

// /**
//  * A sample of create new renderer funciton component that is passed as createItemRenderer.
//  * Please see the use of useObjectPickerSubmit to get the click event on Modal create button
//  */

// export default (props) => {

//   const [name, setName] = useState('');

//   useObjectPickerSubmit(() => {
//       props.onSuccess({
//           name: name,
//           id: _.uniqueId()
//       });
//   }, props.status)

//   const handleOnNameChange = useCallback((evt) => {
//       setName(evt.target.value);
//   }, []);

//   return (
//     <main>
//         <h1>React Modal</h1>
//         <Modal show={this.state.show} handleClose={this.hideModal}>
//           <p>Modal</p>
//         </Modal>
//         <button type="button" onClick={this.showModal}>
//           Open
//         </button>
//       </main>
//   );
// }

// <div className="object-picker-create-new">
//   <Input label="Name" value={name} required onChange={handleOnNameChange}/>
// </div>
import React,{useState,useCallback} from 'react';

import {
  useObjectPickerSubmit,
  DetailScreen,
  Input,
  LABELS
} from 'blueprint-react';
import _ from 'lodash';


function NewAgent(props) {
  // function Agent(props) {
  //   const {
  //     screenId,
  //     screenActions,
  //     title,
  //     agent,
  //     updateAgent,
  //     createAgent,
  //   } = props;

  const [name, setName] = useState('');

  useObjectPickerSubmit(() => {
      props.onSuccess({
          name: name,
          id: _.uniqueId()
      });
  }, props.status)

  const handleOnNameChange = useCallback((evt) => {
      setName(evt.target.value);
  }, []);

  return (
    <DetailScreen
      title={"Create Agent Pool"}
      createItemRenderer={handleOnNameChange}
      cancelButtonLabel={LABELS.cancel}
      applyButtonLabel={"Create and Save"}
    >
      <div className="object-picker-create-new">
        <Input label="Name" value={name} required onChange={handleOnNameChange}/>
      </div>
    </DetailScreen>
  );

}


export default NewAgent;