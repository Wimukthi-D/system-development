import React, { useState, useEffect } from "react";
import { PieChart, Pie, Legend, Tooltip, ResponsiveContainer } from "recharts";
import axios from "axios";

const SalesPieChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const salesResponse = await axios.get("http://localhost:3001/api/chart/getSales");
        const ordersResponse = await axios.get("http://localhost:3001/api/chart/getOrder");
        const stocksResponse = await axios.get("http://localhost:3001/api/chart/getRemainStock");

        const sales = salesResponse.data.Sales;
        const orders = ordersResponse.data.Orders;
        const stocks = stocksResponse.data.Stocks;

        setData([
          { name: "Sales", value: sales },
          { name: "Purchased", value: orders },
          { name: "Expected sale", value: stocks },
        ]);
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };

    fetchData();
  }, []);

  return (
    <ResponsiveContainer width="80%" height={400}>
      <PieChart>
        <Pie
          dataKey="value"
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={120}
          fill="#82ca9d"
          label
        />
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default SalesPieChart;
