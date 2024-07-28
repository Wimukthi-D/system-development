import Primarybutton from "../Components/Primarybutton";
import React, { useState, useEffect } from "react";
import Table from "../Components/ProductTable";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Grid,
} from "@mui/material";
import Swal from "sweetalert2";
import SearchIcon from "@mui/icons-material/Search";
import { styled } from "@mui/system";
import Stack from "@mui/material/Stack";
import Autocomplete from "@mui/material/Autocomplete";
import Navbar from "../Components/Navbar";

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

function Products() {
  const [open, setOpen] = useState(false);
  const [image, setImage] = useState(null);
  const [ProductData, setProductData] = useState({
    DrugName: "",
    GenericName: "",
    restock_level: "",
    categoryName: "",
    Description: "",
    GenericID: "",
    categoryID: "",
  });

  const [GenericData, setGenericData] = useState([]);

  const handleSearchInputChange = (e) => {
    const { value } = e.target;
    setProductData((prevData) => ({
      ...prevData,
      GenericName: value,
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "http://localhost:3001/api/stock/getGeneric"
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        if (Array.isArray(data.Generics)) {
          setGenericData(data.Generics); // Directly set the products data
        } else {
          throw new Error("Data received is not in the expected format");
        }
      } catch (error) {
        console.error("Error fetching generic data:", error);
      }
    };

    fetchData();
  }, []);

  const [errors, setErrors] = useState({});
  const [tableDataChanged, setTableDataChanged] = useState(false); // Track changes in table data

  useEffect(() => {
    // Fetch initial table data or refresh data when tableDataChanged state changes
    // fetchData();
  }, [tableDataChanged]);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setProductData({
      DrugName: "",
      GenericName: "",
      restock_level: "",
      categoryName: "",
      Description: "",
      GenericID: "",
      categoryID: "",
    });
    setErrors({});
    setImage(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    setProductData({ ...ProductData, [name]: newValue });
    setErrors({ ...errors, [name]: "" }); // Clear the error when input changes

    // Clear existing error for DrugName and GenericName
    if (name === "DrugName" || name === "GenericName") {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const errors = {};

    // Validate drugname
    if (!ProductData.DrugName) {
      errors.drugname = "Drugname is required";
    }

    // Validate genericname
    if (!ProductData.GenericName) {
      errors.genericname = "Genericname is required";
    }

    setErrors(errors);
    return Object.keys(errors).length === 0; // Return true if there are no errors
  };

  const { DrugName, GenericName, categoryName, restock_level, Description } =
    ProductData;

  const handleImageChange = (e) => {
    const image = e.target.files[0];
    setImage(image);
  };

  const handleAddProduct = async () => {
    if (validateForm()) {
      const formData = new FormData();
      formData.append("image", image);

      const imageresponse = await fetch(
        "http://localhost:3001/api/stock/upload",
        {
          method: "POST",
          body: formData,
        }
      );
      const imageResult = await imageresponse.json();
      const imageid = imageResult.image;
      const dataToSend = {
        DrugName,
        GenericName,
        categoryName,
        restock_level,
        Description,
        imageid,
      };
      try {
        const response = await fetch(
          "http://localhost:3001/api/stock/addProduct",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(dataToSend),
          }
        );

        console.log("Response status:", response.status);

        if (!response.ok) {
          const errorData = await response.json();
          if (errorData.message === "Product already exists") {
            Swal.fire({
              icon: "error",
              title: "Product Addition Failed",
              text: "Product already exists.",
              customClass: {
                popup: "z-50", // Apply Tailwind CSS class to adjust z-index
              },
              didOpen: () => {
                document.querySelector(".swal2-container").style.zIndex =
                  "9999"; // Adjust z-index here
              },
            });
          } else {
            throw new Error(
              `Failed to add product: ${response.status} ${response.statusText}`
            );
          }
        } else {
          const data = await response.json();
          console.log("Product added:", data);

          Swal.fire({
            icon: "success",
            title: "Product Added Successfully!",
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
        }
      } catch (error) {
        console.error("Error adding product:", error);
        Swal.fire({
          icon: "error",
          title: "Product Addition Failed",
          text: "An error occurred while adding the product.",
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

  return (
    <div className="flex flex-col bg-[#EDEDED]">
      <div className=" flex flex-col bg-[#F7F7F7] ">
        <Navbar />
        <div className="flex  w-screen overflow-y-auto">
          <div className="flex-col w-full">
            <div className="flex justify-end mt-10 mx-10">
              <div>
                <Primarybutton
                  text="Add Product"
                  addIcon="1"
                  onClick={handleClickOpen}
                  color="#139E0C"
                  hoverColor="#437729"
                  activeColor="#192c10"
                />
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
                  New Product
                </DialogTitle>
                <div className="mb-3">
                  <DialogContent>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <RoundedTextField
                          label="Drug Name"
                          name="DrugName"
                          value={ProductData.DrugName}
                          onChange={handleChange}
                          fullWidth
                          error={Boolean(errors.DrugName)}
                          helperText={errors.DrugName}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <Stack>
                          <Autocomplete
                            freeSolo
                            id="free-solo-2-demo"
                            disableClearable
                            options={GenericData.map(
                              (generic) => generic.genericName
                            )}
                            renderInput={(params) => (
                              <RoundedTextField
                                {...params}
                                label="Generic Name"
                                InputProps={{
                                  ...params.InputProps,
                                  type: "search",
                                  onChange: handleSearchInputChange,
                                }}
                              />
                            )}
                            value={ProductData.GenericName} // Corrected value prop
                            onChange={(event, newValue) => {
                              const selectedGeneric = GenericData.find(
                                (generic) => generic.genericName === newValue
                              );
                              setProductData((prevData) => ({
                                ...prevData,
                                GenericName: newValue,
                                GenericID: selectedGeneric
                                  ? selectedGeneric.genericID
                                  : "",
                                restock_level: selectedGeneric
                                  ? selectedGeneric.restock_level
                                  : "",
                              }));
                            }}
                          />
                        </Stack>
                      </Grid>
                      <Grid item xs={6}>
                        <RoundedTextField
                          label="Restock Level"
                          name="restock_level"
                          value={ProductData.restock_level}
                          onChange={handleChange}
                          fullWidth
                          error={Boolean(errors.restock_level)}
                          helperText={errors.restock_level}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <RoundedTextField
                          label="Category Name"
                          name="categoryName"
                          value={ProductData.categoryName}
                          onChange={handleChange}
                          fullWidth
                          error={Boolean(errors.categoryName)}
                          helperText={errors.categoryName}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <RoundedTextField
                          label="Description"
                          name="Description"
                          value={ProductData.Description}
                          onChange={handleChange}
                          rows={4}
                          multiline
                          fullWidth
                          error={Boolean(errors.Description)}
                          helperText={errors.Description}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <input type="file" onChange={handleImageChange} />
                      </Grid>
                    </Grid>
                  </DialogContent>
                </div>
                <DialogActions className="mx-4 mb-4">
                  <div className="flex w-full justify-around">
                    <div className="w-1/2">
                      <Primarybutton
                        onClick={handleAddProduct}
                        text="Add Product"
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

export default Products;
