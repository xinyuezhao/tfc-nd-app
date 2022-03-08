import React,{useState, useCallback} from 'react';

import {
  DetailScreen,
  Input,
  Panel,
  Cards,
  MoreLessPanel,
  InfoAlert,
  useScreenActions,
} from 'blueprint-react';
import './CiscoObjectPicker.scss';
import { createAuthenticationToken } from "../service/api_service";

/**
 * Authentication Token component gives user an option to either use the user authentication token from HasiCorp Terraform cloud or not.
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
  const action = useScreenActions();

  let applyButtonProps = {};

  const handleCreateAuthenticationToken = useCallback((userToken) => {
    const payload = {
      "spec": {
        "name": "terraform",
        "token": userToken
      }
    }
    createAuthenticationToken(payload)
      .then((res) => {
        setSuccessAlert("Configured Token Successfully", res.data.configured);
        refreshAuthConfig();
      })
      .catch((error) => {
        console.log(error);
        setInfoAlert("");
        setSuccessAlert("");
        error.response?.data?.detail?.detail &&
          setWarningAlert(error.response?.data?.detail?.detail);
      });
  }, [refreshAuthConfig]);


  const authTokenScreenOnAction = useCallback(() => {
    handleCreateAuthenticationToken(userToken);
    screenActions.closeScreen("authentication-token");
  }, [userToken, screenActions, handleCreateAuthenticationToken]);

  let cards =[
    {
      headerContent: {
        title: <h4 className="qtr-padding-bottom">Terraform API access</h4>,
        subtitle: <MoreLessPanel
          key="more-less-1a"
          persistCollapsed={true}
          collapsedLines={4}
          moreIndicatorStyle={MoreLessPanel.MORE_INDICATOR_STYLE.ELLIPSES}>
          <div className="text-medium" style={{lineHeight: "20px !important"}}>
            By providing a User Authentication Token, Nexus Dashboard users will be able to create agents without
            needing to provide a unique Terraform Cloud Agent Token for each agent deployed.
            The Nexus Dashboard Connector for Terraform will automatically create the required configuration on
            Terraform Cloud and will also be able to display usage statistics about your subscription.
          </div>
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
          <div className="text-medium" style={{lineHeight: "20px !important"}}>
            A Terraform Cloud Agent Token will need to be provided for every agent deployed through the
            Nexus Dashboard Connector for Terraform and we will display only local information on the
            status of the deployed agents.
          </div>
        </MoreLessPanel>,
      },
      uid: 'token-absent',
      selected: !selectedToken,
    }
  ];

  if((selectedToken && !userToken)){
    applyButtonProps = {disabled: true};
  }

  return (
    <DetailScreen
      onAction={authTokenScreenOnAction}
      title={"Connector for Terraform  - Setup"}
      applyButtonLabel={"Save"}
      applyButtonProps={applyButtonProps}
    >
    <div style={{ paddingLeft: "10%", paddingRight: "10%" }}>
      <div className="dbl-padding-bottom dbl-padding-top dbl-padding-left">
        <h1>
          Let's Configure the basics
        </h1>
        <div className=" base-padding-top text-muted text-large">
          There are a few things you need to configure before you get started with Nexus Dashboard Connector for Terraform
        </div>
      </div>
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
              title="Alert Title"
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
            <div className="cards__header no-padding-left dbl-padding-bottom" style={{paddingRight: "75%"}}>
              <Input required=""
                value={userToken}
                onChange={(e) => setUserToken(e.target.value)}
              />
            </div>
          </div>
        }
      </Panel>
    </div>
    </DetailScreen>
  );

}

export default AuthenticationToken;
