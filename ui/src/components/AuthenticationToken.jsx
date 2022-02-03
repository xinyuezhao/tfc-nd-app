import React,{useState, useEffect,useCallback} from 'react';

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
    token,
    screenActions,
  } = props;

  const [userToken, setUserToken] = useState('');
  // const [isOpen, setIsOpen] = useState(true);
  const [selectedToken, setSelectedToken] = useState(false);
  const [warningAlert, setWarningAlert] = useState("");
  const [infoAlert, setInfoAlert] = useState("");
  const [successAlert, setSuccessAlert] = useState("");
  const action = useScreenActions();

  useEffect(() => {
    if (token) {
      setUserToken(token.userToken);
    }
  }, [token]);


  const checkBeforeSubmit = () => {
    return true;
  }

  const handleCreateAuthenticationToken = useCallback((userToken) => {
    console.log("Start creating authentication token", userToken);
    const payload = {
      "spec": {
        "name": "terraform",
        "token": userToken
      }
    }
    createAuthenticationToken(payload)
      .then((res) => {
        setInfoAlert("");
        setSuccessAlert("Created Agent Successfully");
        console.log("Authentication token created. data = ", res.data )
      })
      .catch((error) => {
        console.log(error);
        setInfoAlert("");
        setSuccessAlert("");
        error.response?.data?.detail?.detail &&
          setWarningAlert(error.response?.data?.detail?.detail);
      });
  });


  const onAction = useCallback(() => {
    const result = checkBeforeSubmit();
    const token = handleCreateAuthenticationToken(userToken);
    if (result) {
      if (selectedToken) {
        console.log("Added new Authentication token ", selectedToken)
        action.openScreen(AgentTable, {
          title: "title",
          screenId: "agent-table",
          data: selectedToken,
        });
        screenActions.closeScreen("authentication-token"); // screenId
      } else {
        console.log("No use of Authentication token ", selectedToken)
        action.openScreen(AgentTable, {
          title: "title",
          screenId: "agent-table",
          data: selectedToken,
        });
        screenActions.closeScreen("authentication-token");
      }
    }
  }, [checkBeforeSubmit, selectedToken, userToken, action, screenActions, handleCreateAuthenticationToken]);

  const displayTokenInput = () => {
    console.log("In display TOKEN ")
    setSelectedToken(true);
  }

  const hideTokenInput = () => {
    console.log("In HIDE TOKEN ")
    setSelectedToken(false);
  }

  return (
    <DetailScreen
      onAction={onAction}
      title={"User Authentication"}
      applyButtonLabel={"Save"}
    >
    <div style={{ paddingLeft: "10%" }}>
      <div style={{ fontSize: "20px", paddingTop: "25px",paddingBottom: "25px", }}>General</div>
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
          cards={[
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
              onAction: displayTokenInput

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
              onAction: hideTokenInput
            }
          ]}
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
