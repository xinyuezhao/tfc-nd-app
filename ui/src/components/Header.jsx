import {Dropdown,
  IconButton,
  LABELS,
  useScreenActions
} from 'blueprint-react';
import AuthenticationToken from './AuthenticationToken';

/**
 * Header component displays top section of the app.
 * It contains a COG icon which give users two options.
 * Setup -> to go to authentication page and
 * About -> to get the current information of the app (like version).
 */

function Header(props) {
  const {
    setShowAbout,
    authConfig,
    refreshAuthConfig,
  } = props;

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
          <div className="right-menu-icons pull-right no-margin-right qtr-padding-top qtr-margin-top" >
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

export default Header;