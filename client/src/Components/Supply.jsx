import * as React from "react";
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
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import DoneIcon from "@mui/icons-material/Done";
import ClearIcon from "@mui/icons-material/Clear";
import OrderTable from "./OrderTable";
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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

function Row(props) {
  const { row, onOpenDialog } = props;
  const [open, setOpen] = React.useState(false);
  const [products, setProducts] = React.useState([]);

  React.useEffect(() => {
    if (open && products.length === 0) {
      fetch(
        `http://localhost:3001/api/order/getSupplierProducts?supplierID=${row.supplierID}`
      )
        .then((response) => response.json())
        .then((data) => setProducts(data.products))
        .catch((error) => console.error("Error fetching products:", error));
    }
  }, [open, row.supplierID, products.length]);

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
          {row.FirstName} {row.LastName}
        </TableCell>
        <TableCell align="right">{row.email}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Box className="flex w-full justify-between">
                <Typography variant="h6" gutterBottom component="div">
                  Products
                </Typography>
                <Box className="flex h-1/2 gap-2 w-1/6">
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => onOpenDialog(row.supplierID)}
                  >
                    <AddIcon />
                  </Button>
                </Box>
              </Box>
              <Table size="small" aria-label="products">
                <TableHead>
                  <TableRow>
                    <TableCell>Drug Name</TableCell>
                    <TableCell>Generic Name</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.drugname}>
                      <TableCell>{product.drugname}</TableCell>
                      <TableCell>{product.genericName}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

Row.propTypes = {
  row: PropTypes.shape({
    supplierID: PropTypes.number.isRequired,
    userID: PropTypes.number.isRequired,
    FirstName: PropTypes.string.isRequired,
    LastName: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
  }).isRequired,
  onOpenDialog: PropTypes.func.isRequired,
};

function Supply() {
  const [suppliers, setSuppliers] = React.useState([]);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [productOptions, setProductOptions] = React.useState([]);
  const [selectedProduct, setSelectedProduct] = React.useState(null);
  const [selectedSupplierID, setSelectedSupplierID] = React.useState(null);
  const [alertOpen, setAlertOpen] = React.useState(false);
  const [alertMessage, setAlertMessage] = React.useState("");
  const [alertSeverity, setAlertSeverity] = React.useState("success");
  const [Usertype, setUsertype] = React.useState(null);
  const [token, setToken] = React.useState(null);
  const [firstName, setFirstName] = React.useState(null);

  const handleOpenDialog = (supplierID) => {
    setSelectedSupplierID(supplierID);
    setDialogOpen(true);
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
          setFirstName(decodedToken.FirstName);
        }
      } catch (error) {
        setUsertype(null);
      }
    } else {
      setUsertype(null);
    }
  }, []);

  const handleCloseDialogOne = () => {
    setDialogOpen(false);
  };

  const handleAlertClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setAlertOpen(false);
  };

  React.useEffect(() => {
    fetch("http://localhost:3001/api/order/getSupplier")
      .then((response) => response.json())
      .then((data) => setSuppliers(data.suppliers))
      .catch((error) => console.error("Error fetching suppliers:", error));
  }, []);

  React.useEffect(() => {
    if (dialogOpen && productOptions.length === 0) {
      fetch("http://localhost:3001/api/order/getProduct")
        .then((response) => response.json())
        .then((data) => setProductOptions(data.products))
        .catch((error) => console.error("Error fetching products:", error));
    }
  }, [dialogOpen, productOptions.length]);

  const handleAddProducts = () => {
    const data = {
      productID: selectedProduct.productID,
      supplierID: selectedSupplierID,
    };
    console.log(data);
    fetch("http://localhost:3001/api/order/Assign", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
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
        console.log("Response:", data);
        setAlertMessage(data.message);
        setAlertSeverity("success");
        setAlertOpen(true);
        handleCloseDialogOne();
      })
      .catch((error) => {
        console.error("There was a problem with your fetch operation:", error);
        setAlertMessage(error.message);
        setAlertSeverity("error");
        setAlertOpen(true);
      });
  };

  React.useEffect(() => {
    fetch("http://localhost:3001/api/order/getSupplier")
      .then((response) => response.json())
      .then((data) => setSuppliers(data.suppliers))
      .catch((error) => console.error("Error fetching suppliers:", error));
  }, []);

  React.useEffect(() => {
    if (dialogOpen && productOptions.length === 0) {
      fetch("http://localhost:3001/api/order/getProduct")
        .then((response) => response.json())
        .then((data) => setProductOptions(data.products))
        .catch((error) => console.error("Error fetching products:", error));
    }
  }, [dialogOpen, productOptions.length]);

  return (
    <div className="flex flex-col w-screen ">
      <div className="flex w-full ">
        <div className="flex flex-col w-3/10 px-2 pb-2 pt-5">
          {Usertype === "Manager" && (
            <TableContainer component={Paper}>
              <Table aria-label="collapsible table">
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#bdbdbd" }}>
                    <TableCell />
                    <TableCell>
                      <strong>Supplier</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>Email</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {suppliers.map((row) => (
                    <Row
                      key={row.supplierID}
                      row={row}
                      onOpenDialog={handleOpenDialog}
                    />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </div>
        <div
          className={`flex flex-col p-2 ${
            Usertype === "Manager" ? "w-3/4" : "w-screen "
          }`}
        >
          <OrderTable />
        </div>
      </div>
      <div className="flex flex-col ">
        <Dialog // Dialog for assigning products
          open={dialogOpen}
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
            Assign Products
          </DialogTitle>
          <div className="mb-3">
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Autocomplete
                    options={productOptions}
                    getOptionLabel={(option) => option.drugname}
                    renderInput={(params) => (
                      <TextField fullWidth {...params} label="Product" />
                    )}
                    onChange={(event, newValue) => setSelectedProduct(newValue)}
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
                onClick={handleCloseDialogOne}
              >
                <ClearIcon />
              </Button>
              <Button
                variant="contained"
                size="small"
                color="success"
                onClick={() => {
                  console.log(selectedProduct);
                  handleAddProducts();
                }}
              >
                <DoneIcon />
              </Button>
            </div>
          </DialogActions>
        </Dialog>
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
  );
}

export default Supply;
