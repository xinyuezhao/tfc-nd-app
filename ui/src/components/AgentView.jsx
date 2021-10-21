// import React, { useCallback, useState, useEffect } from "react";
// import {
//   DetailScreen,
//   Card,
//   CardHeader,
//   CardBody,
//   Icon,
//   Link,
// } from "blueprint-react";
// import { getWorkNoteOfAgent, fetchAgents } from "../service/api_service";
// import Agent from "./Agent";

// // const falsyItems = [null, undefined, ""];
// const headerIcons = [
//   {
//     icon: "icon-edit",
//   },
// ];

// function AgentView(props) {
//   // const [iconList, setIconList] = useState(headerIcons);

//   const getThemeColor = (key, value) => {
//     const severityMap = {
//       New: Icon.THEME.MedGray2,
//       "In Progress": Icon.THEME.StatusYellow,
//       "On Hold": Icon.THEME.StatusTurq,
//       Resolved: Icon.THEME.StatusGreen,
//       Closed: Icon.THEME.StatusOrange,
//       Canceled: Icon.THEME.StatusRed,
//     };
//     const priorityMap = {
//       "1 - Critical": Icon.THEME.Danger,
//       "2 - High": Icon.THEME.Warning,
//       "3 - Moderate": Icon.THEME.Default,
//       "4 - Low": Icon.THEME.Success,
//       "5 - Planning": Icon.THEME.Primary,
//     };
//     return key === "state" ? severityMap[value] : priorityMap[value];
//   };

//   const {
//     screenId,
//     screenActions,
//     agent,
//     updateAgent,
//     createAgent,
//     categoryList,
//     stateList,
//     severityList,
//     subcategoryList,
//     usersList,
//     groupsList,
//     serviceList,
//     serviceOfferingList,
//     configurationItems,
//     onHoldReasonList,
//     resolutionCodeList,
//     viewAgent,
//   } = props;

//   useEffect(() => {
//     fetchAgents(null, null, null, agent.sys_id)
//       .then((response) => {
//         setApplication(response.data);
//       })
//       .catch((err) => {
//         console.log(err.response);
//       });
//   }, [agent.sys_id]);

//   const onAction = useCallback(() => {
//     screenActions.closeScreen(screenId);
//     props.close();
//     screenActions.closeScreen(screenId);
//   }, [props, screenActions, screenId]);

//   const handleOpenAgent = useCallback(
//     (data) => {
//       const title = `${data ? "Update" : "Create"} Agent`;
//       screenActions.openScreen(Agent, {
//         title: title,
//         screenId: `agent-${data && data.number}`,
//         agent: data,
//         categoryList,
//         stateList,
//         severityList,
//         subcategoryList,
//         onHoldReasonList,
//         resolutionCodeList,
//         usersList,
//         groupsList,
//         serviceList,
//         serviceOfferingList,
//         configurationItems,
//         close: () => {
//           onAction();
//           props.close();
//         },
//         updateAgent,
//         createAgent,
//       });
//     },
//     [
//       onAction,
//       categoryList,
//       configurationItems,
//       createAgent,
//       groupsList,
//       onHoldReasonList,
//       resolutionCodeList,
//       serviceList,
//       serviceOfferingList,
//       severityList,
//       stateList,
//       subcategoryList,
//       updateAgent,
//       usersList,
//       screenActions,
//       props,
//     ]
//   );

//   const [number, setNumber] = useState("");
//   const [updated, setUpdated] = useState("");
//   const [created, setCreated] = useState("");
//   const [updatedby, setUpdatedBY] = useState("");
//   const [createdby, setCreatedBy] = useState("");
//   const [caller, setCaller] = useState("");
//   const [category, setCategory] = useState("");
//   const [subCategory, setSubCategory] = useState("");
//   const [service, setService] = useState("");
//   const [serviceOffering, setServiceOffering] = useState("");
//   const [configurationItem, setConfigurationItem] = useState("");
//   const [contactType, setContactType] = useState("");
//   const [state, setState] = useState("");
//   const [urgency, setUrgency] = useState("");
//   const [priority, setPriority] = useState("");
//   const [assignmentGroup, setAssignmentGroup] = useState("");
//   const [assignTo, setAssignTo] = useState("");
//   const [shortDescription, setShortDescription] = useState("");
//   const [description, setDescription] = useState("");
//   const [resolutionCode, setResolutionCode] = useState("");
//   const [resolutionNote, setResolutionNote] = useState("");
//   const [workNotes, setWorkNotes] = useState([]);
//   const [onHoldReason, setOnHoldReason] = useState("");
//   const [application, setApplication] = useState({});

//   const onHeaderIconAction = useCallback(
//     (item) => {
//       handleOpenAgent(agent);
//     },
//     [agent, handleOpenAgent]
//   );

//   useEffect(() => {
//     if (agent) {
//       setNumber(agent.number);
//       setUpdated(agent.sys_updated_on);
//       setCreated(agent.sys_created_on);
//       setUpdatedBY(agent.sys_updated_by);
//       setCreatedBy(agent.sys_created_by);
//       setCaller(agent.caller_id?.display_value);
//       setCategory(agent.category);
//       setSubCategory(agent.subcategory);
//       setService(agent.business_service?.display_value);
//       setServiceOffering(agent.service_offering);
//       setConfigurationItem(agent.cmdb_ci?.display_value);
//       setContactType(agent.contact_type);
//       setState(agent.state);
//       setUrgency(agent.urgency);
//       setPriority(agent.priority);
//       setAssignmentGroup(agent.assignment_group?.display_value);
//       setAssignTo(agent.assigned_to?.display_value);
//       setOnHoldReason(agent?.hold_reason);
//       setShortDescription(agent.short_description);
//       setDescription(agent.description);
//       setResolutionCode(agent.close_code);
//       setResolutionNote(agent.close_notes);
//     }
//   }, [agent, groupsList, viewAgent]);

//   const fetchWorkNote = useCallback(() => {
//     agent?.sys_id &&
//       getWorkNoteOfAgent(agent?.sys_id)
//         .then((response) => {
//           setWorkNotes(response.data?.result);
//         })
//         .catch((err) => {
//           console.log(err.response);
//         });
//   }, [agent?.sys_id]);

//   useEffect(() => {
//     fetchWorkNote();
//   }, [fetchWorkNote]);

//   // Handler while closing the the detail screen
//   const onClose = useCallback(() => {
//     screenActions.closeScreen(screenId);
//     props.close();
//   }, [screenActions, screenId, props]);

//   const onMinimize = (a) => {
//     props.close();
//   };

//   return (
//     <DetailScreen
//       title={props.title}
//       onAction={onAction}
//       headerIcons={headerIcons}
//       onHeaderIconAction={onHeaderIconAction}
//       onClose={onClose}
//       onMinimize={onMinimize}
//     >
//       <div className="agent-container">
//         <div className="row">
//           <Card className="col-12">
//             <CardHeader
//               content={{
//                 title: (
//                   <div style={{ fontWeight: "700" }}>
//                     <small>GENERAL IMFORMATION</small>
//                   </div>
//                 ),
//               }}
//             />
//             <CardBody>
//               <div className="row">
//                 <div className="col-lg-1 col-md-2 col-sm-3 col-xs-6">
//                   <div style={{ fontWeight: "700", marginTop: "5px" }}>
//                     NUMBER
//                   </div>
//                   <div style={{ marginTop: "5px" }}>{number}</div>
//                 </div>
//                 <div className="col-lg-2 col-md-2 col-sm-3 col-xs-6">
//                   <div style={{ fontWeight: "700", marginTop: "5px" }}>
//                     ASSIGNMENT GROUP
//                   </div>
//                   <div style={{ marginTop: "5px" }}>{assignmentGroup}</div>
//                 </div>
//                 <div className="col-lg-1 col-md-2 col-sm-3 col-xs-6">
//                   <div style={{ fontWeight: "700", marginTop: "5px" }}>
//                     ASSIGNTO
//                   </div>
//                   <div style={{ marginTop: "5px" }}>{assignTo}</div>
//                 </div>
//                 <div className="col-lg-1 col-md-2 col-sm-3 col-xs-6">
//                   <div style={{ fontWeight: "700", marginTop: "5px" }}>
//                     CONTACT TYPE
//                   </div>
//                   <div style={{ marginTop: "5px" }}>{contactType}</div>
//                 </div>
//                 <div className="col-lg-1 col-md-2 col-sm-3">
//                   <div style={{ fontWeight: "700", marginTop: "5px" }}>
//                     CALLER
//                   </div>
//                   <div style={{ marginTop: "5px" }}>{caller}</div>
//                 </div>
//                 <div className="col-lg-2 col-md-2 col-sm-3 col-xs-6">
//                   <div style={{ fontWeight: "700", marginTop: "5px" }}>
//                     CREATED
//                   </div>
//                   <div style={{ marginTop: "5px" }}>{created}</div>
//                 </div>
//                 <div className="col-lg-1 col-md-2 col-sm-3 col-xs-6">
//                   <div style={{ fontWeight: "700", marginTop: "5px" }}>
//                     CREATED BY
//                   </div>
//                   <div style={{ marginTop: "5px" }}>{createdby}</div>
//                 </div>
//                 <div className="col-lg-2 col-md-2 col-sm-3 col-xs-6">
//                   <div style={{ fontWeight: "700", marginTop: "5px" }}>
//                     UPDATED
//                   </div>
//                   <div style={{ marginTop: "5px" }}>{updated}</div>
//                 </div>
//                 <div className="col-lg-1 col-md-2 col-sm-3 col-xs-6">
//                   <div style={{ fontWeight: "700", marginTop: "5px" }}>
//                     UPDATED BY
//                   </div>
//                   <div style={{ marginTop: "5px" }}>{updatedby}</div>
//                 </div>
//               </div>
//             </CardBody>
//           </Card>
//         </div>
//         <div className="row" style={{ marginTop: "25px" }}>
//           <Card className="col-12">
//             <CardHeader />
//             <CardBody>
//               <div className="row">
//                 <div
//                   className="col-lg-6 col-md-12 col-sm-12 col-xs-12"
//                   style={{ marginTop: "10px" }}
//                 >
//                   <Card>
//                     <CardHeader
//                       content={{
//                         title: (
//                           <div style={{ fontWeight: "700" }}>
//                             <small>AGENT SEVERITY</small>
//                           </div>
//                         ),
//                       }}
//                     />
//                     <CardBody>
//                       <div className="row">
//                         <div className="col-lg-3 col-md-3 col-sm-6 col-xs-12">
//                           <div style={{ fontWeight: "700", marginTop: "5px" }}>
//                             STATE
//                           </div>
//                           <div style={{ marginTop: "5px" }}>
//                             <Icon
//                               type={Icon.TYPE.LIGHTBULB}
//                               theme={getThemeColor("state", state)}
//                               size={Icon.SIZE.MEDIUM_SMALL}
//                             />
//                             <span style={{ paddingLeft: "10px" }}>{state}</span>
//                           </div>
//                         </div>
//                         <div className="col-lg-3 col-md-3 col-sm-6 col-xs-12">
//                           <div style={{ fontWeight: "700", marginTop: "5px" }}>
//                             PRIORITY
//                           </div>
//                           <div style={{ marginTop: "10px" }}>
//                             <Icon
//                               type={Icon.TYPE.ANOMALY_STATE}
//                               theme={getThemeColor("priority", priority)}
//                               size={Icon.SIZE.MEDIUM_SMALL}
//                             />
//                             <span style={{ paddingLeft: "20px" }}>
//                               {priority}
//                             </span>
//                           </div>
//                         </div>
//                         <div className="col-lg-3 col-md-3 col-sm-6 col-xs-12">
//                           <div style={{ fontWeight: "700", marginTop: "5px" }}>
//                             URGENCY
//                           </div>
//                           <div style={{ marginTop: "10px" }}>{urgency}</div>
//                         </div>
//                         <div className="col-lg-3 col-md-3 col-sm-6 col-xs-12">
//                           <div style={{ fontWeight: "700", marginTop: "5px" }}>
//                             ON HOLD REASON
//                           </div>
//                           <div style={{ marginTop: "10px" }}>
//                             {onHoldReason}
//                           </div>
//                         </div>
//                       </div>
//                     </CardBody>
//                   </Card>
//                 </div>

//                 <div
//                   className="col-lg-6 col-md-12 col-sm-12 col-xs-12"
//                   style={{ marginTop: "10px" }}
//                 >
//                   <Card>
//                     <CardHeader
//                       content={{
//                         title: (
//                           <div style={{ fontWeight: "700" }}>
//                             <small>TerraformCloud INFORMATION</small>
//                           </div>
//                         ),
//                       }}
//                     />
//                     <CardBody>
//                       <div className="row">
//                         <div className="col-lg-4 col-md-4 col-sm-6 col-xs-12">
//                           <div style={{ fontWeight: "700", marginTop: "5px" }}>
//                             LINK
//                           </div>
//                           <div style={{ marginTop: "10px" }}>
//                             <Link
//                               href={application.deep_link}
//                               target="_blank"
//                               rel="noopener noreferrer"
//                             >
//                               Open TerraformCloud &nbsp;
//                               <Icon
//                                 size={Icon.SIZE.XSMALL}
//                                 type={Icon.TYPE.JUMP_OUT}
//                               />
//                             </Link>
//                           </div>
//                         </div>
//                         <div className="col-lg-4 col-md-4 col-sm-6 col-xs-12">
//                           <div style={{ fontWeight: "700", marginTop: "5px" }}>
//                             APPLICATION NAME
//                           </div>
//                           <div style={{ marginTop: "10px" }}>
//                             {application.label}
//                           </div>
//                         </div>
//                       </div>
//                     </CardBody>
//                   </Card>
//                 </div>
//               </div>
//             </CardBody>
//           </Card>
//         </div>

//         <div className="row" style={{ marginTop: "25px" }}>
//           <Card className="col-12">
//             <CardHeader
//               content={{
//                 title: (
//                   <div style={{ fontWeight: "700" }}>
//                     <small>OVERVIEW</small>
//                   </div>
//                 ),
//               }}
//             />
//             <CardBody>
//               <div className="row">
//                 <div
//                   className="col-lg-4 col-md-4 col-sm-12 col-xs-12"
//                   style={{ marginTop: "10px" }}
//                 >
//                   <Card>
//                     <CardHeader
//                       content={{
//                         title: (
//                           <div style={{ fontWeight: "700" }}>
//                             <small>CATEGORIZATION</small>
//                           </div>
//                         ),
//                       }}
//                     />
//                     <CardBody style={{ paddingLeft: "0" }}>
//                       <div className="row">
//                         <div className="col-lg-6 col-md-6 col-sm-6 col-xs-12">
//                           <div style={{ fontWeight: "700", marginTop: "7px" }}>
//                             CATEGORY
//                           </div>
//                           <div style={{ marginTop: "5px" }}>{category}</div>
//                         </div>
//                         <div className="col-lg-6 col-md-6 col-sm-6 col-xs-12">
//                           <div style={{ fontWeight: "700", marginTop: "7px" }}>
//                             SUB CATEGORY
//                           </div>
//                           <div style={{ marginTop: "5px" }}>{subCategory}</div>
//                         </div>
//                         <div className="col-lg-6 col-md-6 col-sm-6 col-xs-12">
//                           <div style={{ fontWeight: "700", marginTop: "7px" }}>
//                             SERVICE
//                           </div>
//                           <div style={{ marginTop: "5px" }}>{service}</div>
//                         </div>
//                         <div className="col-lg-6 col-md-6 col-sm-6 col-xs-12">
//                           <div style={{ fontWeight: "700", marginTop: "7px" }}>
//                             SERVICE OFFERING
//                           </div>
//                           <div style={{ marginTop: "5px" }}>
//                             {serviceOffering}
//                           </div>
//                         </div>
//                         <div className="col-lg-6 col-md-6 col-sm-6 col-xs-12">
//                           <div style={{ fontWeight: "700", marginTop: "7px" }}>
//                             CONFIGURATION ITEM
//                           </div>
//                           <div style={{ marginTop: "5px" }}>
//                             {configurationItem}
//                           </div>
//                         </div>
//                       </div>
//                     </CardBody>
//                   </Card>
//                 </div>

//                 <div
//                   className="col-lg-8 col-md-8 col-sm-12 col-xs-12"
//                   style={{ marginTop: "10px" }}
//                 >
//                   <Card>
//                     <CardHeader
//                       content={{
//                         title: (
//                           <div style={{ fontWeight: "700" }}>
//                             <small>AGENT DESCRIPTION</small>
//                           </div>
//                         ),
//                       }}
//                     />
//                     <CardBody style={{ paddingLeft: "0" }}>
//                       <div className="row" style={{ marginLeft: "1px" }}>
//                         <div>
//                           <span style={{ fontWeight: "700", marginTop: "5px" }}>
//                             SHORT DESCRIPTION:
//                           </span>{" "}
//                           {shortDescription}
//                         </div>
//                       </div>
//                       <div
//                         className="row"
//                         style={{ marginTop: "7px", marginLeft: "1px" }}
//                       >
//                         <div>
//                           <span style={{ fontWeight: "700", marginTop: "5px" }}>
//                             DESCRIPTION:
//                           </span>
//                         </div>
//                       </div>
//                       <div style={{ marginTop: "7px", marginLeft: "1px" }}>
//                         <div>
//                           <textarea
//                             disabled={true}
//                             style={{ width: "100%", height: "70px" }}
//                             value={description}
//                           >
//                             {description}
//                           </textarea>
//                         </div>
//                       </div>
//                       <div
//                         className="row"
//                         style={{ marginTop: "7px", marginLeft: "1px" }}
//                       >
//                         <div>
//                           <span style={{ fontWeight: "700" }}>
//                             {" "}
//                             RESOLUTION CODE:
//                           </span>{" "}
//                           {resolutionCode}
//                         </div>
//                       </div>
//                       <div
//                         className="row"
//                         style={{ marginTop: "7px", marginLeft: "1px" }}
//                       >
//                         <div>
//                           <span style={{ fontWeight: "700" }}>
//                             RESOLUTION NOTES:
//                           </span>{" "}
//                           {resolutionNote}
//                         </div>
//                       </div>
//                     </CardBody>
//                   </Card>
//                 </div>
//               </div>
//             </CardBody>
//           </Card>
//         </div>

//         <div className="row" style={{ marginTop: "25px" }}>
//           <Card className="col-12">
//             <CardHeader
//               content={{
//                 title: (
//                   <div style={{ fontWeight: "700" }}>
//                     <small>ACTIVITIES</small>
//                   </div>
//                 ),
//               }}
//             />
//             <CardBody>
//               <div className="col-12">
//                 {workNotes &&
//                   workNotes.map((item) => (
//                     <div className="row" style={{ marginTop: "25px" }}>
//                       <Card className="col-12">
//                         <CardHeader
//                           key="cisco-card-3"
//                           cardAlignment={Card.ALIGNMENT.RIGHT}
//                           content={{
//                             title: (
//                               <div style={{ fontWeight: "700" }}>
//                                 <small>{item.update_time}</small>
//                               </div>
//                             ),
//                           }}
//                         />
//                         <CardBody>
//                           <div className="row" style={{ fontWeight: "700" }}>
//                             <div
//                               style={{ fontWeight: "700", marginLeft: "10px" }}
//                             >
//                               {item.user_name}:
//                             </div>
//                           </div>
//                           {item.field === "work_notes" ? (
//                             <div style={{ marginTop: "10px" }}>{item.new}</div>
//                           ) : (
//                             <div className="row mt-10">
//                               <div className="col">
//                                 <b>LABEL</b>
//                                 <div>{item.label}</div>
//                               </div>
//                               <div className="col">
//                                 <b>OLD</b>
//                                 <div>{item.old ? item.old : "-"}</div>
//                               </div>
//                               <div className="col">
//                                 <b>NEW</b>
//                                 <div>{item.new ? item.new : "-"}</div>
//                               </div>
//                             </div>
//                           )}
//                         </CardBody>
//                       </Card>
//                     </div>
//                   ))}
//               </div>
//             </CardBody>
//           </Card>
//         </div>
//       </div>
//     </DetailScreen>
//   );
// }

// export default AgentView;
