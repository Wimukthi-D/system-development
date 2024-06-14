import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import KeyboardArrowDowUnitPriceon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Swal from "sweetalert2";
import PrimaryButton from "./Primarybutton";
import Dummyimg from "../assets/dummy.webp";

function createData(
  productID,
  id,
  DrugName,
  GenericName,
  BranchName,
  UnitPrice,
  Quantity,
  ExpireDate,
  StockDate,
  RestockLevel,
  BranchID,
  CategoryName,
  image
) {
  return {
    productID,
    id,
    DrugName,
    GenericName,
    BranchName,
    UnitPrice,
    Quantity,
    ExpireDate,
    StockDate,
    RestockLevel,
    BranchID,
    CategoryName,
    image,
  };
}

function Row({ row, isOpen, onExpand }) {
  const [errors, setErrors] = useState({});
  const [stockData, setstockData] = useState({
    productID: row.id,
    stockID: row.id,
    DrugName: row.DrugName,
    GenericName: row.GenericName,
    UnitPrice: row.UnitPrice,
    Quantity: row.Quantity,
    ExpireDate: row.ExpireDate,
    StockDate: row.StockDate,
    RestockLevel: row.RestockLevel,
    BranchID: row.BranchID,
    CategoryName: row.CategoryName,
    BranchName: row.branchName,
    image: row.image,
  });

  useEffect(() => {
    //when the expand is open do these things
    setstockData({
      productID: row.id,
      stockID: row.id,
      DrugName: row.DrugName,
      GenericName: row.GenericName,
      UnitPrice: row.UnitPrice,
      Quantity: row.Quantity,
      ExpireDate: row.ExpireDate,
      StockDate: row.StockDate,
      RestockLevel: row.RestockLevel,
      BranchID: row.BranchID,
      CategoryName: row.categoryName,
      BranchName: row.branchName,
      image: row.image,
    });

    setErrors({});
  }, [row, isOpen]);

  useEffect(() => {
    // Reset BranchID to an empty string when stocktype changes
    setstockData((prevstockData) => ({
      ...prevstockData,
      BranchID: "",
    }));
  }, [stockData.stocktype]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    let newErrors = { ...errors };

    // Validation logic
    switch (name) {
      case "quantity":
        if (!/^\d+$/.test(newValue)) {
          newErrors[name] = "Quantity must be a number";
        } else {
          newErrors[name] = "";
        }
        break;
      case "unitprice":
        if (!/^\d+(\.\d{1,2})?$/.test(newValue)) {
          newErrors[name] = "Unit price must be a valid number";
        } else {
          newErrors[name] = "";
        }
        break;
      case "expiredate":
        const stockDate = new Date(stockData.StockDate);
        const expireDate = new Date(newValue);
        if (stockDate && expireDate <= stockDate) {
          newErrors[name] = "Expire date must be later than stock date";
        } else {
          newErrors[name] = "";
        }
        break;
      case "stockdate":
        const expDate = new Date(stockData.ExpireDate);
        const newStockDate = new Date(newValue); // Rename variable to avoid redeclaration
        if (expDate && newStockDate >= expDate) {
          newErrors["expiredate"] = "Expire date must be later than stock date";
        } else {
          newErrors["expiredate"] = "";
        }
        break;
      default:
        break;
    }

    setstockData({ ...stockData, [name]: newValue });
    setErrors(newErrors);
  };

  const validateForm = () => {
    const errors = {};
    if (!stockData.DrugName?.trim()) {
      errors.DrugName = "Drug Name is required";
    }
    if (!stockData.GenericName?.trim()) {
      errors.GenericName = "Generic Name is required";
    }
    if (!stockData.UnitPrice) {
      errors.UnitPrice = "Unit Price is required";
    } else if (isNaN(stockData.UnitPrice)) {
      errors.UnitPrice = "Unit Price must be a number";
    }
    if (!stockData.Quantity) {
      errors.Quantity = "Quantity is required";
    } else if (isNaN(stockData.Quantity)) {
      errors.Quantity = "Quantity must be a number";
    }
    if (!stockData.ExpireDate?.trim()) {
      errors.ExpireDate = "Expire Date is required";
    }
    if (!stockData.StockDate?.trim()) {
      errors.StockDate = "Stock Date is required";
    } else if (
      new Date(stockData.ExpireDate) <= new Date(stockData.StockDate)
    ) {
      errors.ExpireDate = "Expire Date must be later than Stock Date";
    }
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const { productID, BranchID, ExpireDate, StockDate, Quantity, UnitPrice } =
    stockData;
  const dataToUpdate = {
    productID,
    BranchID,
    ExpireDate,
    StockDate,
    Quantity,
    UnitPrice,
  };

  const handleUpdate = async () => {
    if (validateForm()) {
      console.log("Form is valid");
      console.log("Stock Data before request:", dataToUpdate); // Log stockData here

      try {
        const confirmed = await Swal.fire({
          icon: "warning",
          title: "Are you sure?",
          text: "You are about to update this Item. This action cannot be undone.",
          showCancelButton: true,
          confirmButtonText: "Yes, update it!",
          cancelButtonText: "Cancel",
        });

        if (confirmed.isConfirmed) {
          const response = await fetch(
            `http://localhost:3001/api/stock/updateStock/${row.id}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(dataToUpdate), // Ensure stockData is correct here
            }
          );

          if (response.ok) {
            const data = await response.json();
            const stockID = data.stockID;
            console.log("Item Updated:", stockID);
            Swal.fire({
              icon: "success",
              title: "Item Updated Successfully!",
              customClass: {
                popup: "z-50", // Apply Tailwind CSS class to adjust z-index
              },
              didOpen: () => {
                document.querySelector(".swal2-container").style.zIndex =
                  "9999"; // Adjust z-index here
              },
            }).then(() => {
              window.location.reload(); // Reload the page after successful update
            });
          } else {
            const errorText = await response.text();
            console.error("Failed to Update Item:", errorText);
            Swal.fire({
              icon: "error",
              title: "Item Updating Failed",
              text: "An error occurred while updating the item.",
              customClass: {
                popup: "z-50", // Apply Tailwind CSS class to adjust z-index
              },
              didOpen: () => {
                document.querySelector(".swal2-container").style.zIndex =
                  "9999"; // Adjust z-index here
              },
            });
          }
        }
      } catch (error) {
        console.error("Error Updating Item:", error);
        Swal.fire({
          icon: "error",
          title: "Item Updating Failed",
          text: "An error occurred while updating the item.",
          customClass: {
            popup: "z-50", // Apply Tailwind CSS class to adjust z-index
          },
          didOpen: () => {
            document.querySelector(".swal2-container").style.zIndex = "9999"; // Adjust z-index here
          },
        });
      }
    } else {
      console.log("Form is not valid");
      console.log("Errors after validation:", errors);
    }
  };
  const handleDelete = async () => {
    try {
      const confirmed = await Swal.fire({
        icon: "warning",
        title: "Are you sure?",
        text: "You are about to delete this Item. This action cannot be undone.",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel",
      });

      if (confirmed.isConfirmed) {
        const response = await fetch(
          `http://localhost:3001/api/stock/deleteStock/${row.id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          // Item deleted successfully
          const data = await response.json();
          const stockID = data.stockID;
          console.log("Item Deleted:", stockID);
          Swal.fire({
            icon: "success",
            title: "Item Deleted Successfully!",
            customClass: {
              popup: "z-50", // Apply Tailwind CSS class to adjust z-index
            },
            didOpen: () => {
              document.querySelector(".swal2-container").style.zIndex = "9999"; // Adjust z-index here
            },
          }).then(() => {
            window.location.reload(); // Reload the page after successful deletion
          });
        }
      } else {
        Swal.close();
      }
    } catch (error) {
      // Handle network or unexpected errors
      console.error("Error Deleting Item:", error);
      let errorMessage = "An error occurred while Deleting the Item.";
      Swal.fire({
        icon: "error",
        title: "Item Deleting Failed",
        text: errorMessage,
        customClass: {
          popup: "z-50", // Apply Tailwind CSS class to adjust z-index
        },
        didOpen: () => {
          document.querySelector(".swal2-container").style.zIndex = "9999"; // Adjust z-index here
        },
      });
    }
  };

  return (
    <React.Fragment>
      {!isOpen && (
        <TableRow>
          <TableCell component="th" scope="row" align="left">
            {row.id}
          </TableCell>
          <TableCell align="left">{row.DrugName}</TableCell>
          <TableCell align="left">{row.GenericName}</TableCell>
          <TableCell align="left">{row.BranchName}</TableCell>
          <TableCell align="left">{`${row.UnitPrice} LKR`}</TableCell>
          <TableCell align="left">{row.Quantity}</TableCell>
          <TableCell align="left">
            <IconButton
              aria-label="expand row"
              size="small"
              onClick={() => onExpand(row.id)}
            >
              <KeyboardArrowDowUnitPriceon />
            </IconButton>
          </TableCell>
        </TableRow>
      )}
      {isOpen && (
        <TableRow>
          <TableCell colSpan={9}>
            <div className="border border-gray-300 w-full py-4 px-4 rounded-lg flex flex-col bg-[#ffffff]">
              <div className=" flex justify-end">
                <IconButton
                  aria-label="collapse row"
                  size="small"
                  onClick={() => onExpand(null)}
                >
                  <KeyboardArrowUpIcon />
                </IconButton>
              </div>
              <div className="flex justify-center ">
                <div className="flex items-center p-2 justify-center  w-1/5">
                  <div className="flex-col items-center justify-center overflow-hidden rounded-2xl p-1 border h-4/5 w-4/5">
                    <img
                      src={`http://localhost:3001/` + row.image}
                      alt="dummy"
                      className="scale-150 "
                    />
                  </div>
                </div>
                <div className="flex-col  w-4/5 px-16  pt-12 pb-6">
                  <div className="flex justify-between  mb-10">
                    <TextField
                      variant="standard"
                      label="stockID"
                      defaultValue={row.id}
                      style={{ width: "75px" }}
                      InputProps={{ readOnly: true, disableUnderline: true }}
                    />
                    <TextField
                      variant="standard"
                      label="Drug Name"
                      value={stockData.DrugName}
                      name="DrugName"
                      InputProps={{ readOnly: true, disableUnderline: true }}
                    />
                    <TextField
                      variant="standard"
                      label="Generic Name"
                      value={stockData.GenericName}
                      name="GenericName"
                      InputProps={{ readOnly: true, disableUnderline: true }}
                    />
                    <TextField
                      variant="standard"
                      label="Restock Level"
                      value={stockData.RestockLevel}
                      name="RestockLevel"
                      InputProps={{ readOnly: true, disableUnderline: true }}
                    />
                    <TextField
                      variant="standard"
                      label="Quantity"
                      value={stockData.Quantity}
                      style={{ width: "120px" }}
                      type="number"
                      name="Quantity"
                      onChange={handleChange}
                      error={Boolean(errors.Quantity)}
                      helperText={errors.Quantity}
                    />
                  </div>
                  <div className="flex justify-between mb-8">
                    <TextField
                      variant="standard"
                      label="Expire Date"
                      value={stockData.ExpireDate}
                      type="date"
                      name="ExpireDate"
                      onChange={handleChange}
                      error={Boolean(errors.ExpireDate)}
                      helperText={errors.ExpireDate}
                    />
                    <TextField
                      variant="standard"
                      label="Stock Date"
                      value={stockData.StockDate}
                      type="date"
                      name="StockDate"
                      onChange={handleChange}
                      error={Boolean(errors.StockDate)}
                      helperText={errors.StockDate}
                    />
                    <TextField
                      variant="standard"
                      label="Unit Price (LKR)"
                      value={stockData.UnitPrice}
                      style={{ width: "120px" }}
                      name="UnitPrice"
                      type="number"
                      onChange={handleChange}
                      error={Boolean(errors.UnitPrice)}
                      helperText={errors.UnitPrice}
                    />
                    <FormControl
                      style={{ width: "8rem" }}
                      variant="standard"
                      error={Boolean(errors.BranchID)}
                    >
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
                  </div>
                  <div className="flex justify-end gap-4">
                    <PrimaryButton
                      text="DELETE"
                      onClick={handleDelete}
                      color="red"
                      hoverColor="#dc2626"
                      activeColor="#192c10"
                    />
                    <PrimaryButton
                      text="UPDATE"
                      onClick={handleUpdate}
                      color="#139E0C"
                      hoverColor="#437729"
                      activeColor="#192c10"
                    />
                  </div>
                </div>
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
      {/* <Dialog
        open={openDialog}
        disableEscapeKeyDown={true}
        BackdropProps={{
          style: { backdropFilter: "blur(5px)" },
          invisible: true, // This will prevent backdrop click
        }}
      >        
      </Dialog> */}
    </React.Fragment>
  );
}

Row.propTypes = {
  row: PropTypes.shape({
    id: PropTypes.number.isRequired,
    ExpireDate: PropTypes.string.isRequired,
    DrugName: PropTypes.string.isRequired,
    GenericName: PropTypes.string.isRequired,
    branchName: PropTypes.string.isRequired,
    unitprice: PropTypes.string.isRequired,
    Quantity: PropTypes.string.isRequired,
    expireDate: PropTypes.string.isRequired,
    stockDate: PropTypes.string.isRequired,
    restock_level: PropTypes.string.isRequired,
    branchID: PropTypes.string.isRequired,
    categoryName: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired,
  }).isRequired,
  isOpen: PropTypes.bool.isRequired,
  onExpand: PropTypes.func.isRequired,
};

export default function CollapsibleTable() {
  const [expandedRow, setExpandedRow] = useState(null);
  const [stockData, setstockData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "http://localhost:3001/api/stock/getStock"
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        const stockData = data.stocks; // Access the stocks property
        if (Array.isArray(stockData)) {
          const transformedData = stockData.map((stock) =>
            createData(
              stock.productID,
              stock.stockID,
              stock.drugname,
              stock.genericName,
              stock.branchName,
              stock.unitprice,
              stock.quantity,
              stock.expireDate,
              stock.stockDate,
              stock.restock_level,
              stock.branchID,
              stock.categoryName,
              stock.image
            )
          );
          setstockData(transformedData);
        } else {
          throw new Error("Data received is not in the expected format");
        }
      } catch (error) {
        console.error("Error fetching stock data:", error);
      }
    };

    fetchData();
  }, []);

  const handleRowExpand = (rowId) => {
    if (expandedRow === rowId) {
      setExpandedRow(null);
    } else {
      setExpandedRow(rowId);
    }
  };

  return (
    <TableContainer component={Paper}>
      <Table aria-label="collapsible table">
        <TableHead>
          <TableRow
            style={{ borderBottom: "2px solid black", background: "#F7F7F7" }}
          >
            <TableCell align="left" style={{ fontWeight: "bold" }}>
              Stock ID
            </TableCell>
            <TableCell align="left" style={{ fontWeight: "bold" }}>
              Drug Name
            </TableCell>
            <TableCell align="left" style={{ fontWeight: "bold" }}>
              Generic Name
            </TableCell>
            <TableCell align="left" style={{ fontWeight: "bold" }}>
              Branch
            </TableCell>
            <TableCell align="left" style={{ fontWeight: "bold" }}>
              Unit Price
            </TableCell>
            <TableCell align="left" style={{ fontWeight: "bold" }}>
              Quantity
            </TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody style={{ maxHeight: "400px" }}>
          {stockData.map((stock) => (
            <React.Fragment key={stock.id}>
              <Row
                row={stock}
                isOpen={expandedRow === stock.id}
                onExpand={handleRowExpand}
              />
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

// function StockTable() {
//   return <div></div>;
// }
// export default StockTable;
