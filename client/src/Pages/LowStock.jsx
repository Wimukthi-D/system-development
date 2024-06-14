import React, { useEffect, useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Navbar from "../Components/Navbar";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";

export default function InventoryTables() {
  const [lowStockData, setLowStockData] = useState([]);
  const [expiringStockData, setExpiringStockData] = useState([]);
  const [expiryRange, setExpiryRange] = useState(3);

  useEffect(() => {
    fetch("http://localhost:3001/api/notify/lowStock")
      .then((response) => response.json())
      .then((data) => setLowStockData(data.data))
      .catch((error) => console.error("Error fetching low stock data:", error));

    fetch(
      `http://localhost:3001/api/notify/expiringStock?months=${expiryRange}`
    )
      .then((response) => response.json())
      .then((data) => setExpiringStockData(data.data))
      .catch((error) =>
        console.error("Error fetching expiring stock data:", error)
      );
  }, [expiryRange]);

  const handleExpiryRangeChange = (event) => {
    setExpiryRange(event.target.value);
  };

  return (
    <div>
      <Navbar />
      <div className="flex m-10 ">
        <Grid container spacing={10}>
          <Grid item xs={6}>
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label="low stock table">
                <caption>Low Stock Items</caption>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#ef5350" }}>
                    <TableCell>Drug Name</TableCell>
                    <TableCell>Generic Name</TableCell>
                    <TableCell>Branch Name</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {lowStockData.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell component="th" scope="row">
                        {row.drugname}
                      </TableCell>
                      <TableCell>{row.genericName}</TableCell>
                      <TableCell>{row.branchName}</TableCell>
                      <TableCell align="right">{row.quantity}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
          <Grid item xs={6}>
            <FormControl margin="normal">
              <InputLabel id="expiry-range-label">
                Expiry Range (Months)
              </InputLabel>
              <Select
                labelId="expiry-range-label"
                value={expiryRange}
                onChange={handleExpiryRangeChange}
              >
                <MenuItem value={1}>1 Month</MenuItem>
                <MenuItem value={3}>3 Months</MenuItem>
                <MenuItem value={6}>6 Months</MenuItem>
                <MenuItem value={12}>12 Months</MenuItem>
              </Select>
            </FormControl>
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label="expiring stock table">
                <caption>Expiring Stock Items</caption>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#ef5350" }}>
                    <TableCell>Drug Name</TableCell>
                    <TableCell>Generic Name</TableCell>
                    <TableCell>Branch Name</TableCell>
                    <TableCell align="right">Expire Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {expiringStockData.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell component="th" scope="row">
                        {row.drugname}
                      </TableCell>
                      <TableCell>{row.genericName}</TableCell>
                      <TableCell>{row.branchName}</TableCell>
                      <TableCell align="right">
                        {new Date(row.expireDate).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </div>
    </div>
  );
}
