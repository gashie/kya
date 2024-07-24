import React from "react";
import PrivateRoute from "./route/PrivateRoute";
import Layout from "./layout/Index";

import Error404Classic from "./pages/error/404-classic";
import Error404Modern from "./pages/error/404-modern";
import Error504Modern from "./pages/error/504-modern";
import Error504Classic from "./pages/error/504-classic";

import Faq from "./pages/others/Faq";
import Terms from "./pages/others/Terms";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Success from "./pages/auth/Success";
import InvoicePrint from "./pages/pre-built/invoice/InvoicePrint";

import { Switch, Route, withRouter } from "react-router-dom";
import { RedirectAs404 } from "./utils/Utils";
import { init as initApm } from '@elastic/apm-rum'

const apm = initApm({

  // Set required service name (allowed characters: a-z, A-Z, 0-9, -, _, and space)
  serviceName: 'Gh-Card-KYC-FRONTEND',

  // Set custom APM Server URL (default: http://localhost:8200)
  secretToken: 'Mhqvjvd6oP7pFTT4lp',

 serverUrl: 'https://384ded15058347c9b004fc7fa2d71164.apm.westus2.azure.elastic-cloud.com:443',

  // Set service version (required for sourcemap feature)
  serviceVersion: '1.0.0'
})

const App = () => {
  return (
    <Switch>
      {/* Auth Pages */}
  

      {/*Error Pages*/}
      <Route exact path={`${process.env.PUBLIC_URL}/errors/404-classic`} component={Error404Classic}></Route>
      <Route exact path={`${process.env.PUBLIC_URL}/errors/504-modern`} component={Error504Modern}></Route>
      <Route exact path={`${process.env.PUBLIC_URL}/errors/404-modern`} component={Error404Modern}></Route>
      <Route exact path={`${process.env.PUBLIC_URL}/errors/504-classic`} component={Error504Classic}></Route>

      {/*Main Routes*/}
      <Route exact path="" component={Layout}></Route>
      <Route component={RedirectAs404}></Route>
    </Switch>
  );
};
export default withRouter(App);
