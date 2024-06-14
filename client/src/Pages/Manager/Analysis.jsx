import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Bar,
} from "recharts";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import Navbar from "../../Components/Navbar";
import { jwtDecode } from "jwt-decode";
import Pie from "./Pie";
import BarChart from "./BarChart";
import TopProducts from "./TopProducts";
function Analysis() {
  const [data, setData] = useState([]);
  const [timeRange, setTimeRange] = useState("day");
  const [averageRevenue, setAverageRevenue] = useState(0);
  const [branchID, setBranchID] = useState(0);
  const [token, setToken] = useState(null);
  const [branches, setBranches] = useState([]);

  const handleChangeTimeRange = (event) => {
    setTimeRange(event.target.value);
  };

  const handleChangeBranch = (event) => {
    const value = event.target.value;
    setBranchID(value === "" ? null : value);
  };

  useEffect(() => {
    const storedData = localStorage.getItem("token");
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setToken(parsedData.token);

      try {
        const decodedToken = jwtDecode(parsedData.token);
        if (decodedToken) {
          setBranchID(decodedToken.branchID);
        }
      } catch (error) {
        setBranchID(null);
      }
    } else {
      setBranchID(null);
    }
  }, []);

  useEffect(() => {
    fetch(`http://localhost:3001/api/chart/getBranch`)
      .then((response) => response.json())
      .then((data) => {
        setBranches(data.branches);
      })
      .catch((error) => console.error("Error fetching branch data:", error));
  }, []);

  useEffect(() => {
    const branchQuery = branchID ? `&branchID=${branchID}` : "";
    fetch(
      `http://localhost:3001/api/chart/getRevenue?timeRange=${timeRange}${branchQuery}`
    )
      .then((response) => response.json())
      .then((data) => {
        console.log(data.Revenue);

        const currentHour = new Date().getHours();
        let transformedData = data.Revenue;

        // Filter data based on time range
        if (timeRange === "day") {
          transformedData = transformedData
            .filter((item) => item.time <= currentHour)
            .map((item) => ({
              name: `${item.time}:00`,
              revenue: item.revenue,
              branchID: item.branchID,
            }));
        } else if (timeRange === "week") {
          transformedData = transformedData.map((item) => ({
            name: new Date(item.time).toLocaleDateString("en-US", {
              weekday: "short",
            }),
            revenue: item.revenue,
            branchID: item.branchID,
          }));
        } else if (timeRange === "month") {
          transformedData = transformedData.map((item) => ({
            name: `Week ${item.time}`,
            revenue: item.revenue,
            branchID: item.branchID,
          }));
        } else if (timeRange === "year") {
          const monthNames = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ];
          transformedData = transformedData.map((item) => ({
            name: monthNames[item.time - 1],
            revenue: item.revenue,
            branchID: item.branchID,
          }));
        }

        // If a specific branch is selected, filter the data for that branch
        if (branchID) {
          transformedData = transformedData.filter(
            (item) => item.branchID === branchID
          );
        } else {
          // If no specific branch is selected, sum the revenue for all branches
          const aggregatedData = {};
          transformedData.forEach((item) => {
            if (!aggregatedData[item.name]) {
              aggregatedData[item.name] = { revenue: 0 };
            }
            aggregatedData[item.name].revenue += item.revenue;
          });

          transformedData = Object.keys(aggregatedData).map((name) => ({
            name,
            revenue: aggregatedData[name].revenue,
          }));
        }

        setData(transformedData);

        // Calculate average revenue
        let totalRevenue = transformedData.reduce(
          (acc, item) => acc + item.revenue,
          0
        );
        let average = 0;
        if (timeRange === "day") {
          average = totalRevenue / transformedData.length;
        } else if (timeRange === "week") {
          average = totalRevenue / 7;
        } else if (timeRange === "month") {
          average = totalRevenue / 4;
        } else if (timeRange === "year") {
          average = totalRevenue / 12;
        }
        setAverageRevenue(average);
      })
      .catch((error) => console.error("Error fetching revenue data:", error));
  }, [timeRange, branchID]);

  console.log(branchID, branches, timeRange, averageRevenue, data);

  return (
    <div className="flex flex-col w-screen h-screen">
      <Navbar />
      <div className="flex gap-2 w-screen h-1/2">
        <div className="flex flex-col w-3/5 ">
          <div className="flex border justify-between px-10 pt-5 pb-2">
            <div className="flex w-40">
              <FormControl fullWidth>
                <InputLabel id="timeRange-label">Select Time Range</InputLabel>
                <Select
                  labelId="timeRange-label"
                  id="timeRange"
                  size="small"
                  value={timeRange}
                  label="Select Time Range"
                  onChange={handleChangeTimeRange}
                >
                  <MenuItem value="day">Day</MenuItem>
                  <MenuItem value="week">Week</MenuItem>
                  <MenuItem value="month">Month</MenuItem>
                  <MenuItem value="year">Year</MenuItem>
                </Select>
              </FormControl>
            </div>
            <div className="flex w-40">
              <FormControl fullWidth>
                <InputLabel id="branch-label">Select Branch</InputLabel>
                <Select
                  labelId="branch-label"
                  id="branch"
                  size="small"
                  value={branchID || 0} // Default to 0 if branchID is null or undefined
                  label="Select Branch"
                  onChange={handleChangeBranch}
                >
                  <MenuItem value={0}>All Branches</MenuItem>
                  {branches.map((branch) => (
                    <MenuItem key={branch.branchID} value={branch.branchID}>
                      {branch.branchName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
            <div className="ml-4">
              <strong>Average Revenue:</strong> {averageRevenue.toFixed(2)} LKR
            </div>
          </div>
          <div style={{ width: "100%", height: "100%" }}>
            <ResponsiveContainer width="100%" height="95%">
              <LineChart width={300} height={100} data={data}>
                <XAxis dataKey="name" />
                <YAxis />
                <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8884d8"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="flex w-2/5">
          <Pie data={data} />
        </div>
      </div>
      <div className="flex gap-2 w-screen h-1/2">
        <div className="flex flex-col w-1/3 p-5 mr-4">
          <TopProducts />
        </div>
        <div className="flex border flex-col w-2/3">
          <BarChart />
        </div>
      </div>
    </div>
  );
}

export default Analysis;
