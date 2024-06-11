import React, { useState, useEffect } from "react";
import Navbar from "../../Components/Navbar";
import { Tabs, Tab } from "@mui/material";
import { jwtDecode } from "jwt-decode";
import MainOrder from "../MainOrder";
import Transfer from "../Transfer";

function Orders() {
  const [branchID, setbranchID] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedData = localStorage.getItem("token");
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setToken(parsedData.token);

      try {
        const decodedToken = jwtDecode(parsedData.token);
        if (decodedToken) {
          setbranchID(decodedToken.branchID);
        }
      } catch (error) {
        setbranchID(null);
      }
    } else {
      setbranchID(null);
    }
  }, []);
  return (
    <div className="flex flex-col bg-[#EDEDED]">
      <div className="flex flex-col bg-[#F7F7F7] h-screen">
        <div>
          <Navbar />
        </div>
        <div>{branchID === 1 ? <MainOrder /> : <Transfer />}</div>
      </div>
    </div>
  );
}

export default Orders;
