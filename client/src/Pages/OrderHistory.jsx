import React from "react";
import HistoryTable from "../Components/HistoryTable";
import Navbar from "../Components/Navbar";

const App = () => {
  return (
    <div className="flex flex-col w-screen">
      <div>
        <Navbar />
      </div>
      <div className="px-20 py-10">
        <HistoryTable />
      </div>
    </div>
  );
};

export default App;
