import axios from "axios";

axios.defaults.baseURL = "/appcenter/cisco/terraform/api";
axios.defaults.withCredentials = true;

function fetchAgents() {
  return axios.get("/v1/agents");
}

function createAgent(payload) {
  return axios.post("/v1/agents", payload);
}

function deleteAgent(name) {
  return axios.delete("/v1/agents/"+ name );
}

function fetchOrganizations() {
  return axios.get("/v1/organizations");
}

function fetchAgentPools(organization) {
  return axios.get(`/v1/organization/${organization}/agentpools`, organization);
}

function createAgentPool(payload) {
  return axios.post("/v1/agentpools", payload);
}
function fetchAuthenticationToken() {
  return axios.get("/v1/credentials/terraform");
}

function createAuthenticationToken(payload) {
  return axios.post("/v1/credentials", payload);
}

export {
  fetchAgents,
  createAgent,
  deleteAgent,
  fetchOrganizations,
  fetchAgentPools,
  createAgentPool,
  fetchAuthenticationToken,
  createAuthenticationToken,
};
