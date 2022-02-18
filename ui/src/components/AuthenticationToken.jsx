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
import AgentTable from './AgentTable';
import {
  createAuthenticationToken,
} from "../service/api_service";

/**
 * A sample of create new renderer function component that is passed as createItemRenderer.
 * Please see the use of useObjectPickerSubmit to get the click event on Modal create button
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
        setSuccessAlert("Created Agent Successfully");
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


  const onAction = useCallback(() => {
    handleCreateAuthenticationToken(userToken);
    if (selectedToken) {
      console.log("INFO: Authentication token selected ", selectedToken)
      screenActions.closeScreen("authentication-token"); // screenId
    } else {
      console.log("INFO: Authentication token not selected ", selectedToken)
      screenActions.closeScreen("authentication-token");
    }
  }, [selectedToken, userToken, screenActions, handleCreateAuthenticationToken]);

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
        subtitle: (<MoreLessPanel key="more-less-1a"
          persistCollapsed={true}
          collapsedLines={2}
          moreIndicatorStyle={MoreLessPanel.MORE_INDICATOR_STYLE.ELLIPSES}>
          By providing the one time user authentication token, users will be able to create agents
          without needing to provide unique agent token. Terraform Connect will also be able to display subscription
          details and utilization overview.
        </MoreLessPanel>),
      },
      uid: 'token-present-1',
      onAction: displayTokenInput,

    },
    {
      headerContent: {
        title: 'No Terraform API access',
        subtitle: (<MoreLessPanel key="more-less-1a"
          persistCollapsed={true}
          collapsedLines={2}
          moreIndicatorStyle={MoreLessPanel.MORE_INDICATOR_STYLE.ELLIPSES}>
          Agent token will be required for every agent creation. There will be no visibility into subscription details and utilization overview.
        </MoreLessPanel>),
      },
      uid: 'token-absent-0',
      onAction: hideTokenInput,
    }
  ];

  if (selectedToken) {
    cards[0].selected = true;
  }
  else {
    cards[1].selected = true;
  }

  if((selectedToken && !userToken)){
    applyButtonProps = {disabled: true};
  }


  return (
    <DetailScreen
      onAction={onAction}
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
        <Cards selectionMode={Cards.SELECTION_MODE.SINGLE}
          selectionControl={Cards.SELECTION_CONTROL.COMPONENT}
          groupName="cards-criteria-group-single-name-00"
          styles={{
            cardsContainer: {
              display: 'grid',
              gridTemplateColumns: 'auto auto auto'
            }
          }}
          cards={cards}
        />
        {!selectedToken ? null : <div className="cards__header"
        style={{ margin: "2px" }}>
          <InfoAlert
            title="Alert Title"
            children="Instruction on how to use authentication. Get terraform user token."
          />
          <div className="cards__header" style={{ paddingLeft: "0px", paddingTop: "35px" }}>Authentication Token
            <span class="text-danger" style={{lineHeight: "0.7em", verticalAlign: "middle"}}>*</span>
          </div>
          <div className="cards__header" style={{ paddingBottom: "25px", paddingRight: "75%", paddingLeft: "0px"}}>
            <Input required=""
              value={userToken}
              onChange={(e) => setUserToken(e.target.value)}
            />
          </div>
        </div>}
      </Panel>
      {/* ========================================== */}
    </div>
    </DetailScreen>
  );

}


export default AuthenticationToken;
