import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Logo from "../assets/DM logo.png";
import Primarybutton from "../Components/Primarybutton";
import SecondaryButton from "../Components/SecondaryButton";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [activeRoute, setActiveRoute] = useState(location.pathname);

  // Define the buttons and their respective routes
  const buttons = [
    { text: "Inventory", route: "/inventory" },
    { text: "Staff Management", route: "/staffmanagement" },
    { text: "Analysis", route: "/analysis" },
  ];

  useEffect(() => {
    setActiveRoute(location.pathname);
  }, [location]);

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
