import React, { useState, useEffect } from "react";
import Navbar from "../Components/Navbar";
import Stocks from "./Stocks";
import { Tabs, Tab } from "@mui/material";
import Products from "./Products";

function Inventory() {
  const [value, setValue] = useState(() => {
    const storedValue = localStorage.getItem("selectedTab");
    return storedValue ? parseInt(storedValue) : 0;
  });

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  useEffect(() => {
    localStorage.setItem("selectedTab", value);
  }, [value]);

  return (
    <div className="flex flex-col bg-[#EDEDED]">
      <div className="flex flex-col bg-[#F7F7F7] h-screen">
        <div>
          <Navbar />
          <Tabs
            value={value}
            onChange={handleChange}
            indicatorColor="primary"
            textColor="primary"
            centered
          >
            <Tab label="Products" />
            <Tab label="Stocks" />
          </Tabs>
        </div>
        <div>
          {value === 0 && <Products />}
          {value === 1 && <Stocks />}
        </div>
      </div>
    </div>
  );
}

export default Inventory;
