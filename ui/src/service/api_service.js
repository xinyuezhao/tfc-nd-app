import axios from "axios";

axios.defaults.baseURL = "/appcenter/cisco/terraform/api";
axios.defaults.withCredentials = true;

function fetchAgents(limit = 50, offset = 0, query = "", agent_id = "") {
  return axios.get("/agent/v1/agents", {
    params: { limit, offset, query, agent_id },
  });
}

function createAgents(payload) {
  return axios.post("/agent/v1/agents", payload);
}


function deleteAgents(description) {
  console.log("description in api: ", description);
  // console.log("API is ", axios.delete("/argome.argo.cisco.com/v1/agents/", { params: description })); //.../agents/?0=agent2
  // console.log("API is ", axios.delete("/argome.argo.cisco.com/v1/agents/?description"+ description )); //agents/?descriptionagent2=
  // console.log("API is ", axios.delete("/argome.argo.cisco.com/v1/agents/?"+ description )); ///?agent2=
  // console.log("API is ", axios.delete("/argome.argo.cisco.com/v1/agents/", { params: {description},} )); //../agents/?description[]=test agent without token,agent3
  return axios.delete("/agent/v1/agents/"+ description );
}

function fetchOrganizations() {
  return axios.get("/organization/v1/organizations");
}

function fetchAgentPools(organization) {
  return axios.get("/agentpool/v1/agentpoolList/" +organization);
}

function createAgentPool(payload) {
  return axios.post("/agentpool/v1/agentpools", payload);
}
function fetchAuthenticationToken() {
  return axios.get("/credentials/v1/credentials/terraform");
}

function createAuthenticationToken(payload) {
  return axios.post("/credentials/v1/credentials", payload);
}

// function isUserLogin(payload) {
//   return axios.post("/auth/is_current_user", payload);
// }

// function logout() {
//   return axios.get("/auth/logout");
// }

export {
  fetchAgents,
  createAgents,
  deleteAgents,
  fetchOrganizations,
  fetchAgentPools,
  createAgentPool,
  fetchAuthenticationToken,
  createAuthenticationToken,
  // isUserLogin,
  // logout,
};
