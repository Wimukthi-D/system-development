import React, { useEffect, useState } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

const HistoryTable = () => {
  const [history, setHistory] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [customerMap, setCustomerMap] = useState({});
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("");

  useEffect(() => {
    fetchHistory();
    fetchCustomers();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3001/api/bill/getHistory"
      );
      const groupedData = groupBy(response.data.history, "saleID");

      // Calculate totals for each saleID
      for (const saleID in groupedData) {
        const total = groupedData[saleID].reduce(
          (sum, item) => sum + item.quantity * item.unitprice,
          0
        );
        groupedData[saleID].total = total;
      }

      setHistory(groupedData);
    } catch (error) {
      console.error("Error fetching history data:", error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3001/api/bill/getCustomer"
      );
      const customers = response.data.customers;
      setCustomers(customers);

      const customerMap = customers.reduce((acc, customer) => {
        acc[customer.customerID] = customer.FirstName;
        return acc;
      }, {});
      setCustomerMap(customerMap);
    } catch (error) {
      console.error("Error fetching customer data:", error);
    }
  };

  const groupBy = (array, key) => {
    return array.reduce((result, currentValue) => {
      (result[currentValue[key]] = result[currentValue[key]] || []).push(
        currentValue
      );
      return result;
    }, {});
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const sortedHistory = (rows) => {
    const comparator = (a, b) => {
      if (order === "asc") {
        return a[orderBy] > b[orderBy] ? 1 : -1;
      } else {
        return a[orderBy] < b[orderBy] ? 1 : -1;
      }
    };
    return rows.sort(comparator);
  };

  return (
    <TableContainer component={Paper}>
      <Table aria-label="collapsible table">
        <TableHead>
          <TableRow sx={{ backgroundColor: "#bdbdbd" }}>
            <TableCell />
            <TableCell sortDirection={orderBy === "saleID" ? order : false}>
              <TableSortLabel
                active={orderBy === "saleID"}
                direction={orderBy === "saleID" ? order : "asc"}
                onClick={() => handleRequestSort("saleID")}
              >
                <strong>Sale ID</strong>
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <strong>Total (LKR)</strong>
            </TableCell>
            <TableCell sortDirection={orderBy === "branchName" ? order : false}>
              <TableSortLabel
                active={orderBy === "branchName"}
                direction={orderBy === "branchName" ? order : "asc"}
                onClick={() => handleRequestSort("branchName")}
              >
                <strong>Branch Name</strong>
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <strong>Cashier</strong>
            </TableCell>
            <TableCell>
              <strong>Date Time</strong>
            </TableCell>
            <TableCell>
              <strong>Customer Name</strong>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedHistory(Object.keys(history)).map((saleID) => (
            <Row
              key={saleID}
              saleID={saleID}
              rows={history[saleID]}
              customerMap={customerMap}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const Row = ({ saleID, rows, customerMap }) => {
  const [open, setOpen] = useState(false);
  const firstRow = rows[0];
  const total = rows.total; // Access the total calculated in fetchHistory

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
        <TableCell>{saleID}</TableCell>
        <TableCell>{total.toFixed(2)}</TableCell> {/* Display the total */}
        <TableCell>{firstRow.branchName}</TableCell>
        <TableCell>{firstRow.FirstName}</TableCell>
        <TableCell>{firstRow.date_time}</TableCell>
        <TableCell>{customerMap[firstRow.customer_ID]}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={11}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box
              sx={{
                margin: 1,
                width: "100%",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <Box sx={{ width: "50%" }}>
                {/* <Typography
                  variant="h6"
                  gutterBottom
                  component="div"
                  align="left"
                >
                  Details
                </Typography> */}
                <Table size="small" aria-label="details">
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <strong>Drug Name</strong>{" "}
                      </TableCell>
                      <TableCell>
                        <strong> Generic Name</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Quantity</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Unit Price</strong>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((row) => (
                      <TableRow key={row.saleID}>
                        <TableCell>{row.drugname}</TableCell>
                        <TableCell>{row.genericName}</TableCell>
                        <TableCell>{row.quantity}</TableCell>
                        <TableCell>{row.unitprice}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
};

Row.propTypes = {
  saleID: PropTypes.number.isRequired,
  rows: PropTypes.arrayOf(
    PropTypes.shape({
      branchID: PropTypes.number.isRequired,
      branchName: PropTypes.string.isRequired,
      FirstName: PropTypes.string.isRequired,
      date_time: PropTypes.string.isRequired,
      quantity: PropTypes.number.isRequired,
      unitprice: PropTypes.number.isRequired,
      drugname: PropTypes.string.isRequired,
      genericName: PropTypes.string.isRequired,
      customer_ID: PropTypes.number.isRequired,
    })
  ).isRequired,
  customerMap: PropTypes.object.isRequired,
};

export default HistoryTable;
