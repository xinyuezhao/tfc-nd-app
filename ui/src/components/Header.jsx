import {Dropdown, IconButton, LABELS, useScreenActions} from 'blueprint-react';
import AuthenticationToken from './AuthenticationToken';

const Header = ({setShowAbout, authConfig, refreshAuthConfig}) => {
    // change above from const to function check other components too

    const actions = useScreenActions();

    const menuOptions = [
        {
            label: "Setup",
            action: () => {
                actions.openScreen(AuthenticationToken, {
                    title: "title",
                    screenId: "authentication-token",
                    authConfig: authConfig,
                    refreshAuthConfig: refreshAuthConfig,
                });
            }
        },
        {
            label: LABELS.about,
            action: () => setShowAbout(true),
        },
    ];

    return (
        <header className="header header--compressed" >
            <div className="header-bar container">
                <div className="header-bar__main">
                    <div className="right-menu-icons" style={{ float:"right", paddingTop: "10px", marginRight:"0px" }}>
                        <Dropdown
                            type={Dropdown.TYPE.BUTTON}
                            size={Dropdown.SIZE.SMALL}
                            icon={IconButton.ICON.COG}
                            menuDirection={Dropdown.MENU_DIRECTION.LEFT}
                            items={menuOptions}
                        />
                    </div>
                </div>
            </div>
        </header>
    )
};

export {Header};