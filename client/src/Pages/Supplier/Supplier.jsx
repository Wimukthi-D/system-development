import * as React from "react";
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
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import ClearIcon from "@mui/icons-material/Clear";
import DoneIcon from "@mui/icons-material/Done";
import Navbar from "../../Components/Navbar";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Autocomplete,
  Grid,
  Snackbar,
  Alert,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

function Row(props) {
  const { row } = props;
  const [open, setOpen] = React.useState(false);
  const [alertOpen, setAlertOpen] = React.useState(false);
  const [alertSeverity, setAlertSeverity] = React.useState("success");
  const [alertMessage, setAlertMessage] = React.useState("");
  const [deliveryDate, setDeliveryDate] = React.useState("");
  const [note, setNote] = React.useState(row.note || "");
  const [unitPrices, setUnitPrices] = React.useState([]);

  const handleAlertClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setAlertOpen(false);
    window.location.reload();
  };

  const handleShipping = () => {
    const data = {
      orderID: row.orderID,
      status: "Shipped",
      deliverDate: deliveryDate,
      note: note,
    };
    console.log("sent Data:", data);
    fetch(`http://localhost:3001/api/order/updateConfirmed`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Order Shipped successfully:", data);
        setAlertMessage("Status updated successfully");
        setAlertSeverity("success");
        setAlertOpen(true);
      })
      .catch((error) => {
        console.error("Error rejecting order:", error);
        setAlertMessage("Error Updating order status");
        setAlertSeverity("error");
        setAlertOpen(true);
      });

    console.log("Updated order:", row.orderID);
  };

  const handleUnitPriceChange = (value, productID) => {
    const updatedUnitPrices = unitPrices.filter(
      (item) => item.productID !== productID
    );
    updatedUnitPrices.push({ productID, unitprice: value });
    setUnitPrices(updatedUnitPrices);
  };

  const handleDone = () => {
    const data = {
      orderID: row.orderID,
      status: "Price Updated",
      note: note,
      unitPrices: unitPrices,
      price: row.products.reduce((acc, product) => {
        const unitPrice = unitPrices.find(
          (item) => item.productID === product.productID
        );
        if (unitPrice) {
          return acc + unitPrice.unitprice * product.quantity;
        } else {
          return acc + product.unitprice * product.quantity;
        }
      }, 0),
    };

    console.log("sent Data:", data);

    fetch(`http://localhost:3001/api/order/updateApproved`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Order Approved successfully:", data);
        setAlertMessage("Status updated successfully");
        setAlertSeverity("success");
        setAlertOpen(true);
      })
      .catch((error) => {
        console.error("Error approving order:", error);
        setAlertMessage("Error Updating order status");
        setAlertSeverity("error");
        setAlertOpen(true);
      });
  };

  const handleReject = () => {
    setOpen(false);
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
        <TableCell>{row.orderdate}</TableCell>
        <TableCell>{row.approvedate}</TableCell>
        <TableCell>{row.deliverdate}</TableCell>
        <TableCell>{row.receivedate}</TableCell>
        <TableCell>{row.price}</TableCell>
        <TableCell>{row.status}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={9}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box
              className="flex"
              alignItems="center"
              justifyContent="space-between"
              px={2}
            >
              <Box sx={{ width: "80%" }}>
                <Typography variant="h6" gutterBottom component="div">
                  Products
                </Typography>
                <Table size="small" aria-label="purchases">
                  <TableHead>
                    <TableRow>
                      <TableCell>Drug Name</TableCell>
                      <TableCell>Generic Name</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>Unit Price</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {row.products.map((product) => (
                      <TableRow key={product.productID}>
                        <TableCell>{product.drugname}</TableCell>
                        <TableCell>{product.genericName}</TableCell>
                        <TableCell>{product.quantity}</TableCell>
                        <TableCell>
                          {row.status === "Approved" ? (
                            <TextField
                              label="Unit Price"
                              type="number"
                              value={product.unitprice}
                              onChange={(e) =>
                                handleUnitPriceChange(
                                  e.target.value,
                                  product.productID
                                )
                              }
                            />
                          ) : (
                            product.unitprice
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
              {row.status === "Confirmed" && (
                <Box className="flex gap-1">
                  <TextField
                    label="Delivery Date"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    sx={{ marginRight: 2 }}
                  />
                  <Button variant="contained" onClick={handleShipping}>
                    Shipped
                  </Button>
                </Box>
              )}
              {row.status === "Approved" && (
                <Box className="flex gap-1">
                  <Button
                    variant="contained"
                    color="error"
                    onClick={handleReject}
                  >
                    <ClearIcon />
                  </Button>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={handleDone}
                  >
                    <DoneIcon />
                  </Button>
                </Box>
              )}
            </Box>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Notes
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                variant="outlined"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
      <Snackbar
        open={alertOpen}
        autoHideDuration={6000}
        onClose={handleAlertClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleAlertClose}
          severity={alertSeverity}
          sx={{ width: "100%" }}
        >
          {alertMessage}
        </Alert>
      </Snackbar>
    </React.Fragment>
  );
}

Row.propTypes = {
  row: PropTypes.shape({
    orderID: PropTypes.number.isRequired,
    FirstName: PropTypes.string.isRequired,
    LastName: PropTypes.string.isRequired,
    userID: PropTypes.number.isRequired,
    orderdate: PropTypes.string.isRequired,
    approvedate: PropTypes.string,
    deliverdate: PropTypes.string,
    receivedate: PropTypes.string,
    price: PropTypes.number.isRequired,
    status: PropTypes.string.isRequired,
    products: PropTypes.arrayOf(
      PropTypes.shape({
        productID: PropTypes.number.isRequired,
        drugname: PropTypes.string.isRequired,
        genericName: PropTypes.string.isRequired,
        quantity: PropTypes.number.isRequired,
        unitprice: PropTypes.number.isRequired,
      })
    ).isRequired,
    note: PropTypes.string,
  }).isRequired,
};

function CollapsibleTable() {
  const [orders, setOrders] = React.useState([]);
  const [order, setOrder] = React.useState("asc");
  const [orderBy, setOrderBy] = React.useState("orderID");
  const [statusFilter, setStatusFilter] = React.useState("");
  const [requestOpen, setRequestOpen] = React.useState(false);
  const [suppliers, setSuppliers] = React.useState([]);
  const [selectedSupplier, setSelectedSupplier] = React.useState(null);
  const [supplierProducts, setSupplierProducts] = React.useState([]);
  const [additionalInfo, setAdditionalInfo] = React.useState("");
  const [alertOpen, setAlertOpen] = React.useState(false);
  const [alertSeverity, setAlertSeverity] = React.useState("success");
  const [alertMessage, setAlertMessage] = React.useState("");
  const [token, setToken] = useState(null);
  const [Usertype, setUsertype] = useState(null);
  const [userID, setUserID] = useState([]);

  React.useEffect(() => {
    const storedData = localStorage.getItem("token");
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setToken(parsedData.token);

      try {
        const decodedToken = jwtDecode(parsedData.token);
        if (decodedToken) {
          setUsertype(decodedToken.role);
          setUserID(decodedToken.id);
        }
      } catch (error) {
        setUsertype(null);
        setUserID(null);
      }
    } else {
      setUsertype(null);
      setUserID(null);
    }
  }, []);

  const handleAlertClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setAlertOpen(false);
  };

  const handleCloseDialogTwo = () => {
    setRequestOpen(false);
    setSelectedSupplier(null);
  };

  React.useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3001/api/order/getSpecificOrder",
          {
            params: { status: statusFilter, userID: userID },
          }
        );

        console.log(statusFilter, userID, response.data.orders);
        setOrders(response.data.orders);
      } catch (error) {
        console.error("Error fetching order data:", error);
      }
    };

    fetchOrders();
  }, [statusFilter, userID]);

  React.useEffect(() => {
    fetch("http://localhost:3001/api/order/getSupplier")
      .then((response) => response.json())
      .then((data) => setSuppliers(data.suppliers))
      .catch((error) => console.error("Error fetching suppliers:", error));
  }, []);

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
  };
  const sortedOrders = React.useMemo(() => {
    return [...orders].sort((a, b) => {
      if (orderBy === "orderID" || orderBy === "price") {
        return (order === "asc" ? 1 : -1) * (a[orderBy] - b[orderBy]);
      } else {
        return (
          (order === "asc" ? 1 : -1) *
          (new Date(a[orderBy]) - new Date(b[orderBy]))
        );
      }
    });
  }, [orders, order, orderBy]);

  return (
    <div className="flex flex-col w-screen">
      <div>
        <Navbar />
      </div>
      <div>
        <div>
          <Box className="flex-col p-5">
            <Box className="flex p-2">
              <Grid
                container
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                item
                xs={12}
              >
                <Grid item xs={4}>
                  <FormControl fullWidth margin="normal" size="small">
                    <InputLabel id="status-filter-label">
                      Filter by Status
                    </InputLabel>
                    <Select
                      labelId="status-filter-label"
                      value={statusFilter}
                      onChange={handleStatusFilterChange}
                      label="Filter by Status"
                    >
                      <MenuItem value="">
                        <em>All</em>
                      </MenuItem>
                      <MenuItem value="Approved">Approved</MenuItem>
                      <MenuItem value="Rejected">Rejected</MenuItem>
                      <MenuItem value="Confirmed">Confirmed</MenuItem>
                      <MenuItem value="Shipped">Shipped</MenuItem>
                      <MenuItem value="Price Updated">Price Updated</MenuItem>
                      <MenuItem value="Received">Received</MenuItem>
                      <MenuItem value="Accepted">Accepted</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
            <TableContainer component={Paper}>
              <Table aria-label="collapsible table">
                <TableHead sx={{ backgroundColor: "#bdbdbd" }}>
                  <TableRow>
                    <TableCell />
                    <TableCell>
                      <TableSortLabel
                        active={orderBy === "orderID"}
                        direction={orderBy === "orderID" ? order : "asc"}
                        onClick={() => handleRequestSort("orderID")}
                      >
                        <strong>Order ID</strong>
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={orderBy === "orderdate"}
                        direction={orderBy === "orderdate" ? order : "asc"}
                        onClick={() => handleRequestSort("orderdate")}
                      >
                        <strong>Ordered</strong>
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={orderBy === "approvedate"}
                        direction={orderBy === "approvedate" ? order : "asc"}
                        onClick={() => handleRequestSort("approvedate")}
                      >
                        <strong>Approved</strong>
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={orderBy === "deliverdate"}
                        direction={orderBy === "deliverdate" ? order : "asc"}
                        onClick={() => handleRequestSort("deliverdate")}
                      >
                        <strong>Delivery</strong>
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={orderBy === "receivedate"}
                        direction={orderBy === "receivedate" ? order : "asc"}
                        onClick={() => handleRequestSort("receivedate")}
                      >
                        <strong>Received</strong>
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={orderBy === "price"}
                        direction={orderBy === "price" ? order : "asc"}
                        onClick={() => handleRequestSort("price")}
                      >
                        <strong>Price</strong>
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <strong>Status</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedOrders.map((row) => (
                    <Row key={row.orderID} row={row} />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </div>

        <Snackbar // Alert Snackbar
          open={alertOpen}
          autoHideDuration={6000}
          onClose={handleAlertClose}
        >
          <Alert
            onClose={handleAlertClose}
            severity={alertSeverity}
            sx={{ width: "100%" }}
          >
            {alertMessage}
          </Alert>
        </Snackbar>
      </div>
    </div>
  );
}

export default CollapsibleTable;
