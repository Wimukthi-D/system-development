import React from "react";
import Logo from "../assets/DM logo.png";
import Primarybutton from "../Components/Primarybutton";
import { useNavigate } from "react-router-dom";

function Navland() {
  const navigate = useNavigate();

  return (
    <div className="bg-white">
      <div className="flex w-screen justify-between items-center">
        <img src={Logo} alt="logo" className="h-16  ml-5 pb-2 pt-2" />
        <div className="w-1/6 px-8">
          <Primarybutton
            text="Login"
            onClick={() => navigate("/login")}
            color="#139E0C"
            hoverColor="#437729"
            activeColor="#192c10"
            fullWidth="1"
          />
        </div>
      </div>

      <div className="bg-[#139E0C] h-8"></div>
    </div>
  );
}

export default Navland;
