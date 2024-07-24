import React, { useState } from "react";
import Content from "../../../layout/content/Content";
import ProfileAccount from "./ProfileAccount";
import ProfileNotify from "./ProfileNotify";
import ProfileSetting from "./ProfileSetting";
import ProfileConnected from "./ProfileConnected";
import { Route, Switch, Link } from "react-router-dom";
import {
  Block,
  BlockDes,
  BlockHead,
  BlockHeadSub,
  BlockHeadContent,
  BlockTitle,
  BackTo,
  Icon,
} from "../../../components/Component";

const Profile = () => {
  const [page, setPage] = useState("Profile");

  return (
    <React.Fragment>
      <Content size="lg">
        <BlockHead>
          <BlockHeadContent>
            {page === "profile" || window.location.pathname === process.env.PUBLIC_URL + "/invest/profile" ? (
              <BlockHeadSub>My Profile</BlockHeadSub>
            ) : (
              <BackTo icon="arrow-left" link="/invest/profile" onClick={() => setPage("Profile")}>
                {" "}
                My Profile{" "}
              </BackTo>
            )}
            <BlockTitle tag="h2" className="fw-normal">
              {page === "Social" ? "Social Connect" : `Account ${page}`}
            </BlockTitle>
            <BlockDes>
              <p>
                You have full control to manage your own account setting.{" "}
                <span className="text-primary">
                  <Icon name="info"></Icon>
                </span>
              </p>
            </BlockDes>{" "}
          </BlockHeadContent>
        </BlockHead>

        <ul className="nav nk-nav nav-tabs">
          <li
            className={`nav-item ${
              window.location.pathname === `${process.env.PUBLIC_URL}/invest/profile` ? "active current-page" : ""
            } `}
          >
            <Link
              to={`${process.env.PUBLIC_URL}/invest/profile`}
              className={`nav-link
                    ${window.location.pathname === `${process.env.PUBLIC_URL}/invest/profile` ? "active" : ""}
                  `}
              onClick={() => setPage("Profile")}
            >
              <span>Personal</span>
            </Link>
          </li>
          <li
            className={`nav-item ${
              window.location.pathname === `${process.env.PUBLIC_URL}/invest/profile-setting` ? "active" : ""
            }`}
          >
            <Link
              to={`${process.env.PUBLIC_URL}/invest/profile-setting`}
              className={`nav-link ${
                window.location.pathname === `${process.env.PUBLIC_URL}/invest/profile-setting` ? "active" : ""
              }`}
              onClick={() => setPage("Setting")}
            >
              <span>Security</span>
            </Link>
          </li>
          <li
            className={`nav-item ${
              window.location.pathname === `${process.env.PUBLIC_URL}/invest/profile-notify` ? "active" : ""
            }`}
          >
            <Link
              to={`${process.env.PUBLIC_URL}/invest/profile-notify`}
              className={`nav-link ${
                window.location.pathname === `${process.env.PUBLIC_URL}/invest/profile-notify` ? "active" : ""
              }`}
              onClick={() => setPage("Notification")}
            >
              <span>Notification</span>
            </Link>
          </li>
          <li
            className={`nav-item ${
              window.location.pathname === `${process.env.PUBLIC_URL}/invest/profile-connected` ? "active" : ""
            }`}
          >
            <Link
              to={`${process.env.PUBLIC_URL}/invest/profile-connected`}
              className={`nav-link ${
                window.location.pathname === `${process.env.PUBLIC_URL}/invest/profile-connected` ? "active" : ""
              }`}
              onClick={() => setPage("Social")}
            >
              <span> Connect Social </span>
            </Link>
          </li>
        </ul>

        <Block>
          <Switch>
            <Route
              exact
              path={`${process.env.PUBLIC_URL}/invest/profile`}
              render={() => <ProfileAccount setPage={setPage} />}
            ></Route>
            <Route
              exact
              path={`${process.env.PUBLIC_URL}/invest/profile-setting`}
              render={() => <ProfileSetting setPage={setPage} />}
            ></Route>
            <Route
              exact
              path={`${process.env.PUBLIC_URL}/invest/profile-notify`}
              render={() => <ProfileNotify setPage={setPage} />}
            ></Route>
            <Route
              exact
              path={`${process.env.PUBLIC_URL}/invest/profile-connected`}
              render={() => <ProfileConnected setPage={setPage} />}
            ></Route>
          </Switch>
        </Block>
      </Content>
    </React.Fragment>
  );
};

export default Profile;
