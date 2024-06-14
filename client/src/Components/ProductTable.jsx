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
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import TextField from "@mui/material/TextField";
import Swal from "sweetalert2";
import PrimaryButton from "./Primarybutton";

function createData(
  id,
  drugName,
  genericName,
  categoryName,
  restock_level,
  categoryID,
  Description,
  genericID,
  image
) {
  return {
    id,
    drugName,
    genericName,
    categoryName,
    restock_level,
    categoryID,
    Description,
    genericID,
    image,
  };
}

function Row({ row, isOpen, onExpand }) {
  const [errors, setErrors] = useState({});
  const [productData, setproductData] = useState({
    drugName: "",
    genericName: "",
    categoryName: "",
    restock_level: "",
    categoryID: "",
    Description: "",
    genericID: "",
    image: "",
  });

  useEffect(() => {
    //when the expand is open do these things
    setproductData({
      drugName: row.drugName,
      genericName: row.genericName,
      categoryName: row.categoryName,
      restock_level: row.restock_level,
      categoryID: row.categoryID,
      Description: row.Description,
      genericID: row.genericID,
      image: row.image,
    });

    setErrors({});
  }, [row, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    if (
      name === "drugName" ||
      name === "genericName" ||
      name === "categoryName"
    ) {
      newValue = newValue.slice(0, 20); // Limit to 20 characters
      newValue = newValue.replace(/[0-9]/g, ""); // Allow only alphabets
    } else if (name === "restock_level") {
      newValue = newValue.slice(0, 10);
      newValue = newValue.replace(/[^0-9]/g, ""); // Allow only numbers
    } else if (name === "Description") {
      newValue = newValue.slice(0, 100); // Limit to 100 characters
    }
    setproductData({ ...productData, [name]: newValue });
    setErrors({ ...errors, [name]: "" }); // Clear the error when input changes
  };

  const validateForm = () => {
    const errors = {};
    if (!productData.drugName.trim()) {
      errors.drugName = "Drug Name is required";
    }
    if (!productData.genericName.trim()) {
      errors.genericName = "Generic Name is required";
    }
    if (!productData.categoryName.trim()) {
      errors.categoryName = "Category Name is required";
    }
    if (!productData.restock_level.trim()) {
      errors.restock_level = "Restock Level is required";
    }
    setErrors(errors);
    return Object.keys(errors).length === 0; // Return true if there are no errors
  };

  const handleUpdate = async () => {
    if (validateForm()) {
      try {
        const confirmed = await Swal.fire({
          icon: "warning",
          title: "Are you sure?",
          text: "You are about to update this product. This action cannot be undone.",
          showCancelButton: true,
          confirmButtonText: "Yes, update it!",
          cancelButtonText: "Cancel",
        });

        if (confirmed.isConfirmed) {
          console.log("Updating product with data:", productData); // Debugging log
          const response = await fetch(
            `http://localhost:3001/api/stock/updateProduct/${row.id}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(productData),
            }
          );

          if (response.ok) {
            // Product updated successfully
            const data = await response.json();
            const productId = data.productId;
            console.log("Product Updated:", productId);
            Swal.fire({
              icon: "success",
              title: "Product Updated Successfully!",
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
          } else if (response.status === 400) {
            // Error due to existing product
            const { error } = await response.json();
            Swal.fire({
              icon: "error",
              title: "Product Updating Failed",
              text: error,
              customClass: {
                popup: "z-50", // Apply Tailwind CSS class to adjust z-index
              },
              didOpen: () => {
                document.querySelector(".swal2-container").style.zIndex =
                  "9999"; // Adjust z-index here
              },
            });
          } else {
            // Other server-side error
            const errorResponse = await response.json();
            console.error("Failed to Update Product:", errorResponse);
            Swal.fire({
              icon: "error",
              title: "Product Updating Failed",
              text: "An error occurred while updating the product.",
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
        // Handle network or unexpected errors
        console.error("Error Updating Product:", error);
        let errorMessage = "An error occurred while updating the product.";
        Swal.fire({
          icon: "error",
          title: "Product Updating Failed",
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

  const handleDelete = async () => {
    try {
      const confirmed = await Swal.fire({
        icon: "warning",
        title: "Are you sure?",
        text: "You are about to delete this product. This action cannot be undone.",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel",
      });

      if (confirmed.isConfirmed) {
        const response = await fetch(
          `http://localhost:3001/api/stock/deleteProduct/${row.id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          // product deleted successfully
          const data = await response.json();
          const productID = data.productID;
          console.log("product Deleted:", productID);
          Swal.fire({
            icon: "success",
            title: "product Deleted Successfully!",
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
      console.error("Error Deleting product:", error);
      let errorMessage = "An error occurred while Deleting the product.";
      Swal.fire({
        icon: "error",
        title: "product Deleting Failed",
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
          <TableCell align="left">{row.drugName}</TableCell>
          <TableCell align="left">{row.genericName}</TableCell>
          <TableCell align="left">{row.categoryName}</TableCell>
          <TableCell align="left">{row.restock_level}</TableCell>
          <TableCell align="left">
            <IconButton
              aria-label="expand row"
              size="small"
              onClick={() => onExpand(row.id)}
            >
              <KeyboardArrowDownIcon />
            </IconButton>
          </TableCell>
        </TableRow>
      )}
      {isOpen && (
        <TableRow>
          <TableCell colSpan={9}>
            <div className="border border-gray-300 py-4 px-4 rounded-lg flex flex-col bg-[#ffffff]">
              <div className=" flex justify-end">
                <IconButton
                  aria-label="collapse row"
                  size="small"
                  onClick={() => onExpand(null)}
                >
                  <KeyboardArrowUpIcon />
                </IconButton>
              </div>
              <div className="flex justify-center">
                <div className="flex items-center p-2 justify-center  w-1/5">
                  <div className="flex-col items-center justify-center overflow-hidden rounded-2xl p-1 border h-4/5 w-4/5">
                    <img
                      src={`http://localhost:3001/` + row.image}
                      alt="dummy"
                      className="scale-150 "
                    />
                  </div>
                </div>
                <div className="px-16 w-4/5 pt-12 pb-6">
                  <div className="flex justify-between  mb-10">
                    <TextField
                      variant="standard"
                      label="Product ID"
                      defaultValue={row.id}
                      style={{ width: "75px" }}
                      InputProps={{ readOnly: true, disableUnderline: true }}
                    />
                    <TextField
                      variant="standard"
                      label="Drug Name"
                      value={productData.drugName}
                      name="drugName"
                      onChange={handleChange}
                      error={Boolean(errors.drugName)}
                      helperText={errors.drugName}
                    />
                    <TextField
                      variant="standard"
                      label="Generic Name"
                      value={productData.genericName}
                      name="genericName"
                      onChange={handleChange}
                      error={Boolean(errors.genericName)}
                      helperText={errors.genericName}
                    />
                    <TextField
                      variant="standard"
                      label="Category"
                      value={productData.categoryName}
                      style={{ width: "120px" }}
                      name="categoryName"
                      onChange={handleChange}
                      error={Boolean(errors.categoryName)}
                      helperText={errors.categoryName}
                    />
                    <TextField
                      variant="standard"
                      label="Restock Level"
                      value={productData.restock_level}
                      style={{ width: "120px" }}
                      name="restock_level"
                      type="number"
                      onChange={handleChange}
                      error={Boolean(errors.restock_level)}
                      helperText={errors.restock_level}
                    />
                  </div>
                  <div className="flex justify-between mb-8">
                    <TextField
                      variant="standard"
                      label="Description"
                      value={productData.Description}
                      style={{ width: "100%" }}
                      name="Description"
                      onChange={handleChange}
                      error={Boolean(errors.Description)}
                      helperText={errors.Description}
                    />
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
    </React.Fragment>
  );
}

Row.propTypes = {
  row: PropTypes.shape({
    id: PropTypes.number.isRequired,
    productname: PropTypes.string.isRequired,
    firstName: PropTypes.string.isRequired,
    lastName: PropTypes.string.isRequired,
    email: PropTypes.string,
    phoneNumber: PropTypes.string.isRequired,
    address: PropTypes.string.isRequired,
    producttype: PropTypes.string.isRequired,
    nic: PropTypes.string.isRequired,
  }).isRequired,
  isOpen: PropTypes.bool.isRequired,
  onExpand: PropTypes.func.isRequired,
};

export default function CollapsibleTable() {
  const [expandedRow, setExpandedRow] = useState(null);
  const [productData, setproductData] = useState([]);

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
        const productData = data.products; // Access the products property
        if (Array.isArray(productData)) {
          const transformedData = productData.map((product) =>
            createData(
              product.productID,
              product.drugname,
              product.genericName,
              product.categoryName,
              product.restock_level,
              product.categoryID,
              product.Description,
              product.genericID,
              product.image
            )
          );
          setproductData(transformedData);
        } else {
          throw new Error("Data received is not in the expected format");
        }
      } catch (error) {
        console.error("Error fetching product data:", error);
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
              Product ID
            </TableCell>
            <TableCell align="left" style={{ fontWeight: "bold" }}>
              Drug Name
            </TableCell>
            <TableCell align="left" style={{ fontWeight: "bold" }}>
              Generic Name
            </TableCell>
            <TableCell align="left" style={{ fontWeight: "bold" }}>
              Category
            </TableCell>
            <TableCell align="left" style={{ fontWeight: "bold" }}>
              Restock Level
            </TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody style={{ background: "#F7F7F7" }}>
          {productData.map((product) => (
            <React.Fragment key={product.id}>
              <Row
                row={product}
                isOpen={expandedRow === product.id}
                onExpand={handleRowExpand}
              />
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
