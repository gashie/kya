import React from "react";
import classNames from "classnames";
import Toggle from "../sidebar/Toggle";
import Logo from "../logo/Logo";
import Menu from "../menu/Menu";
import User from "./dropdown/user/User";
import Notification from "./dropdown/notification/Notification";
import InvestmentMenu from "../menu/InvestmentMenu";
import MobileMenu from "../menu/MobileMenu";
import menu from "../menu/MenuData";
import { Icon } from "../../components/Component";
import { handleSignout } from "../../utils/Utils";

const Header = ({ fixed, theme, visibility, toggleSidebar, mobileView, className, ...props }) => {
  const headerClass = classNames({
    "nk-header is-regular": true,
    "nk-header-fixed": fixed,
    [`is-light`]: theme === "white",
    [`is-${theme}`]: theme !== "white" && theme !== "light",
    [`${className}`]: className,
  });

  return (
    <div className={headerClass}>
      <div className={`container-fluid wide-${window.location.pathname.split("/")[2] === "invest" ? "lg" : "xl"}`}>
        <div className="nk-header-wrap">
          <div className="nk-menu-trigger mr-sm-2 d-lg-none">
            <Toggle className="nk-nav-toggle nk-quick-nav-icon" icon="menu" click={toggleSidebar} />
          </div>
          <div className="nk-header-brand">
            <Logo />
          </div>
          <div className={`nk-header-menu ${mobileView ? "mobile-menu" : ""}  ${visibility ? "nk-header-active" : ""}`}>
            <div className="nk-header-mobile">
              <div className="nk-header-brand">
                <Logo />
              </div>
              <div className="nk-menu-trigger mr-n2">
                <Toggle className="nk-nav-toggle nk-quick-nav-icon" icon="arrow-left" click={toggleSidebar} />
              </div>
            </div>
            {window.location.pathname.split("/")[2] === "invest" && mobileView ? (
              <MobileMenu data={menu[0].subMenu[menu[0].subMenu.length - 1].subPanel} mobileView={mobileView} />
            ) : window.location.pathname.split("/")[2] === "invest" ? (
              <InvestmentMenu />
            ) : mobileView ? (
              <MobileMenu data={menu} sidebarToggle={toggleSidebar} mobileView={mobileView} />
            ) : (
              <Menu />
            )}
          </div>
          {visibility && <div className="nk-header-overlay" onClick={toggleSidebar}></div>}
          <div className="nk-header-tools">
            <ul className="nk-quick-nav">
              <li className="user-dropdown">
                <User />
              </li>
              <li className="notification-dropdown mr-n1">
                <Notification />
              </li>
              {window.location.pathname.split("/")[2] === "invest" && (
                <li className="hide-mb-sm">
                  <a
                    href={`${process.env.PUBLIC_URL}/auth-login`}
                    className="nk-quick-nav-icon"
                    onClick={handleSignout}
                  >
                    <Icon name="signout" />
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Header;
