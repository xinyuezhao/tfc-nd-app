import React,{useState, useCallback} from 'react';

import {
  DetailScreen,
  Input,
  Panel,
  Cards,
  MoreLessPanel,
  InfoAlert,
} from 'blueprint-react';
import './CiscoObjectPicker.scss';
import { createCredentials } from "../service/api_service";

/**
 * Authentication Token component gives user an option to either use the user authentication token from HashiCorp Terraform cloud or not.
 * By selecting the user authentication token option, the token is implicitly added during agent creation.
 * By selecting no token option, the user has to explicitly specify the token during agent creation.
 */

function AuthenticationToken(props) {
  const {
    screenActions,
    authConfig,
    refreshAuthConfig,
  } = props;


  let defaultUserToken = "";
  let defaultSelectedToken = true;

  if (authConfig) {
    if(authConfig.configured){
      if(authConfig.tokenExist){
        defaultSelectedToken = true;
        defaultUserToken = authConfig.token;
      }
      else{
        defaultSelectedToken = false;
      }
    }
  }

  const [userToken, setUserToken] = useState(defaultUserToken);
  const [selectedToken, setSelectedToken] = useState(defaultSelectedToken);
  const [warningAlert, setWarningAlert] = useState("");
  const [infoAlert, setInfoAlert] = useState("");
  const [successAlert, setSuccessAlert] = useState("");
  let applyButtonProps = {};

  const handleCreateCredentials = useCallback((userToken) => {
    const payload = {
      "spec": {
        "name": "terraform",
        "token": userToken
      }
    }
    createCredentials(payload)
      .then((res) => {
        setSuccessAlert("Configured Authentication Successfully", res.data.configured);
        refreshAuthConfig();
      })
      .catch((error) => {
        console.error("Authentication was not configured.", error);
        setInfoAlert("");
        setSuccessAlert("");
        error.response?.data?.detail?.detail &&
          setWarningAlert(error.response?.data?.detail?.detail);
      });
  }, [refreshAuthConfig]);


  const handleAuthTokenScreenOnAction = useCallback(() => {
    handleCreateCredentials(userToken);
    screenActions.closeScreen("authentication-token");
  }, [userToken, screenActions, handleCreateCredentials]);

  let cards = [
    {
      headerContent: {
        title: <h4 className="qtr-padding-bottom">Terraform API access</h4>,
        subtitle: <MoreLessPanel
          key="more-less-1a"
          persistCollapsed={true}
          collapsedLines={4}
          moreIndicatorStyle={MoreLessPanel.MORE_INDICATOR_STYLE.ELLIPSES}>
            By providing a User Authentication Token, Nexus Dashboard users will be able to create agents without
            needing to provide a unique Terraform Cloud Agent Token for each agent deployed.
            The Nexus Dashboard Connector for Terraform will automatically create the required configuration on
            Terraform Cloud and will also be able to display usage statistics about your subscription.
        </MoreLessPanel>,
      },
      uid: 'token-present',
      selected: selectedToken,
    },
    {
      headerContent: {
        title: <h4 className="qtr-padding-bottom">No Terraform API access</h4>,
        subtitle: <MoreLessPanel
          key="more-less-1a"
          persistCollapsed={true}
          collapsedLines={4}
          moreIndicatorStyle={MoreLessPanel.MORE_INDICATOR_STYLE.ELLIPSES}>
            A Terraform Cloud Agent Token will need to be provided for every agent deployed through the
            Nexus Dashboard Connector for Terraform and we will display only local information on the
            status of the deployed agents.
        </MoreLessPanel>,
      },
      uid: 'token-absent',
      selected: !selectedToken,
    }
  ];

  if ((selectedToken && !userToken) && userToken === ""){
    applyButtonProps = {disabled: true};
  } else if (userToken.startsWith("*")){
      applyButtonProps = {disabled: true};
  }

  return (
    <DetailScreen
    className="bg-color-gray"
      onAction={handleAuthTokenScreenOnAction}
      title={"Connector for Terraform - Setup"}
      applyButtonLabel={"Save"}
      applyButtonProps={applyButtonProps}
    >
    <div className="div_padding_right div_padding_left">
      <div className="dbl-padding-bottom dbl-padding-top dbl-padding-left">
        <h1>
          Let's Configure the basics
        </h1>
        <div className=" base-padding-top text-muted text-large">
          There are a few things you need to configure before you get
          started with the Nexus Dashboard Connector for Terraform.
        </div>
      </div>
      <div className="bg-color-gray qtr-padding">
        <Panel border={Panel.BORDER.ALL} padding={Panel.PADDING.NONE}>
          <div className="cards__header text-large">Connection Type</div>
          <Cards
            selectionMode={Cards.SELECTION_MODE.SINGLE}
            selectionControl={Cards.SELECTION_CONTROL.COMPONENT}
            groupName="cards-criteria-group-single-name-00"
            styles={{
              cardsContainer: {
                display: 'grid',
                gridTemplateColumns: 'auto auto auto'
              }
            }}
            cards={cards}
            onChange={(s) => {
              if(s["token-present"]["selected"] === true && s["token-absent"]["selected"] === false) {
                setSelectedToken(true);
              }
              else {
                setSelectedToken(false);
                setUserToken("");
              }
            } }
          />
          {!selectedToken ? null
            : <div className="cards__header">
              <InfoAlert
                children={<div>To generate a Terraform Cloud User Token to use with the Nexus Dashboard Connector for
                Terraform, see: <a
                href="https://www.terraform.io/cloud-docs/users-teams-organizations/users#api-tokens" target="_blank" rel="noreferrer">
                https://www.terraform.io/cloud-docs/users-teams-organizations/users#api-tokens</a>.
                <br />
                <br />
                <i>Note:</i> We recommend the creation of a dedicated user account for the integration as this will allow you
                to limit which organizations the Nexus Dashboard Connector for Terraform is able to interact with.</div>}
              />
              <div className="cards__header no-padding-left dbl-padding-top text-large" >Authentication Token
                <span className="text-danger qtr-padding-left icon-">*</span>
              </div>
              <div className="cards__header no-padding-left dbl-padding-bottom div_padding_right_75">
                <Input required=""
                  value={userToken}
                  onChange={(e) => setUserToken(e.target.value)}
                />
              </div>
            </div>
          }
        </Panel>
      </div>
    </div>
    </DetailScreen>
  );

}

export default AuthenticationToken;
