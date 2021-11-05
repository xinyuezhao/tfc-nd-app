import React,{useState, useEffect,useCallback} from 'react';

import {
  useObjectPickerSubmit,
  DetailScreen,
  Input,
  useScreenActions,
  Card,
  LABELS,
  Panel,
  Cards,
  MoreLessPanel,
  Button
} from 'blueprint-react';
import _ from 'lodash';
import './CiscoObjectPicker.scss';

/**
 * A sample of create new renderer funciton component that is passed as createItemRenderer.
 * Please see the use of useObjectPickerSubmit to get the click event on Modal create button
 */

function AuthenticationToken(props) {
  const {
    token,
    screenActions,
  } = props;

  const [agentToken, setAgentToken] = useState('');
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    if (token) {
      setAgentToken(token.agentToken);
    }
  }, [token]);


  const handleOnChange = useEffect((evt) => {
    //   // set agent pool name and unique ID here
  }, []);

  const checkBeforeSubmit = useCallback(() => {
    return true;
  },);

  const onAction = useCallback(() => {
    const result = checkBeforeSubmit();
    if (result) {
      handleOnChange();
    }
  }, [checkBeforeSubmit, handleOnChange]);


  const onClose = () => {
    setIsOpen(false);
  };

  const onMinimize = (a) => {
    props.close();
  };


  return (
    <DetailScreen
      onAction={onAction}
      onClose={onClose}
      onMinimize={onMinimize}
      title={"User Authentication"}
      createItemRenderer={handleOnChange}
      cancelButtonLabel={LABELS.cancel}
      applyButtonLabel={"Save"}
      isOpen={isOpen}
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
                subtitle: <MoreLessPanel key="more-less-1a"
                  persistCollapsed={true}
                  collapsedLines={2}
                  moreIndicatorStyle={MoreLessPanel.MORE_INDICATOR_STYLE.ELLIPSES}>
                  By providing the one time user authentication token, users will be able to create agents
                  without needing to provide unique agent token. Terraform Connect will also be able to display subscription
                  details and utilization overview.
                </MoreLessPanel>,
              },
              uid: 'cards-compliance-group-single-value-0'
            },
            {
              headerContent: {
                title: 'No Terraform API access',
                subtitle: <MoreLessPanel key="more-less-1a"
                  persistCollapsed={true}
                  collapsedLines={2}
                  moreIndicatorStyle={MoreLessPanel.MORE_INDICATOR_STYLE.ELLIPSES}>
                  Agent taken will be required for every agent creation. There will be no visibility into subscription details and utilization overview.
                </MoreLessPanel>
              },
              uid: 'cards-compliance-group-single-value-1',
              onAction: (cardProps, cardState, evt) => {
                // You logic goes here
                console.log(cardProps);
            }
            }
          ]}
        />
      </Panel>
      {/* ========================================== */}
    </div>
    </DetailScreen>
  );

}


export default AuthenticationToken;
