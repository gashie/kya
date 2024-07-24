import React, { Suspense, useLayoutEffect } from "react";
import { Switch, Route } from "react-router-dom";
import { RedirectAs404 } from "../utils/Utils";

import Invest from "../pages/Invest";

import Welcome from "../pages/panel/invest/pages/Welcome";
import GhCard from "../pages/panel/invest/pages/GhCard";
import Account from "../pages/panel/invest/pages/Account";
import Otp from "../pages/panel/invest/pages/Otp";


const Pages = () => {
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  });

  return (
    <Suspense fallback={<div />}>
      <Switch>

      
        <Route exact path={`${process.env.PUBLIC_URL}/`} component={Welcome}></Route>
        <Route exact path={`${process.env.PUBLIC_URL}/kyc/account`} component={Account}></Route>
        <Route exact path={`${process.env.PUBLIC_URL}/kyc/otp`} component={Otp}></Route>
        <Route exact path={`${process.env.PUBLIC_URL}/kyc/ghcard`} component={GhCard}></Route>
      

        
        
        <Route component={RedirectAs404}></Route>
      </Switch>
    </Suspense>
  );
};
export default Pages;
