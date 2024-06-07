import React from "react";
import Navbar from "../../Components/Navbar";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { Button } from "@mui/material";

function createData(name, calories, fat, carbs, protein) {
  return { name, calories, fat, carbs, protein };
}

const rows = [
  createData("Frozen yoghurt", 159, 6.0, 24, 4.0),
  createData("Ice cream sandwich", 237, 9.0, 37, 4.3),
  createData("Eclair", 262, 16.0, 24, 6.0),
];

function Orders() {
  const handleRequest = () => {
    console.log("New request button clicked");
    // Add your request handling logic here
  };

  return (
    <div className="flex flex-col w-screen h-screen">
      <div className="flex-col">
        <Navbar />
      </div>
      <div className="flex w-full justify-end p-5 pr-20">
        <Button variant="contained" onClick={handleRequest}>
          New Request
        </Button>
      </div>
      <div className="flex w-full justify-center h-screen">
        <div className="flex flex-col w-4/5">
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="caption table">
              <caption>A basic table example with a caption</caption>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <strong>Dessert (100g serving)</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>Calories</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>Fat&nbsp;(g)</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>Carbs&nbsp;(g)</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>Protein&nbsp;(g)</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.name}>
                    <TableCell component="th" scope="row">
                      {row.name}
                    </TableCell>
                    <TableCell align="right">{row.calories}</TableCell>
                    <TableCell align="right">{row.fat}</TableCell>
                    <TableCell align="right">{row.carbs}</TableCell>
                    <TableCell align="right">{row.protein}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </div>
    </div>
  );
}

export default Orders;
