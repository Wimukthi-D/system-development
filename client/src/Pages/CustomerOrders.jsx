import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import Navbar from "../Components/Navbar";
import Button from "@mui/material/Button";
import { jwtDecode } from "jwt-decode";
import DownloadIcon from "@mui/icons-material/Download";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Header from "../assets/Header.png";

function Row({ row }) {
  const [open, setOpen] = useState(false);

  const handleGeneratePDF = async (products) => {
    const input = document.getElementById(`invoice-${row.orderID}`);
    const canvas = await html2canvas(input);
    const imgData = canvas.toDataURL("image/png", 1.0); // Capture the invoice as an image
    const pdf = new jsPDF();
    const date = new Date().toLocaleString();

    const loadImage = (src) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = src;
        img.onload = () => resolve(img);
        img.onerror = (err) => reject(err);
      });
    };

    try {
      const logo = await loadImage(Header); // Path to your logo

      // Add logo to the PDF
      pdf.addImage(logo, "PNG", 0, 0, 210, 45); // Adjust the position and size as needed

      // Set font size for the header
      pdf.setFontSize(12);
      pdf.text(`Date & Time: ${date}`, 10, 45);

      const tableRows = products.map((item) => [
        item.drugname,
        item.unitprice,
        item.quantity,
        item.unitprice * item.quantity,
      ]);

      // Set font size for the table header
      pdf.setFontSize(12);
      pdf.autoTable({
        head: [["Product", "Unit Price", "Quantity", "Total"]],
        body: tableRows,
        startY: 65,
      });

      pdf.save(`Order_${row.orderID}.pdf`);
    } catch (error) {
      console.error("Error loading the logo image:", error);
    }
  };

  return (
    <React.Fragment>
      <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          {row.orderID}
        </TableCell>
        <TableCell align="right">{row.branchName}</TableCell>
        <TableCell align="right">{row.FirstName}</TableCell>
        <TableCell align="right">{row.date_time}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box
              id={`invoice-${row.orderID}`} // Add an ID to the Box component
              sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <Box sx={{ margin: 1, width: "80%" }}>
                <Typography variant="h6" gutterBottom component="div">
                  Products
                </Typography>
                <Table size="small" aria-label="products">
                  <TableHead>
                    <TableRow>
                      <TableCell>Drug Name</TableCell>
                      <TableCell>Generic Name</TableCell>
                      <TableCell align="right">Quantity</TableCell>
                      <TableCell align="right">Unit Price</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {row.products.map((product) => (
                      <TableRow key={product.drugname}>
                        <TableCell component="th" scope="row">
                          {product.drugname}
                        </TableCell>
                        <TableCell>{product.genericName}</TableCell>
                        <TableCell align="right">{product.quantity}</TableCell>
                        <TableCell align="right">{product.unitprice}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
              <div className="flex p-10">
                <Box>
                  <Button
                    size="large"
                    variant="contained"
                    onClick={() => handleGeneratePDF(row.products)}
                  >
                    <DownloadIcon />
                  </Button>
                </Box>
              </div>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

Row.propTypes = {
  row: PropTypes.shape({
    orderID: PropTypes.number.isRequired,
    branchName: PropTypes.string.isRequired,
    FirstName: PropTypes.string.isRequired,
    date_time: PropTypes.string.isRequired,
    products: PropTypes.arrayOf(
      PropTypes.shape({
        drugname: PropTypes.string.isRequired,
        genericName: PropTypes.string.isRequired,
        quantity: PropTypes.number.isRequired,
        unitprice: PropTypes.number.isRequired,
      })
    ).isRequired,
  }).isRequired,
};

export default function CollapsibleTable() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const storedData = localStorage.getItem("token");
    if (!storedData) {
      return;
    }
    const parsedData = JSON.parse(storedData);
    const decodedToken = jwtDecode(parsedData.token);
    axios
      .get(
        `http://localhost:3001/api/bill/getCustomerHistory?userID=${decodedToken.id}`
      )
      .then((response) => {
        const data = response.data.history;

        const groupedData = data.reduce((acc, item) => {
          const order = acc.find((order) => order.orderID === item.saleID);
          const product = {
            drugname: item.drugname,
            genericName: item.genericName,
            quantity: item.quantity,
            unitprice: item.unitprice,
          };
          if (order) {
            order.products.push(product);
          } else {
            acc.push({
              orderID: item.saleID,
              branchName: item.branchName,
              FirstName: item.FirstName,
              date_time: item.date_time,
              products: [product],
            });
          }
          return acc;
        }, []);

        setRows(groupedData);
      })
      .catch((error) => {
        console.error("Error fetching history data:", error);
      });
  }, []);

  return (
    <div>
      <Navbar />{" "}
      <div className="flex p-20">
        {" "}
        <TableContainer component={Paper}>
          <Table aria-label="collapsible table">
            <TableHead>
              <TableRow sx={{ backgroundColor: "#81c784" }}>
                <TableCell />
                <TableCell>Order ID</TableCell>
                <TableCell align="right">Branch Name</TableCell>
                <TableCell align="right">Customer Name</TableCell>
                <TableCell align="right">Date & Time</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <Row key={row.orderID} row={row} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </div>
  );
}
