import React, { useState, useEffect } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

export default function AccessibleTable() {
  const [topSellingProducts, setTopSellingProducts] = useState([]);

  useEffect(() => {
    fetchTopSellingProducts();
  }, []);

  const fetchTopSellingProducts = async () => {
    try {
      const response = await fetch(
        "http://localhost:3001/api/chart/getTopSellingProducts"
      );
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const data = await response.json();
      setTopSellingProducts(data.TopSellingProducts);
    } catch (error) {
      console.error("Error fetching top selling products:", error);
    }
  };

  return (
    <TableContainer component={Paper}>
      <Table aria-label="top selling products table">
        <TableHead>
          <TableRow sx={{ backgroundColor: "#bdbdbd" }}>
            <TableCell>Drug Name</TableCell>
            <TableCell align="right">Generic Name</TableCell>
            <TableCell align="right">Total Sales</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {topSellingProducts.map((product, index) => (
            <TableRow key={index}>
              <TableCell component="th" scope="row">
                {product.drugname}
              </TableCell>
              <TableCell align="right">{product.genericName}</TableCell>
              <TableCell align="right">{product.Total}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
