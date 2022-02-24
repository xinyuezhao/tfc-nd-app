import axios from "axios";

axios.defaults.baseURL = "/appcenter/cisco/terraform/api";
axios.defaults.withCredentials = true;

function fetchAgents(limit = 50, offset = 0, query = "", agent_id = "") {
  return axios.get("/agent/v1/agents", {
    params: { limit, offset, query, agent_id },
  });
}

function createAgent(payload) {
  return axios.post("/agent/v1/agents", payload);
}


function deleteAgent(name) {
  return axios.delete("/agent/v1/agents/"+ name );
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
  createAgent,
  deleteAgent,
  fetchOrganizations,
  fetchAgentPools,
  createAgentPool,
  fetchAuthenticationToken,
  createAuthenticationToken,
  // isUserLogin,
  // logout,
};
