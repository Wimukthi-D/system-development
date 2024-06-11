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
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
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

function Row(props) {
  const { row } = props;
  const [open, setOpen] = React.useState(false);
  const [alertOpen, setAlertOpen] = React.useState(false);
  const [alertSeverity, setAlertSeverity] = React.useState("success");
  const [alertMessage, setAlertMessage] = React.useState("");
  const [token, setToken] = useState(null);
  const [Usertype, setUsertype] = useState(null);
  const handleAlertClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setAlertOpen(false);
    window.location.reload();
  };

  React.useEffect(() => {
    const storedData = localStorage.getItem("token");
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setToken(parsedData.token);

      try {
        const decodedToken = jwtDecode(parsedData.token);
        if (decodedToken) {
          setUsertype(decodedToken.role);
        }
      } catch (error) {
        setUsertype(null);
      }
    } else {
      setUsertype(null);
    }
  }, []);

  const handleApprove = () => {
    fetch(`http://localhost:3001/api/order/updatePending`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderID: row.orderID,
        status: "Approved",
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Order approved successfully:", data);
        setAlertMessage("Order approved successfully");
        setAlertSeverity("success");
        setAlertOpen(true);
      })
      .catch((error) => {
        console.error("Error approving order:", error);
        setAlertMessage("Error approving order");
        setAlertSeverity("error");
        setAlertOpen(true);
      });

    console.log("Approve order:", row.orderID);
  };

  const handleCancel = () => {
    fetch(`http://localhost:3001/api/order/updatePending`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderID: row.orderID,
        status: "Cancelled",
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Order Cancelled successfully:", data);
        setAlertMessage("Order Updated successfully");
        setAlertSeverity("success");
        setAlertOpen(true);
      })
      .catch((error) => {
        console.error("Error rejecting order:", error);
        setAlertMessage("Error rejecting order");
        setAlertSeverity("error");
        setAlertOpen(true);
      });

    console.log("Reject order:", row.orderID);
  };
  const handleConfirm = () => {
    fetch(`http://localhost:3001/api/order/updatePrice`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderID: row.orderID,
        status: "Confirmed",
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Order updated successfully:", data);
        setAlertMessage("Order updated successfully");
        setAlertSeverity("success");
        setAlertOpen(true);
      })
      .catch((error) => {
        console.error("Error confirming order:", error);
        setAlertMessage("Error confirming order");
        setAlertSeverity("error");
        setAlertOpen(true);
      });

    console.log("Confirm order:", row.orderID);
  };

  const handleDecline = () => {
    fetch(`http://localhost:3001/api/order/updatePrice`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderID: row.orderID,
        status: "Cancelled",
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Order updated successfully:", data);
        setAlertMessage("Order updated successfully");
        setAlertSeverity("success");
        setAlertOpen(true);
      })
      .catch((error) => {
        console.error("Error declining order:", error);
        setAlertMessage("Error declining order");
        setAlertSeverity("error");
        setAlertOpen(true);
      });

    console.log("Decline order:", row.orderID);
  };
  const handleReceived = () => {
    fetch(`http://localhost:3001/api/order/updateShipped`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderID: row.orderID,
        status: "Received",
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Order updated successfully:", data);
        setAlertMessage("Order updated successfully");
        setAlertSeverity("success");
        setAlertOpen(true);
      })
      .catch((error) => {
        console.error("Error declining order:", error);
        setAlertMessage("Error declining order");
        setAlertSeverity("error");
        setAlertOpen(true);
      });

    console.log("Decline order:", row.orderID);
  };

  const handleAccept = () => {
    const selectedData = row.products.map((product) => ({
      productID: product.productID,
      quantity: product.quantity,
      unitprice: product.unitprice,
    }));

    console.log(selectedData);
    fetch(`http://localhost:3001/api/order/updateReceived`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderID: row.orderID,
        status: "Accepted",
        products: selectedData,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Order updated successfully:", data);
        setAlertMessage("Order updated successfully");
        setAlertSeverity("success");
        setAlertOpen(true);
      })
      .catch((error) => {
        console.error("Error declining order:", error);
        setAlertMessage("Error declining order");
        setAlertSeverity("error");
        setAlertOpen(true);
      });

    console.log("Accept Order:", row.orderID);
  };

  const handleReject = () => {
    fetch(`http://localhost:3001/api/order/updateReceived`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderID: row.orderID,
        status: "Rejected",
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Order Cancelled successfully:", data);
        setAlertMessage("Order Updated successfully");
        setAlertSeverity("success");
        setAlertOpen(true);
      })
      .catch((error) => {
        console.error("Error rejecting order:", error);
        setAlertMessage("Error rejecting order");
        setAlertSeverity("error");
        setAlertOpen(true);
      });

    console.log("Reject order:", row.orderID);
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
        <TableCell>
          {row.FirstName} {row.LastName}
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
                        <TableCell>{product.unitprice}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
              {Usertype === "Manager" && row.status === "Pending" && (
                <Box className="flex gap-1">
                  <Button variant="contained" onClick={handleApprove}>
                    approve
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={handleCancel}
                  >
                    reject
                  </Button>
                </Box>
              )}
              {row.status === "Price Updated" && (
                <Box className="flex gap-1">
                  <Button variant="contained" onClick={handleConfirm}>
                    Confirm
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={handleDecline}
                  >
                    Decline
                  </Button>
                </Box>
              )}
              {Usertype === "Manager" &&
                (row.status === "Shipped" || row.status === "Received") && (
                  <Box className="flex gap-1">
                    <Button variant="contained" onClick={handleAccept}>
                      Accept
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={handleReject}
                    >
                      Reject
                    </Button>
                  </Box>
                )}
              {Usertype === "Staff" && row.status === "Shipped" && (
                <Box className="flex gap-1">
                  <Button variant="contained" onClick={handleReceived}>
                    Received
                  </Button>
                </Box>
              )}
            </Box>

            {row.note && (
              <Box sx={{ width: "80%" }}>
                <Table>
                  <TableRow>
                    <TableHead>
                      <TableCell>Note</TableCell>
                    </TableHead>
                    <TableBody>
                      <TableCell>
                        <strong>{row.note}</strong>
                      </TableCell>
                    </TableBody>
                  </TableRow>
                </Table>
              </Box>
            )}
          </Collapse>
        </TableCell>
      </TableRow>
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
    </React.Fragment>
  );
}

Row.propTypes = {
  row: PropTypes.shape({
    orderID: PropTypes.number.isRequired,
    FirstName: PropTypes.string.isRequired,
    LastName: PropTypes.string.isRequired,
    orderdate: PropTypes.string.isRequired,
    approvedate: PropTypes.string,
    deliverdate: PropTypes.string,
    receivedate: PropTypes.string,
    price: PropTypes.number,
    note: PropTypes.string,
    status: PropTypes.string.isRequired,
    products: PropTypes.arrayOf(
      PropTypes.shape({
        productID: PropTypes.number.isRequired,
        drugname: PropTypes.string.isRequired,
        genericName: PropTypes.string.isRequired,
        quantity: PropTypes.string.isRequired,
        unitprice: PropTypes.number,
      })
    ).isRequired,
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

  React.useEffect(() => {
    const storedData = localStorage.getItem("token");
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setToken(parsedData.token);

      try {
        const decodedToken = jwtDecode(parsedData.token);
        if (decodedToken) {
          setUsertype(decodedToken.role);
        }
      } catch (error) {
        setUsertype(null);
      }
    } else {
      setUsertype(null);
    }
  }, []);

  const fetchSupplierProducts = (supplierID) => {
    fetch(
      `http://localhost:3001/api/order/getSupplierProducts?supplierID=${supplierID}`
    )
      .then((response) => response.json())
      .then((data) => {
        setSupplierProducts(data.products);
      })
      .catch((error) => {
        console.error("Error fetching supplier products:", error);
      });
  };

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

  const handleAddOrder = () => {
    const selectedProducts = supplierProducts
      .filter((product) => product.selected)
      .map((product) => ({
        productID: product.productID,
        quantity: product.quantity,
      }));

    const orderData = {
      supplierID: selectedSupplier?.supplierID,
      products: selectedProducts,
      additionalInfo: additionalInfo,
      status: Usertype === "Manager" ? "Approved" : "Pending",
      approvedate: Usertype === "Manager" ? true : false,
    };

    console.log("Order Data:", orderData);

    // Send the data to the backend
    fetch("http://localhost:3001/api/order/CreateOrder", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((data) => {
            throw new Error(data.message);
          });
        }
        return response.json();
      })
      .then((data) => {
        console.log("Order added successfully:", data);
        setAlertMessage("Order added successfully");
        setAlertSeverity("success");
        setAlertOpen(true);
        handleCloseDialogTwo();
        // Handle success - maybe reset form or show a success message
      })
      .catch((error) => {
        console.error("Error adding order:", error);
        setAlertMessage("Error adding order");
        setAlertSeverity("error");
        setAlertOpen(true);
        // Handle error - maybe show an error message
      });
  };

  React.useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3001/api/order/getOrder",
          {
            params: { status: statusFilter },
          }
        );
        setOrders(response.data.orders);
      } catch (error) {
        console.error("Error fetching order data:", error);
      }
    };

    fetchOrders();
  }, [statusFilter]);

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

  const handleNewRequest = () => {
    setRequestOpen(true);
    console.log(requestOpen);
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
    <div>
      <Box>
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
              <Button // Button for new request
                variant="contained"
                color="success"
                size="small"
                onClick={handleNewRequest}
              >
                new request
              </Button>
            </Grid>
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
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Approved">Approved</MenuItem>
                  <MenuItem value="Rejected">Rejected</MenuItem>
                  <MenuItem value="Confirmed">Confirmed</MenuItem>
                  <MenuItem value="Shipped">Shipped</MenuItem>
                  <MenuItem value="Received">Received</MenuItem>
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
                  <strong>Supplier</strong>{" "}
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
      <Dialog // Dialog for new supply request
        open={requestOpen}
        aria-labelledby="form-dialog-title"
        disableEscapeKeyDown={true}
        BackdropProps={{
          style: { backdropFilter: "blur(5px)" },
          invisible: true, // This will prevent backdrop click
        }}
        maxWidth="xs"
        PaperProps={{ style: { borderRadius: "15px" } }}
        fullWidth={true}
      >
        <DialogTitle
          id="form-dialog-title"
          className="text-center font-extrabold"
        >
          New Request
        </DialogTitle>
        <div className="mb-3">
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Autocomplete
                  options={suppliers}
                  getOptionLabel={(option) =>
                    `${option.FirstName} ${option.LastName}`
                  }
                  renderInput={(params) => (
                    <TextField fullWidth {...params} label="Supplier" />
                  )}
                  onChange={(event, newValue) => {
                    if (newValue !== null) {
                      setSelectedSupplier(newValue);
                      fetchSupplierProducts(newValue.supplierID);
                    } else {
                      setSelectedSupplier(null);
                      setSupplierProducts([]);
                    }
                  }}
                />
              </Grid>
              {supplierProducts.map((product, index) => (
                <Grid
                  className="flex gap-3"
                  item
                  xs={12}
                  key={product.productID}
                >
                  <Grid item xs={8}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          color="primary"
                          checked={product.selected}
                          onChange={(event) => {
                            const updatedProducts = [...supplierProducts];
                            updatedProducts[index].selected =
                              event.target.checked;
                            setSupplierProducts(updatedProducts);
                          }}
                        />
                      }
                      label={product.drugname}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      fullWidth
                      label="Quantity"
                      type="number"
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ min: 0 }}
                      value={product.quantity}
                      onChange={(event) => {
                        const updatedProducts = [...supplierProducts];
                        updatedProducts[index].quantity = event.target.value;
                        setSupplierProducts(updatedProducts);
                      }}
                    />
                  </Grid>
                </Grid>
              ))}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Additional Info"
                  rows={4}
                  value={additionalInfo}
                  onChange={(event) => setAdditionalInfo(event.target.value)}
                />
              </Grid>
            </Grid>
          </DialogContent>
        </div>
        <DialogActions className="mx-4 mb-4">
          <div className="flex w-full gap-4 justify-around">
            <div className="w-full"></div>
            <Button
              variant="contained"
              color="error"
              size="small"
              onClick={handleCloseDialogTwo}
            >
              <ClearIcon />
            </Button>
            <Button
              variant="contained"
              size="small"
              color="success"
              onClick={() => {
                handleAddOrder();
              }}
            >
              <DoneIcon />
            </Button>
          </div>
        </DialogActions>
      </Dialog>

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
  );
}

export default CollapsibleTable;
