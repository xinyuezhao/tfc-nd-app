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
import { Link } from 'react-router-dom';

/**
 * Add what this component does and add the desc for other components too
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
        setSuccessAlert("Configured Token Successfully");
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

  const displayTokenInput = () => {
    setSelectedToken(true);
  }

  const hideTokenInput = () => {
    setSelectedToken(false);
    setUserToken("");
  }

  let cards =[
    {
      headerContent: {
        title: 'Terraform API access',
        subtitle: <MoreLessPanel
          key="more-less-1a"
          persistCollapsed={true}
          collapsedLines={2}
          moreIndicatorStyle={MoreLessPanel.MORE_INDICATOR_STYLE.ELLIPSES}>
          By providing a User Authentication Token, Nexus Dashboard users will be able to create agents without
          needing to provide a unique Terraform Cloud Agent Token for each agent deployed.
          The Nexus Dashboard Connector for Terraform will automatically create the required configuration on
          Terraform Cloud and will also be able to display usage statistics about your subscription.
        </MoreLessPanel>,
      },
      uid: 'token-present',
      // onAction: displayTokenInput,
      selected: selectedToken,
    },
    {
      headerContent: {
        title: 'No Terraform API access',
        subtitle: <MoreLessPanel
          key="more-less-1a"
          persistCollapsed={true}
          collapsedLines={2}
          moreIndicatorStyle={MoreLessPanel.MORE_INDICATOR_STYLE.ELLIPSES}>
          A Terraform Cloud Agent Token will need to be provided for every agent deployed through the
          Nexus Dashboard Connector for Terraform and we will display only local information on the
          status of the deployed agents.
        </MoreLessPanel>,
      },
      uid: 'token-absent',
      // onAction: hideTokenInput,
      selected: !selectedToken,
    }
  ];

  // if (selectedToken) {
  //   cards[0].selected = true;
  // }
  // else {
  //   cards[1].selected = true;
  // }

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
      <div style={{ paddingTop: "25px", paddingBottom: "25px", paddingLeft: "3%" }}>
        <h1>
          Let's Configure the basics
        </h1>
        <p style={{ color: "gray" }}>
          There are a few things you need to configure before you get started with Nexus Dashboard Connector for Terraform
        </p>
      </div>
      <Panel border={Panel.BORDER.ALL} padding={Panel.PADDING.NONE}>
        <div className="cards__header">Connection Type</div>
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
        {!selectedToken ? null : <div className="cards__header"
          style={{ margin: "2px" }}>
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
            <div className="cards__header" style={{ paddingLeft: "0px", paddingTop: "35px" }}>Authentication Token
              <span className="text-danger" style={{lineHeight: "0.7em", verticalAlign: "middle"}}>*</span>
            </div>
            <div className="cards__header" style={{ paddingBottom: "25px", paddingRight: "75%", paddingLeft: "0px"}}>
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
