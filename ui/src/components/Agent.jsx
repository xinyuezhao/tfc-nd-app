// import React, { useCallback, useState, useEffect } from "react";
// import {
//   DetailScreen,
//   Input,
//   Card,
//   ObjectPicker,
//   LABELS,
// } from "blueprint-react";
// import _ from 'lodash';
// import {getData, DetailRenderer} from './utils';
// import CreateNew from './CreateNew';
// import './CiscoObjectPicker.scss';

// function Agent(props) {
//   const {
//     screenId,
//     screenActions,
//     title,
//     agent,
//     updateAgent,
//     createAgent,
//   } = props;

//   const [agentName, setName] = useState("");
//   const [description, setDescription] = useState("");
//   const [agentPool, setAgentPool] = useState("");
//   const [organization, setOrganization] = useState("");
//   const [isOpen, setIsOpen] = useState(true);

//   const [orgData] = useState(getData(0, 10, 10));
//   const [poolData, setPoolData] = useState(getData(0, 10, 10));


//   useEffect(() => {
//     if (agent) {
//       setName(agent.agentName);
//       setDescription(agent.description);
//       setAgentPool(agent.agentPool);
//       setOrganization(agent.organization);
//     }
//   }, [agent]);

//   const updateDetails = useCallback(() => {
//     let payload = {
//       agentName,
//       description,
//       agentPool,
//       organization,
//     }

//     const closeDetailsScreenActions = () => {
//       screenActions.closeScreen(screenId);
//       props.close();
//     };

//     if (agent) {
//       updateAgent(agent?.sys_id, payload);
//     } else {
//       createAgent(payload);
//     }
//     closeDetailsScreenActions();
//   }, [
//     props,
//     agent,
//     agentName,
//     description,
//     screenId,
//     screenActions,
//     updateAgent,
//     createAgent,
//     agentPool,
//     organization,
//   ]);

//   const checkBeforeSubmit = useCallback(() => {
//     return true;
//   },);

//   const onAction = useCallback(() => {
//     const result = checkBeforeSubmit();
//     if (result) {
//       updateDetails();
//     }
//   }, [checkBeforeSubmit, updateDetails]);


//   const onClose = () => {
//     setIsOpen(false);
//   };

//   const handleOrgSelect = useCallback((item)=> {
//     setOrganization(item);
//   }, []);

//   const handlePoolSelect = useCallback((item, isNew)=> {
//     let newData = poolData;
//     if(isNew) {
//       newData = [item, ...poolData];
//     }
//     setAgentPool(item);
//     setPoolData(newData);
//   }, [poolData]);

//   const checkOrg = () => {
//     return false;
//   };

//   return (
//     <DetailScreen
//       title={title}
//       onAction={onAction}
//       onClose={onClose}
//       cancelButtonLabel={LABELS.cancel}
//       applyButtonLabel={`${agent ? "Update" : "Save"}`}
//     >
//       <div style={{ paddingLeft: "10%" }}>
//         <text style={{ fontSize: "20px" }}>General</text>
//         <Card className="col" style={{ width: "90%", paddingLeft: "30px", paddingTop: "0px" }}>
//             <div className="agent-container justify-content-center">
//               <div className="row">Agent Name:</div>
//               <div className="row p-5">
//                 <Input
//                   value={agentName}
//                   onChange={(e) => setName(e.target.value)}
//                 />
//               </div>
//               {/* ========================================== */}
//               <div className="row" style={{ paddingTop: "30px" }}>Description:</div>
//               <div className="row p-5">
//                 <Input
//                   value={description}
//                   onChange={(e) => setDescription(e.target.value)}
//                 />
//               </div>
//               {/* ========================================== */}
//               <div className="row" style={{ paddingTop: "30px" }}>Organization :</div>
//               <div className="row p-5">
//                 <ObjectPicker
//                   data={orgData}
//                   multiSelect={false}
//                   filterBy={(item, str) => item.name.indexOf(str) !== -1}
//                   labelSuffix={'Organization'}
//                   value={organization}
//                   onSelect={handleOrgSelect}
//                   detailItemRenderer={DetailRenderer}
//                   idBy='id'
//                 />
//               </div>
//               {/* ========================================== */}
//               <div className="row" style={{ paddingTop: "30px" }}  disabled={checkOrg}>Agent Pool :</div>
//               <div className="row p-5" style={{ paddingBottom: "30px" }}>
//                 <ObjectPicker
//                   data={poolData}
//                   multiSelect={false}
//                   filterBy={(item, str) => item.name.indexOf(str) !== -1}
//                   labelSuffix={'Agent Pool'}
//                   value={agentPool}
//                   onSelect={handlePoolSelect}
//                   detailItemRenderer={DetailRenderer}
//                   idBy='id'
//                   createItemRenderer={CreateNew}
//                 />
//               </div>
//               {/* ========================================== */}
//             </div>
//         </Card>
//       </div>
//     </DetailScreen>
//   );
// }

// export default Agent;
