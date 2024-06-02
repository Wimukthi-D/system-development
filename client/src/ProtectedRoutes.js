import React from "react";
import { Outlet } from "react-router-dom";

function ProtectedRoutes({ isAuthenticated: isAuthenticated}) {
  console.log("auth:",isAuthenticated);
    return isAuthenticated && <Outlet/>;
}

export default ProtectedRoutes;
