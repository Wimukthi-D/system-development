import React from "react";
import Login from "./Pages/login.jsx";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Analysis from "./Pages/Manager/Analysis.jsx";
import LandingPage from "./Pages/Landing.jsx";
import Users from "./Pages/Manager/Staffmanage.jsx";
import Billing from "./Pages/Cashier/Billing.jsx";
import Orders from "./Pages/Supplier/Orders.jsx";
import Products from "./Pages/Products.jsx";
import Stocks from "./Pages/Stocks.jsx";
import Navbar from "./Components/Navbar.jsx";
import { useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import ProtectedRoutes from "./ProtectedRoutes";
import NotFoundPage from "./Pages/NotFound.jsx";
import NewCustomerPopup from "./Components/NewCustomerPopup.jsx";
import Profile from "./Pages/Profile.jsx";
import OrderHistory from "./Pages/OrderHistory.jsx";

const publicRoutes = ["/", "/login", "/*"];

function App() {
  const [UserType, setUserType] = useState(null);
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
          setUserType(decodedToken.role);
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem("token");
          setIsAuthenticated(false);
          setUserType(null);
        }
      } catch (error) {
        localStorage.removeItem("token");
        setIsAuthenticated(false);
        setUserType(null);
      }
    } else {
      setIsAuthenticated(false);
      setUserType(null);
    }
    setIsLoading(false); // Set loading state to false once authentication check is done
  };

  useEffect(() => {
    checkTokenValidity();

    window.onload = () => {
      checkTokenValidity();
    };

    const interval = setInterval(() => {
      checkTokenValidity();
    }, 10); // 5 minutes interval

    return () => {
      clearInterval(interval);
    };
  }, [UserType]);

  useEffect(() => {
    // Trigger re-render when UserType changes
    RenderProtectedRoutes(UserType, isAuthenticated);
  }, [UserType, isAuthenticated]);

  if (isLoading) {
    return <div>Loading...</div>; // Render loading indicator until authentication status is determined
  }

  return (
    <Router>
      <Routes>
        {RenderProtectedRoutes(UserType, isAuthenticated)}
        <Route exact path="/login" element={<Login />} />
        <Route exact path="/" element={<LandingPage />} />
        <Route exact path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

// Function to render protected routes based on user role
function RenderProtectedRoutes(UserType, isAuthenticated) {
  if (!isAuthenticated && !publicRoutes.includes(window.location.pathname)) {
    return <Route path="*" element={<Navigate to="/" replace />} />;
  }
  console.log(isAuthenticated);
  console.log(UserType);

  return (
    <Route element={<ProtectedRoutes isAuthenticated={isAuthenticated} />}>
      {UserType && (
        <>
          {UserType === "Manager" && (
            <>
              <Route exact path="/manager-dashboard" element={<Analysis />} />
              <Route
                exact
                path="/manager-dashboard/users"
                element={<Users />}
              />
              <Route
                exact
                path="/manager-dashboard/products"
                element={<Products />}
              />
              <Route
                exact
                path="/manager-dashboard/stocks"
                element={<Stocks />}
              />
              <Route
                exact
                path="/manager-dashboard/orders"
                element={<Orders />}
              />
              <Route
                exact
                path="/manager-dashboard/Profile"
                element={<Profile />}
              />
              <Route
                exact
                path="/manager-dashboard/orderhistory"
                element={<OrderHistory />}
              />
            </>
          )}
          {UserType === "Cashier" && (
            <>
              <Route exact path="/cashier-dashboard" element={<Billing />} />
              <Route
                exact
                path="/cashier-dashboard/stocks"
                element={<NewCustomerPopup />}
              />
              <Route
                exact
                path="/cashier-dashboard/Profile"
                element={<Profile />}
              />
            </>
          )}
          {UserType === "Staff" && (
            <>
              <Route exact path="/Staff-dashboard" element={<Stocks />} />
              <Route
                exact
                path="/Staff-dashboard/products"
                element={<Products />}
              />
              <Route exact path="/Staff-dashboard/users" element={<Users />} />
              <Route
                exact
                path="/Staff-dashboard/Profile"
                element={<Profile />}
              />
            </>
          )}
          {UserType === "Supplier" && (
            <>
              <Route exact path="/Supplier-dashboard" element={<Orders />} />
              <Route
                exact
                path="/Supplier-dashboard/Profile"
                element={<Profile />}
              />
            </>
          )}
          {UserType === "Customer" && (
            <>
              <Route exact path="/customer-dashboard" element={<Orders />} />
              <Route
                exact
                path="/customer-dashboard/Profile"
                element={<Profile />}
              />
            </>
          )}
        </>
      )}
    </Route>
  );
}

function ConditionalNavBar() {
  const location = useLocation();
  // Render Navbar only if the current location is not the root path ("/")
  if (publicRoutes.includes(location.pathname)) {
    return null;
  }
}

export default App;
