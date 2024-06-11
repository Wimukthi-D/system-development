import React, { useState, useEffect } from "react";
import { Tabs, Tab } from "@mui/material";
import Supply from "../Components/Supply";
import Transfer from "./Transfer";

function Orders() {
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
          <Tabs
            value={value}
            size="small"
            onChange={handleChange}
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab label="Transfer" />
            <Tab label="supply" />
          </Tabs>
        </div>
        <div>
          {value === 0 && <Transfer />}
          {value === 1 && <Supply />}
        </div>
      </div>
    </div>
  );
}

export default Orders;
