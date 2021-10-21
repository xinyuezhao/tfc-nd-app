import React, { useState, useEffect } from "react";
import cryptoRandomString from "crypto-random-string";
import sha256 from "crypto-js/sha256";
import Base64 from "crypto-js/enc-base64";
import {
  Button,
  Input,
  PasswordInput,
  HelpBlock,
  DangerAlert,
  Card,
  CardBody,
  Switch,
} from "blueprint-react";

import {
  getAccessTokenPKCE,
  getAccessTokenPassword,
  isUserLogin,
} from "../service/api_service";
import { pathPrefix } from "../App";
// import "./style.scss";
import { checkForTernary, checkComponentRender } from "../shared/utils";

function LoginPage(props) {
  const [loginType, setLoginType] = useState("TerraformCloud");
  const [warningAlert, setWarningAlert] = useState("");
  const [instanceUrl, setInstanceUrl] = useState("");
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [showError, setShowError] = useState(false);
  const [dangerAlert, setDangerAlert] = useState("");

  useEffect(() => {
    if (warningAlert || dangerAlert) {
      setTimeout(() => {
        setWarningAlert("");
        setDangerAlert("");
      }, 5000);
    }
  }, [warningAlert, dangerAlert]);

  const getAlertMessage = (responseMessage) => {
    const messageMapping = {
      "Required to login":
        "You are not logged in with System, Please Login first",
      "User Not Authenticated":
        "Client credentials or User credentials changed. Please re-login.",
      server_error: "Current session has expired. Please re-login.",
    };

    return messageMapping[responseMessage];
  };

  useEffect(() => {
    const payload = {
      nd_url: window.location.origin,
    };
    isUserLogin(payload)
      .then((response) => {
        if (response.status === 200) {
          localStorage.setItem("login_type", response.data.login_mechanism);
          localStorage.setItem(
            "instance_url",
            response.data.terraformcloud_instance_url
          );
          props.history.push(pathPrefix + "/dashboard");
        }
      })
      .catch((err) => {
        err.response?.status === 401 &&
          props.history.location?.state?.sessionExpired &&
          setWarningAlert(getAlertMessage(err.response?.data?.detail?.message));
      });
  }, [props.history]);

  useEffect(() => {
    let query = new URLSearchParams(props.history.location.search);
    const code = query.get("code");
    const state = query.get("state");
    const instance_url = localStorage.getItem("instance_url");
    const client_id = localStorage.getItem("client_id");
    const client_secret = localStorage.getItem("client_secret");

    if (code && state && instance_url && client_id && client_secret) {
      setInstanceUrl(instance_url);
      setClientId(client_id);
      setClientSecret(client_secret);
      const payload = {
        terraformcloud_instance_url: instanceUrl?.trim(),
        client_id: clientId?.trim(),
        client_secret: clientSecret?.trim(),
        state,
        code,
        code_verifier: localStorage.getItem("code_verifier"),
        redirect_uri: window.location.origin + window.location.pathname,
      };
      instanceUrl &&
        clientId &&
        clientSecret &&
        getAccessTokenPKCE(payload)
          .then((res) => {
            res.status === 200 && props.history.push(pathPrefix + "/dashboard");
            localStorage.removeItem("client_id");
            localStorage.removeItem("client_secret");
            localStorage.removeItem("code_verifier");
          })
          .catch((err) => {
            err.response?.status === 401 &&
              setWarningAlert("Invalid Credentials, Please try again");
            localStorage.removeItem("instance_url");
            localStorage.removeItem("client_id");
            localStorage.removeItem("client_secret");
            localStorage.removeItem("login_type");
            localStorage.removeItem("code_verifier");
          });
    }
  }, [clientId, instanceUrl, clientSecret, props.history]);

  const submitAction = () => {
    const list = [];
    if (
      instanceUrl.trim() === "" ||
      clientId.trim() === "" ||
      clientSecret.trim() === "" ||
      (loginType === "Shared User" &&
        (userName.trim() === "" || password.trim() === ""))
    ) {
      instanceUrl.trim() === "" && list.push("Instance URL");
      clientId.trim() === "" && list.push("Client ID");
      clientSecret.trim() === "" && list.push("Client Secret");
      loginType === "Shared User" &&
        userName.trim() === "" &&
        list.push("User Name");
      loginType === "Shared User" &&
        password.trim() === "" &&
        list.push("Password");
      setShowError(true);
      setDangerAlert(
        "The following mandatory fields are not filled: " + list.join(", ")
      );
    } else {
      localStorage.setItem("instance_url", instanceUrl.trim());
      localStorage.setItem("client_id", clientId.trim());
      localStorage.setItem("client_secret", clientSecret.trim());
      localStorage.setItem("login_type", loginType);
      if (loginType === "Shared User") {
        const payload = {
          terraformcloud_instance_url: instanceUrl.trim(),
          client_id: clientId.trim(),
          client_secret: clientSecret.trim(),
          username: userName.trim(),
          password: password.trim(),
          nd_instance_url: window.location.origin,
        };
        getAccessTokenPassword(payload)
          .then((res) => {
            res.status === 200 && props.history.push(pathPrefix + "/dashboard");
          })
          .catch((err) => {
            err.response?.status === 401 &&
              setWarningAlert("Invalid Credentials, Please try again");
          });
      } else if (loginType === "TerraformCloud") {
        const redirectURL = window.location.origin + window.location.pathname;
        const codeVerifier = cryptoRandomString({ length: 128 });
        localStorage.setItem("code_verifier", codeVerifier);
        const codeChallenge = sha256(codeVerifier)
          .toString(Base64)
          .replaceAll("/", "_")
          .replaceAll("+", "-")
          .replaceAll("=", "");
        const urlToRedirect = `${instanceUrl.trim()}/oauth_auth.do?response_type=code&redirect_uri=${redirectURL}&state=2&code_challenge=${codeChallenge}&code_challenge_method=S256&client_id=${clientId.trim()}`;
        window.location.assign(urlToRedirect);
      }
    }
  };

  return (
    <div className="login-dark-background">
      <div className="row">
        <div className="col-xl-12">
          <div className="section">
            <h2 style={{ fontWeight: "350" }}>Login</h2>
          </div>
        </div>
      </div>
      {checkComponentRender(
        warningAlert,
        <div className="alert-handler">
          <DangerAlert dismissHandler={() => setWarningAlert("")}>
            <div className="alert-box"> {warningAlert}</div>
          </DangerAlert>
        </div>
      )}
      {checkComponentRender(
        dangerAlert,
        <div className="alert-handler">
          <DangerAlert dismissHandler={() => setDangerAlert("")}>
            <div className="alert-box"> {dangerAlert}</div>
          </DangerAlert>
        </div>
      )}
      <Card className="login-form-container">
        <CardBody>
          <div className="login-form">
            <div className="row">
              <div className="col-4"></div>
              <div className="col-8">Authentication Type</div>
            </div>
            <div className="row p-10">
              <div className="col-4"></div>
              <div className="col-8">
                <Switch
                  key="s-1"
                  layout={Switch.LAYOUT.INLINE}
                  label="Shared User"
                  onChange={(_, value) => {
                    value.checked
                      ? setLoginType("Shared User")
                      : setLoginType("TerraformCloud");
                  }}
                />
              </div>
            </div>

            <div className="row p-10">
              <div className="col-4"></div>
              <div className="col-4">
                <Input
                  type={Input.TYPE.TEXT}
                  label="Instance URL"
                  onChange={(e) => setInstanceUrl(e.target.value)}
                  value={instanceUrl}
                  required
                  help={{
                    type: checkForTernary(
                      showError && instanceUrl.trim() === "",
                      HelpBlock.TYPE.ERROR,
                      HelpBlock.TYPE.INFO
                    ),
                  }}
                />
              </div>
            </div>

            <div className="row p-10">
              <div className="col-4"></div>
              <div className="col-4 ">
                <Input
                  type={Input.TYPE.TEXT}
                  label="Client ID"
                  onChange={(e) => setClientId(e.target.value)}
                  value={clientId}
                  required
                  help={{
                    type: checkForTernary(
                      showError && clientId.trim() === "",
                      HelpBlock.TYPE.ERROR,
                      HelpBlock.TYPE.INFO
                    ),
                  }}
                />
              </div>
            </div>
            <div className="row p-10">
              <div className="col-4"></div>
              <div className="col-4">
                <PasswordInput
                  label="Client Secret"
                  onChange={(e) => setClientSecret(e.target.value)}
                  value={clientSecret}
                  required
                  help={{
                    type: checkForTernary(
                      showError && clientSecret.trim() === "",
                      HelpBlock.TYPE.ERROR,
                      HelpBlock.TYPE.INFO
                    ),
                  }}
                />
              </div>
            </div>
            {checkComponentRender(
              loginType === "Shared User",
              <>
                <div className="row p-10">
                  <div className="col-4"></div>
                  <div className="col-4">
                    <Input
                      type={Input.TYPE.TEXT}
                      label="User Name"
                      onChange={(e) => setUserName(e.target.value)}
                      value={userName}
                      required
                      help={{
                        type: checkForTernary(
                          showError && userName.trim() === "",
                          HelpBlock.TYPE.ERROR,
                          HelpBlock.TYPE.INFO
                        ),
                      }}
                    />
                  </div>
                </div>
                <div className="row p-10">
                  <div className="col-4"></div>
                  <div className="col-4">
                    <PasswordInput
                      label="Password"
                      onChange={(e) => setPassword(e.target.value)}
                      value={password}
                      required
                      help={{
                        type: checkForTernary(
                          showError && password.trim() === "",
                          HelpBlock.TYPE.ERROR,
                          HelpBlock.TYPE.INFO
                        ),
                      }}
                    />
                  </div>
                </div>
              </>
            )}
            <div className="row p-10">
              <div className="col-4"></div>
              <div className="col-4 submit-button">
                <Button
                  className="login-button"
                  onAction={submitAction}
                  type={Button.TYPE.PRIMARY_GHOST}
                >
                  Submit
                </Button>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

export default LoginPage;
