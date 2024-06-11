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
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUp from "@mui/icons-material/KeyboardArrowUp";
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

function Row({ row }) {
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState(null);
  const [Usertype, setUsertype] = useState(null);
  const [branchID, setBranchID] = useState(null);
  const [userID, setUserID] = useState(null);

  React.useEffect(() => {
    const storedData = localStorage.getItem("token");
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setToken(parsedData.token);

      try {
        const decodedToken = jwtDecode(parsedData.token);
        if (decodedToken) {
          setUsertype(decodedToken.role);
          setBranchID(decodedToken.branchID);
          setUserID(decodedToken.id);
        }
      } catch (error) {
        setUsertype(null);
      }
    } else {
      setUsertype(null);
    }
  }, []);

  const handleReject = () => {
    axios
      .put("http://localhost:3001/api/transfer/updatePending", {
        transferID: row.transferID,
        status: "Rejected",
      })
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        console.error("Error rejecting transfer request:", error);
      });
  };

  const handleConfirm = () => {
    axios
      .put("http://localhost:3001/api/transfer/updatePending", {
        transferID: row.transferID,
        status: "Confirmed",
      })
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        console.error("Error confirming transfer request:", error);
      });
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
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
        <TableCell>{row.branchName}</TableCell>
        <TableCell>{row.orderdate}</TableCell>
        <TableCell>{row.confirmdate}</TableCell>
        <TableCell>{row.price}</TableCell>
        <TableCell>{row.note}</TableCell>
        <TableCell>{row.status}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box
              className="flex justify-between items-center gap-10 px-4 "
              fullWidth
            >
              <Box sx={{ margin: 1, width: "80%" }}>
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

              {Usertype === "Manager" && branchID === 1 && (
                <Box className="flex gap-2" sx={{ margin: 1, width: "20%" }}>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={handleReject}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={handleConfirm}
                  >
                    Confirm
                  </Button>
                </Box>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

function Transfer() {
  const [token, setToken] = useState(null);
  const [usertype, setUsertype] = useState(null);
  const [branchID, setBranchID] = useState(null);
  const [userID, setUserID] = useState(null);
  const [open, setOpen] = useState(false);
  const [openAlert, setOpenAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState("success");
  const [productOptions, setProductOptions] = useState([]);
  const [fields, setFields] = useState([{ product: null, quantity: "" }]);
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [transfers, setTransfers] = useState([]);
  const [status, setStatus] = useState("");

  React.useEffect(() => {
    const storedData = localStorage.getItem("token");
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setToken(parsedData.token);

      try {
        const decodedToken = jwtDecode(parsedData.token);
        if (decodedToken) {
          setUsertype(decodedToken.role);
          setBranchID(decodedToken.branchID);
          setUserID(decodedToken.id);
        }
      } catch (error) {
        setUsertype(null);
      }
    } else {
      setUsertype(null);
    }
  }, []);

  const handleNewRequest = () => {
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setFields([{ product: null, quantity: "" }]);
    setAdditionalInfo("");
    setOpen(false);
  };

  useEffect(() => {
    // Fetch product data
    axios
      .get("http://localhost:3001/api/transfer/getProduct")
      .then((response) => {
        setProductOptions(response.data.products);
      })
      .catch((error) => {
        console.error("Error fetching product data:", error);
      });
  }, []);

  const handleAddField = () => {
    setFields([...fields, { product: null, quantity: "" }]);
  };

  const handleFieldChange = (index, field, value) => {
    const updatedFields = fields.map((f, i) =>
      i === index ? { ...f, [field]: value } : f
    );
    setFields(updatedFields);
  };

  const handleSubmit = () => {
    const productData = fields.map((field) => ({
      productID: field.product ? field.product.productID : null,
      quantity: field.quantity,
    }));

    const submittedData = {
      branchID: branchID,
      products: productData,
      note: additionalInfo,
      status: "Pending",
    };

    fetch("http://localhost:3001/api/transfer/submitRequest", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(submittedData),
    })
      .then((response) => {
        if (response.ok) {
          setFields([{ product: null, quantity: "" }]);
          setAdditionalInfo("");
          setOpen(false);
          setOpenAlert(true);
          setAlertMessage("Request submitted successfully");
          setAlertSeverity("success");
        } else {
          return response.json().then((error) => {
            throw new Error(error.message);
          });
        }
      })
      .catch((error) => {
        setOpenAlert(true);
        setAlertMessage(`Error: ${error.message}`);
        setAlertSeverity("error");
      });
  };

  useEffect(() => {
    axios
      .get("http://localhost:3001/api/transfer/getTransfer", {
        params: { status },
      })
      .then((response) => {
        setTransfers(response.data.transfers);
      })
      .catch((error) => {
        console.error("There was an error fetching the data!", error);
      });
  }, [status]);

  return (
    <div className="flex flex-col w-screen">
      <div className="p-4">
        <Box className="flex flex-col">
          <Box className="flex justify-between">
            {!(branchID === 1) && (
              <Box>
                {" "}
                <Button
                  variant="contained"
                  color="success"
                  size="small"
                  onClick={handleNewRequest}
                >
                  New Request
                </Button>
              </Box>
            )}
            <FormControl size="small" sx={{ minWidth: 240, marginBottom: 2 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                label="Status"
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="confirmed">Confirmed</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <TableContainer component={Paper}>
            <Table aria-label="collapsible table">
              <TableHead>
                <TableRow>
                  <TableCell />
                  <TableCell>Branch Name</TableCell>
                  <TableCell>Order Date</TableCell>
                  <TableCell>Confirm Date</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Note</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transfers.map((row) => (
                  <Row key={row.transferID} row={row} />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </div>
      <Dialog
        open={open}
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
              {fields.map((field, index) => (
                <React.Fragment key={index}>
                  <Grid item xs={8}>
                    <Autocomplete
                      options={productOptions}
                      getOptionLabel={(option) => option.drugname}
                      value={field.product}
                      onChange={(event, newValue) =>
                        handleFieldChange(index, "product", newValue)
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Product"
                          variant="outlined"
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      label="Quantity"
                      variant="outlined"
                      value={field.quantity}
                      onChange={(e) =>
                        handleFieldChange(index, "quantity", e.target.value)
                      }
                    />
                  </Grid>
                </React.Fragment>
              ))}
              {fields.length > 0 && (
                <Grid item xs={12}>
                  <TextField
                    label="Additional Information"
                    variant="outlined"
                    fullWidth
                    value={additionalInfo}
                    onChange={(e) => setAdditionalInfo(e.target.value)}
                  />
                </Grid>
              )}
            </Grid>
          </DialogContent>
        </div>
        <DialogActions className="mx-4 mb-4">
          <div className="flex w-full gap-4 justify-around">
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={handleAddField}
            >
              Add New
            </Button>
            <Button
              variant="contained"
              color="error"
              size="small"
              onClick={handleCloseDialog}
            >
              <ClearIcon />
            </Button>
            <Button
              variant="contained"
              size="small"
              color="success"
              onClick={handleSubmit}
            >
              <DoneIcon />
            </Button>
          </div>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={openAlert}
        autoHideDuration={6000}
        onClose={() => setOpenAlert(false)}
      >
        <Alert onClose={() => setOpenAlert(false)} severity={alertSeverity}>
          {alertMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default Transfer;
