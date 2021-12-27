import axios from "axios";

axios.defaults.baseURL = "/sedgeapi/v1/cisco-terraform";
axios.defaults.withCredentials = true;

function fetchAgents(limit = 50, offset = 0, query = "", agent_id = "") {
  return axios.get("/agentmgr/api/terraform.argo.cisco.com/v1/agents", {
    params: { limit, offset, query, agent_id },
  });
}

function createAgents(payload) {
  return axios.post("/agentmgr/api/terraform.argo.cisco.com/v1/agents", payload);
}

// function updateAgents(sys_id, payload) {
//   return axios.put("/agents/?sys_id=" + sys_id, payload);
// }

function deleteAgents(description) {
  console.log("description in api: ", description);
  // console.log("API is ", axios.delete("/argome.argo.cisco.com/v1/agents/", { params: description })); //.../agents/?0=agent2
  // console.log("API is ", axios.delete("/argome.argo.cisco.com/v1/agents/?description"+ description )); //agents/?descriptionagent2=
  // console.log("API is ", axios.delete("/argome.argo.cisco.com/v1/agents/?"+ description )); ///?agent2=
  // console.log("API is ", axios.delete("/argome.argo.cisco.com/v1/agents/", { params: {description},} )); //../agents/?description[]=test agent without token,agent3
  return axios.delete("/agentmgr/api/terraform.argo.cisco.com/v1/agents/"+ description );
}

function fetchOrganizations() {
  return axios.get("/organizationmgr/api/terraform.argo.cisco.com/v1/organizations");
}

function fetchAgentPools(organization) {
  return axios.get("/agentpoolmgr/api/terraform.argo.cisco.com/v1/agentpoolList/" +organization);
}

function createAgentPool(payload) {
  return axios.post("/agentpoolmgr/api/terraform.argo.cisco.com/v1/agentpools", payload);
}
// function getAccessToken(payload) {
//   return axios.post("/gettoken", payload);
// }

// function refreshAccessToken(payload) {
//   return axios.post("/refreshtoken", payload);
// }


// function isUserLogin(payload) {
//   return axios.post("/auth/is_current_user", payload);
// }

// function logout() {
//   return axios.get("/auth/logout");
// }

export {
  fetchAgents,
  createAgents,
  // updateAgents,
  deleteAgents,
  fetchOrganizations,
  fetchAgentPools,
  createAgentPool,
  // getAccessToken,
  // refreshAccessToken,
  // isUserLogin,
  // logout,
};
