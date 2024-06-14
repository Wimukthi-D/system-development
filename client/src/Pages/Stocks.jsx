import Primarybutton from "../Components/Primarybutton";
import React, { useState, useEffect } from "react";
import Table from "../Components/StockTable";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import Swal from "sweetalert2";
import SearchIcon from "@mui/icons-material/Search";
import { styled } from "@mui/system";
import Autocomplete from "@mui/material/Autocomplete";
import Stack from "@mui/material/Stack";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
import Navbar from "../Components/Navbar";
import { jwtDecode } from "jwt-decode";

function InputField({ placeholder }) {
  return (
    <input
      type="text"
      placeholder={placeholder}
      className="outline-none border-none w-96"
    />
  );
}

const RoundedTextField = styled(TextField)({
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
  },
});

function Stocks() {
  const [open, setOpen] = useState(false);
  const [stockData, setstockData] = useState({
    productID: "",
    drugname: "",
    GenericName: "",
    unitprice: "",
    Quantity: "",
    ExpireDate: dayjs(),
    stockDate: dayjs(),
    restock_level: "",
    CategoryName: "",
    BranchID: "",
  });
  const [productsData, setProductsData] = useState([
    {
      productID: "",
      drugname: "",
      genericName: "",
      categoryID: "",
      unitprice: "",
    },
  ]);

  const handleDateChange = (date, field) => {
    setstockData({ ...stockData, [field]: date });
  };

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [tableDataChanged, setTableDataChanged] = useState(false); // Track changes in table data

  useEffect(() => {
    // Fetch initial table data or refresh data when tableDataChanged state changes
    //fetchData();
  }, [tableDataChanged]);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setstockData({
      drugname: "",
      GenericName: "",
      unitprice: "",
      Quantity: "",
      ExpireDate: dayjs(),
      stockDate: dayjs(),
      restock_level: "",
      CategoryName: "",
      BranchID: "",
    });
    setErrors({});
    setShowPassword(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setstockData({ ...stockData, [name]: value });

    setErrors({ ...errors, [name]: "" }); // Clear the error when input changes
  };

  const [searchTerm, setSearchTerm] = useState("");
  function handleSearchInputChange(e) {
    setSearchTerm(e.target.value);
    console.log(searchTerm);
  }

  const validateForm = () => {
    const errors = {};
    if (!stockData.drugname.trim()) {
      errors.drugname = "Drug Name is required";
    } else if (!stockData.GenericName.trim()) {
      errors.GenericName = "Generic Name is required";
    } else if (!stockData.Quantity.trim()) {
      errors.Quantity = "Quantity is requires ";
    } else if (!stockData.unitprice.trim()) {
      errors.unitprice = "Unit Price is required";
    } else if (!stockData.ExpireDate) {
      errors.ExpireDate = "Expire Date is required";
    } else if (!stockData.stockDate) {
      errors.stockDate = "Stock Date is required";
    } else if (!stockData.BranchID) {
      errors.BranchID = "Branch is required";
    } else if (
      new Date(stockData.ExpireDate) <= new Date(stockData.stockDate)
    ) {
      errors.ExpireDate = "Expire Date must be later than Stock Date";
    }
    setErrors(errors);
    return Object.keys(errors).length === 0; // Return true if there are no errors
  };

  const { productID, BranchID, ExpireDate, stockDate, Quantity, unitprice } =
    stockData;
  const dataToSend = {
    productID,
    BranchID,
    ExpireDate,
    stockDate,
    Quantity,
    unitprice,
  };

  const handleAddstock = async () => {
    if (validateForm()) {
      try {
        const response = await fetch(
          "http://localhost:3001/api/Stock/addStock",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(dataToSend),
          }
        );

        if (response.ok) {
          // stock added successfully
          const data = await response.json();
          console.log("Item added:", data);
          Swal.fire({
            icon: "success",
            title: "Item Added Successfully!",
            customClass: {
              popup: "z-50", // Apply Tailwind CSS class to adjust z-index
            },
            didOpen: () => {
              document.querySelector(".swal2-container").style.zIndex = "9999"; // Adjust z-index here
            },
          }).then(() => {
            handleClose(); // Close the dialog box
            window.location.reload(); // Reload the table data
            setTableDataChanged((prevState) => !prevState); // <--- Add this line to update the tableDataChanged state
          });
        } else if (response.status === 400) {
          const { errors } = await response.json();
          // Handle specific error cases
          if (errors.Quantity) {
            Swal.fire({
              icon: "error",
              title: "Item Addition Failed",
              text: errors.Quantity,
              customClass: {
                popup: "z-50", // Apply Tailwind CSS class to adjust z-index
              },
              didOpen: () => {
                document.querySelector(".swal2-container").style.zIndex =
                  "9999"; // Adjust z-index here
              },
            });
          } else if (errors.unitprice) {
            Swal.fire({
              icon: "error",
              title: "Item Addition Failed",
              text: errors.unitprice,
              customClass: {
                popup: "z-50", // Apply Tailwind CSS class to adjust z-index
              },
              didOpen: () => {
                document.querySelector(".swal2-container").style.zIndex =
                  "9999"; // Adjust z-index here
              },
            });
          } else {
            // Handle other validation errors
            Swal.fire({
              icon: "error",
              title: "Item Addition Failed",
              text: "",
              html: Object.values(errors)
                .map((error) => `<div>${error}</div>`)
                .join(""),
              customClass: {
                popup: "z-50", // Apply Tailwind CSS class to adjust z-index
              },
              didOpen: () => {
                document.querySelector(".swal2-container").style.zIndex =
                  "9999"; // Adjust z-index here
              },
            });
          }
        } else {
          // Other server-side error
          console.error("Failed to add Item");
          Swal.fire({
            icon: "error",
            title: "Item Addition Failed",
            text: "An error occurred while adding the Item",
            customClass: {
              popup: "z-50", // Apply Tailwind CSS class to adjust z-index
            },
            didOpen: () => {
              document.querySelector(".swal2-container").style.zIndex = "9999"; // Adjust z-index here
            },
          });
        }
      } catch (error) {
        // Handle network or unexpected errors
        console.error("Error adding Item:", error);
        let errorMessage = "An error occurred while adding the Item.";
        Swal.fire({
          icon: "error",
          title: "Item Addition Failed",
          text: errorMessage,
          customClass: {
            popup: "z-50", // Apply Tailwind CSS class to adjust z-index
          },
          didOpen: () => {
            document.querySelector(".swal2-container").style.zIndex = "9999"; // Adjust z-index here
          },
        });
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "http://localhost:3001/api/stock/getProduct"
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        if (Array.isArray(data.products)) {
          setProductsData(data.products); // Directly set the products data
        } else {
          throw new Error("Data received is not in the expected format");
        }
      } catch (error) {
        console.error("Error fetching stock data:", error);
      }
    };

    fetchData();
  }, []);

  const token = localStorage.getItem("token");
  const parsedToken = JSON.parse(token);
  const decodedToken = jwtDecode(parsedToken.token);
  const Usertype = decodedToken.role;

  return (
    <div className="flex flex-col bg-[#EDEDED]">
      <div className=" flex flex-col bg-[#F7F7F7] ">
        <Navbar />
        <div className="flex  w-screen h-screen overflow-y-auto">
          <div className="flex-col w-full">
            <div className="flex justify-between mt-10 mx-10">
              <div className="flex ">
                <div className="bg-white border p-1 flex items-center rounded-xl">
                  <InputField placeholder="Search" />
                  <SearchIcon className="mx-2 opacity-50 rounded-full hover:scale-110 transition cursor-pointer" />
                </div>
              </div>
              <div>
                {!(Usertype == "Cashier") && (
                  <Primarybutton
                    text="Add Item"
                    addIcon="1"
                    onClick={handleClickOpen}
                    color="#139E0C"
                    hoverColor="#437729"
                    activeColor="#192c10"
                  />
                )}
              </div>
              <Dialog
                open={open}
                aria-labelledby="form-dialog-title"
                disableEscapeKeyDown={true}
                BackdropProps={{
                  style: { backdropFilter: "blur(5px)" },
                  invisible: true, // This will prevent backdrop click
                }}
              >
                <DialogTitle
                  id="form-dialog-title"
                  className="text-center font-extrabold"
                >
                  New Item
                </DialogTitle>
                <div className="mb-3">
                  <DialogContent>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Stack>
                          <Autocomplete
                            freeSolo
                            id="free-solo-2-demo"
                            disableClearable
                            options={productsData.map(
                              (product) => product.drugname
                            )}
                            renderInput={(params) => (
                              <RoundedTextField
                                {...params}
                                label="Drug Name"
                                InputProps={{
                                  ...params.InputProps,
                                  type: "search",

                                  onChange: handleSearchInputChange,
                                }}
                              />
                            )}
                            value={stockData.drugname} // Set the value prop
                            onChange={(event, newValue) => {
                              const selectedProduct = productsData.find(
                                (product) => product.drugname === newValue
                              );
                              setstockData((prevstockData) => ({
                                ...prevstockData,
                                drugname: newValue,
                                GenericName: selectedProduct
                                  ? selectedProduct.genericName
                                  : "", // Set the GenericName
                                restock_level: selectedProduct
                                  ? selectedProduct.restock_level
                                  : "", // Set the restock_level
                                productID: selectedProduct
                                  ? selectedProduct.productID
                                  : "", // Set the productID
                              }));
                            }}
                          />
                        </Stack>
                      </Grid>
                      <Grid item xs={6}>
                        <RoundedTextField
                          label="Generic Name"
                          name="GenericName"
                          disabled
                          value={stockData.GenericName}
                          onChange={handleChange}
                          fullWidth
                          error={Boolean(errors.GenericName)}
                          helperText={errors.GenericName}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DatePicker
                            label="Expire Date"
                            value={stockData.ExpireDate}
                            onChange={(date) =>
                              handleDateChange(date, "ExpireDate")
                            }
                            renderInput={(params) => (
                              <RoundedTextField
                                {...params}
                                fullWidth
                                name="ExpireDate"
                                error={!!errors.ExpireDate}
                                helperText={errors.ExpireDate}
                              />
                            )}
                          />
                        </LocalizationProvider>
                      </Grid>
                      <Grid item xs={6}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DatePicker
                            label="Stock Date"
                            value={stockData.stockDate}
                            onChange={(date) =>
                              handleDateChange(date, "stockDate")
                            }
                            renderInput={(params) => (
                              <RoundedTextField
                                {...params}
                                fullWidth
                                name="stockDate"
                                error={errors.stockDate}
                                helperText={errors.stockDate}
                              />
                            )}
                          />
                        </LocalizationProvider>
                      </Grid>
                      <Grid item xs={6}>
                        <RoundedTextField
                          label="Restock Level"
                          name="restock_level"
                          disabled
                          value={stockData.restock_level}
                          onChange={handleChange}
                          fullWidth
                          error={Boolean(errors.restock_level)}
                          helperText={errors.restock_level}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <RoundedTextField
                          label="Quantity"
                          name="Quantity"
                          type="number"
                          value={stockData.Quantity}
                          onChange={handleChange}
                          fullWidth
                          error={Boolean(errors.Quantity)}
                          helperText={errors.Quantity}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <RoundedTextField
                          label="Unit Price"
                          name="unitprice"
                          type="number"
                          value={stockData.unitprice}
                          onChange={handleChange}
                          fullWidth
                          error={Boolean(errors.unitprice)}
                          helperText={errors.unitprice}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <FormControl fullWidth error={Boolean(errors.BranchID)}>
                          <InputLabel>Branch</InputLabel>
                          <Select
                            value={stockData.BranchID}
                            label="BranchID"
                            onChange={handleChange}
                            name="BranchID"
                          >
                            <MenuItem value="1">Dankotuwa</MenuItem>
                            <MenuItem value="2">Marawila</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </DialogContent>
                </div>
                <DialogActions className="mx-4 mb-4">
                  <div className="flex w-full justify-around">
                    <div className="w-1/2">
                      <Primarybutton
                        onClick={handleAddstock}
                        text="Add Item"
                        fullWidth="1"
                        color="#139E0C"
                        hoverColor="#437729"
                        activeColor="#192c10"
                      />
                    </div>

                    <div className="w-1/2">
                      <Primarybutton
                        onClick={handleClose}
                        fullWidth="0"
                        text="Cancel"
                        color="red"
                        hoverColor="#dc2626"
                        activeColor="#450a0a"
                      />
                    </div>
                  </div>
                </DialogActions>
              </Dialog>
            </div>
            <div className="p-10">
              <Table reloadData={tableDataChanged} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Stocks;
