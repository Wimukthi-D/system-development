import React from "react";
import Navbar from "../../Components/Navbar";
import OrderTable from "../../Components/OrderTable"
function Orders() {
  return (
    <div className="flex flex-col w-screen">
      <div>
        <Navbar />
      </div>
      <div >
        <OrderTable/>
      </div>
    </div>
  );
}

export default Orders;
