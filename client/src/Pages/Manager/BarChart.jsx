import React, { PureComponent } from "react";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default class Example extends PureComponent {
  state = {
    data: [],
  };

  componentDidMount() {
    this.fetchTopSellingCategories();
  }

  fetchTopSellingCategories = () => {
    fetch("http://localhost:3001/api/chart/getTopSellingCategories") // Replace with your API endpoint
      .then((response) => response.json())
      .then((data) => {
        this.setState({ data: data.TopSellingCategories });
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        // Handle error as needed
      });
  };

  render() {
    const { data } = this.state;

    return (
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="category" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="totalQuantity" fill="#8884d8" />
          <Bar dataKey="totalRevenue" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    );
  }
}
