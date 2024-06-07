import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Logo from "../assets/DM logo.png";
import Primarybutton from "../Components/Primarybutton";
import SecondaryButton from "../Components/SecondaryButton";
import { useNavigate } from "react-router-dom";
import * as React from "react";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import { jwtDecode } from "jwt-decode";
import Tooltip from "@mui/material/Tooltip";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Avatar from "@mui/material/Avatar";
import Logout from "@mui/icons-material/Logout";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import CustomerRegister from "./CustomerRegister";

function Navbar() {
  const [open, setOpen] = React.useState(false);
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const navigate = useNavigate();
  const [token, setToken] = useState(null);
  const [Usertype, setUsertype] = useState(null);
  const [FirstName, setFirstName] = useState(null);
  const location = useLocation();
  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };
  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const [activeRoute, setActiveRoute] = useState(location.pathname);

  const handleLogOut = () => {
    localStorage.removeItem("token");
    if (window.location.pathname === "/") {
      window.location.reload();
    }
  };

  useEffect(() => {
    const storedData = localStorage.getItem("token");
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setToken(parsedData.token);

      try {
        const decodedToken = jwtDecode(parsedData.token);
        if (decodedToken) {
          setUsertype(decodedToken.role);
          setFirstName(decodedToken.FirstName);
        }
      } catch (error) {
        setUsertype(null);
      }
    } else {
      setUsertype(null);
    }
  }, []);

  const handleProfile = () => {
    switch (Usertype) {
      case "Manager":
        navigate("/manager-dashboard/Profile");
        break;
      case "Cashier":
        navigate("/cashier-dashboard/Profile");
        break;
      case "Staff":
        navigate("/staff-dashboard/Profile");
        break;
      case "Supplier":
        navigate("/supplier-dashboard/Profile");
        break;
    }
  };

  useEffect(() => {
    setActiveRoute(location.pathname);
  }, [location]);

  let buttons = [];

  if (token) {
    switch (Usertype) {
      case "Manager":
        buttons = [
          { text: "STOCKS", route: "/manager-dashboard/Stocks" },
          { text: "PRODUCTS", route: "/manager-dashboard/Products" },
          { text: "STAFF MANAGEMENT", route: "/manager-dashboard/users" },
          { text: "SUPPLIER ORDERS", route: "/manager-dashboard/orders" },
          { text: "ANALYSIS", route: "/manager-dashboard" },
          { text: "ORDER HISTORY", route: "/manager-dashboard/orderhistory" },
        ];
        break;
      case "Cashier":
        buttons = [
          { text: "BILLING", route: "/cashier-dashboard" },
          { text: "STOCKS", route: "/cashier-dashboard/stocks" },
        ];
        break;
      case "Staff":
        buttons = [
          { text: "STOCKS", route: "/Staff-dashboard" },
          { text: "PRODUCTS", route: "/Staff-dashboard/Products" },
          { text: "STAFF", route: "/staff-dashboard/users" },
        ];
        break;
      case "Supplier":
        buttons = [{ text: "ORDERS", route: "/supplier-dashboard" }];
        break;
      case "Customer":
        navigate("/customer-dashboard");
        return; // Exit the function early since navigation has occurred
      default:
        navigate("/");
        return; // Exit the function early since navigation has occurred
    }
  } else {
    return;
  }

  console.log(buttons);

  const DrawerList = (
    <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)}>
      <List>
        {buttons.map((button) => (
          <ListItem key={button.text} disablePadding>
            <ListItemButton onClick={() => navigate(button.route)}>
              <ListItemIcon>{button.icon}</ListItemIcon>
              <ListItemText primary={button.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      {/* Add any other sections if needed */}
    </Box>
  );

  return (
    <div className="flex w-screen h-20 bg-[#139E0C] items-center justify-between px-8 py-4">
      <div
        className="flex bg-white items-center rounded-full cursor-pointer"
        onClick={() => navigate("/")}
        >
        <img
          src={Logo}
          alt="logo"
          className="h-14 ml-5 pb-2 pt-2 overflow-hidden relative right-2"
        />
      </div>
      <div>
        <div className="flex items-center gap-20 justify-between">
          <div className="flex gap-4">
            {buttons.map((button, index) => (
              <Link to={button.route} key={index}>
                {button.route === activeRoute ? (
                  <Primarybutton
                    text={button.text}
                    color="white"
                    textColor="#139E0C"
                    hoverColor="slate"
                    activeColor="slate"
                  />
                ) : (
                  <SecondaryButton text={button.text} />
                )}
              </Link>
            ))}
          </div>
          <div className="flex text-white text-2xl gap-4 items-center justify-between">
            <div className="flex flex-col justify-center">|</div>
            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="Open settings">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar alt={FirstName} src={FirstName} />
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: "45px" }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                <MenuItem onClick={handleProfile}>
                  <ListItemIcon>
                    <ManageAccountsIcon fontSize="small" />
                  </ListItemIcon>
                  Profile
                </MenuItem>
                <MenuItem onClick={handleLogOut}>
                  <ListItemIcon>
                    <Logout fontSize="small" />
                  </ListItemIcon>
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
