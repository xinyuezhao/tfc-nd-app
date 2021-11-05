import axios from "axios";

axios.defaults.baseURL = "";
axios.defaults.withCredentials = true;

function fetchAgents(limit = 50, offset = 0, query = "", agent_id = "") {
  return axios.get("/sedgeapi/v1/cisco-argome/agentpoolmgr/api/argome.argo.cisco.com/v1/agents", {
    params: { limit, offset, query, agent_id },
  });
}

function fetchComments(payload) {
  return axios.get("/comments", { params: payload });
}

function createAgents(payload) {
  return axios.post("/agents/", payload);
}

function updateAgents(sys_id, payload) {
  return axios.put("/agents/?sys_id=" + sys_id, payload);
}

function deleteAgents(sys_id) {
  return axios.delete("/agents/?sys_id=" + sys_id);
}

function getAccessToken(payload) {
  return axios.post("/gettoken", payload);
}

function refreshAccessToken(payload) {
  return axios.post("/refreshtoken", payload);
}

function getAccessTokenPKCE(payload) {
  return axios.post("/auth/generate_token_pkce", payload);
}

function getAccessTokenPassword(payload) {
  return axios.post("/auth/generate_token_password_flow", payload);
}

function isUserLogin(payload) {
  return axios.post("/auth/is_current_user", payload);
}

function getMetaData(force = false) {
  const isForceSync = force ? "?expiry=1" : "";
  return axios.get("/metadata/" + isForceSync);
}

function getUsersData() {
  return axios.get("/metadata/users");
}

function deleteAgentsInBulk(payload) {
  return axios.delete("/agents/multiple_agents", { data: payload });
}

function getGroups() {
  return axios.get("/metadata/groups");
}

function getGroupMembers(group_id) {
  return axios.get("/metadata/groupmembers?group_id=" + group_id);
}

function assignAgentsInBulk(payload) {
  return axios.put("/agents/update_assigned_to", payload);
}

function getServices() {
  return axios.get("/metadata/services");
}

function getServiceOffering() {
  return axios.get("/metadata/service_offering");
}

function getConfigurationItem() {
  return axios.get("/metadata/configuration_items");
}

function getPriorityStats(fromDate, toDate) {
  return axios.get("/agents/category", {
    params: { start_date: fromDate, end_date: toDate },
  });
}

function getStateWiseStats(fromDate, toDate) {
  return axios.get("/agents/state", {
    params: { start_date: fromDate, end_date: toDate },
  });
}

function getWorkNoteOfAgent(sys_id) {
  return axios.get("/agents/activities?agent_id=" + sys_id);
}

function logout() {
  return axios.get("/auth/logout");
}

export {
  fetchAgents,
  fetchComments,
  updateAgents,
  deleteAgents,
  getAccessToken,
  refreshAccessToken,
  getAccessTokenPKCE,
  getAccessTokenPassword,
  createAgents,
  getMetaData,
  getUsersData,
  deleteAgentsInBulk,
  getGroups,
  getGroupMembers,
  assignAgentsInBulk,
  isUserLogin,
  getServices,
  getServiceOffering,
  getConfigurationItem,
  getPriorityStats,
  getStateWiseStats,
  getWorkNoteOfAgent,
  logout,
};
