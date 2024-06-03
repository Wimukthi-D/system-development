import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Logo from "../assets/DM logo.png";
import Primarybutton from "../Components/Primarybutton";
import SecondaryButton from "../Components/SecondaryButton";
import { useNavigate } from "react-router-dom";
import * as React from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import MailIcon from "@mui/icons-material/Mail";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import { white } from "@mui/material/colors";
import { jwtDecode } from "jwt-decode";


function Navbar() {
  const [open, setOpen] = React.useState(false);

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  const navigate = useNavigate();
  const location = useLocation();

  const [activeRoute, setActiveRoute] = useState(location.pathname);

  // Define the buttons and their respective routes

  useEffect(() => {
    setActiveRoute(location.pathname);
  }, [location]);

  const storedData = localStorage.getItem("token");
  let buttons = [];

  if (storedData) {
    const parsedData = JSON.parse(storedData);
    const token = parsedData.token;
    const decoded = jwtDecode(token);

    switch (decoded.role) {
      case "Manager":
        buttons = [
          { text: "STOCKS", route: "/manager-dashboard/Stocks" },
          { text: "PRODUCTS", route: "/manager-dashboard/Products" },
          { text: "STAFF MANAGEMENT", route: "/manager-dashboard/users" },
          { text: "ORDERS", route: "/manager-dashboard/orders" },
          { text: "ANALYSIS", route: "/manager-dashboard" },
         
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
          { text: "INVENTORY", route: "/Staff-dashboard" },
          { text: "PRODUCTS", route: "/Staff-dashboard/Products" },
          { text: "STAFF",route: "/staff-dashboard/users"}
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
    navigate("/");
    return; // Exit the function early since navigation has occurred
  }

  // Now you can use the buttons array as needed
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
    <div className="flex w-screen h-20 bg-[#139E0C] items-center justify-between  px-8 py-4">
      {/* <div className="fixed ">
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={toggleDrawer(true)}
          edge="start"
          sx={{ mr: 2, ...(open && { display: "none" }) }}
        >
          <MenuIcon sx={{ color: "white" }} />
        </IconButton>
        <Drawer open={open} onClose={toggleDrawer(false)}>
          {DrawerList}
        </Drawer>
      </div> */}
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
      <div className="flex gap-4 justify-between">
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
    </div>
  );
}

export default Navbar;
