import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
  Navigate,
} from "react-router-dom";
import LoginPage from "./Pages/Common pages/login";
import MainPage from "./Pages/Main";
import ShowroomDashbaord from "./Pages/showroom/Showroom_inventory";
import WarehouseDashbaord from "./Pages/WarehouseDashbaord";
import AdminDashbaord from "./Pages/admin/AdminDashbaord";
import SupplierDashbaord from "./Pages/SupplierDashbaord";
import NotFoundPage from "./Pages/Common pages/PageNotFound";

import ShowroomOrders from "./Pages/showroom/Showroom_orders";
import ShowroomCustomers from "./Pages/showroom/Showroom_customers";
import ShowroomBilling from "./Pages/showroom/Showroom_billing";
import ShowroomSettings from "./Pages/showroom/Showroom_settings";

import AdminUsers from "./Pages/admin/Users";
import AdminTab from "./Pages/admin/TabbedView";

import ShowroomNavbar from "./Components/showroom/showroom_navbar";
import AdminNavbar from "./Components/admin/Admin_navbar";

import { jwtDecode } from "jwt-decode";
import ProtectedRoutes from "./ProtectedRoutes";

const publicRoutes = ["/", "/login", "/*"];

function App() {
  const [userRole, setUserRole] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkTokenValidity = async () => {
    const storedData = localStorage.getItem("token");
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      const token = parsedData.token;
      try {
        const decodedToken = jwtDecode(token);
        if (decodedToken) {
          setUserRole(decodedToken.role);
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem("token");
          setIsAuthenticated(false);
          setUserRole(null);
        }
      } catch (error) {
        localStorage.removeItem("token");
        setIsAuthenticated(false);
        setUserRole(null);
      }
    } else {
      setIsAuthenticated(false);
      setUserRole(null);
    }
    setIsLoading(false); // Set loading state to false once authentication check is done
  };

  useEffect(() => {
    checkTokenValidity();

    // window.onload = () => {
    //   checkTokenValidity();
    // };

    const interval = setInterval(() => {
      checkTokenValidity();
    }, 1000); // 5 minutes interval

    return () => {
      clearInterval(interval);
    };
  }, [userRole]);

  useEffect(() => {
    // Trigger re-render when userRole changes
    RenderProtectedRoutes(userRole, isAuthenticated);
  }, [userRole, isAuthenticated]);

  if (isLoading) {
    return <div>Loading...</div>; // Render loading indicator until authentication status is determined
  }

  return (
    <Router>
      <div>
        <ConditionalSideBar />
        <div>
          <Routes>
            {RenderProtectedRoutes(userRole, isAuthenticated)}
            <Route exact path="/login" element={<LoginPage />} />
            <Route exact path="/" element={<MainPage />} />
            <Route exact path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

// Function to render protected routes based on user role
function RenderProtectedRoutes(userRole, isAuthenticated) {
  if (!isAuthenticated && !publicRoutes.includes(window.location.pathname)) {
    return <Route path="*" element={<Navigate to="/login" replace />} />;
  }
  console.log(isAuthenticated);
  console.log(userRole);

  return (
    <Route element={<ProtectedRoutes isAuthenticated={isAuthenticated} />}>
      {userRole && (
        <>
          {userRole === "Admin" && (
            <>
              <Route
                exact
                path="/admin-dashboard"
                element={<AdminDashbaord />}
              />
              <Route
                exact
                path="/admin-dashboard/users"
                element={<AdminUsers />}
              />
              <Route
                path="/admin-dashboard/products/*"
                element={<AdminTab />}
              />
            </>
          )}
          {userRole === "Showroom Staff" && (
            <>
              <Route
                exact
                path="/showroom-dashboard"
                element={<ShowroomDashbaord />}
              />
              <Route
                exact
                path="/showroom-dashboard/orders"
                element={<ShowroomOrders />}
              />
              <Route
                exact
                path="/showroom-dashboard/billing"
                element={<ShowroomBilling />}
              />
              <Route
                exact
                path="/showroom-dashboard/customers"
                element={<ShowroomCustomers />}
              />
              <Route
                exact
                path="/showroom-dashboard/settings"
                element={<ShowroomSettings />}
              />
            </>
          )}
          {userRole === "Warehouse Staff" && (
            <>
              <Route
                exact
                path="/warehouse-dashboard"
                element={<WarehouseDashbaord />}
              />
            </>
          )}
          {userRole === "Supplier" && (
            <>
              <Route
                exact
                path="/supplier-dashboard"
                element={<SupplierDashbaord />}
              />
            </>
          )}
        </>
      )}
    </Route>
  );
}

function ConditionalSideBar() {
  const location = useLocation();
  // Render Sidebar only if the current location is not the root path ("/")
  if (publicRoutes.includes(location.pathname)) {
    return null;
  } else if (location.pathname.includes("admin-dashboard")) {
    return <AdminNavbar />; // Render AdminNavbar for admin-dashboard route
  } else if (location.pathname.includes("showroom-dashboard")) {
    return <ShowroomNavbar />; // Render ShowroomNavbar for showroom-dashboard routes
  }
}

export default App;
