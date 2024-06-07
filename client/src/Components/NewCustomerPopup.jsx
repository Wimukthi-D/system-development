import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Autocomplete,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  InputAdornment,
  IconButton,
} from "@mui/material";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Primarybutton from "./Primarybutton"; // Ensure this component is correctly imported

const CustomerAutocomplete = ({ onCustomerSelect }) => {
  const [customers, setCustomers] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [open, setOpen] = useState(false);
  const [userData, setUserData] = useState({
    FirstName: "",
    LastName: "",
    NIC: "",
    PhoneNumber: "",
    Email: "",
    Address: "",
    Username: "",
    Password: "",
    Usertype: "Customer", // Always set Usertype to 'Customer'
  });
  const [errors, setErrors] = useState({});
  const MySwal = withReactContent(Swal);

  const handlePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    if (selectedCustomer) {
      onCustomerSelect(selectedCustomer);
    }
  }, [selectedCustomer, onCustomerSelect]);

  useEffect(() => {
    // Fetch customer data from backend
    axios
      .get("http://localhost:3001/api/bill/getCustomer")
      .then((response) => {
        setCustomers(response.data.customers); // Assuming response.data.customers is an array of customer objects
        console.log("Customer data:", response.data.customers);
      })
      .catch((error) => {
        console.error("Error fetching customer data:", error);
      });
  }, []);

  const handleSelectCustomer = () => {
    setOpen(false);
    Swal.fire({
      title: "Customer Selection",
      text: "Is this an existing customer, a new customer, or a guest customer?",
      icon: "question",
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: "Existing Customer",
      denyButtonText: "Guest Customer",
      cancelButtonText: "New Customer",
      backdrop: false,
      customClass: {
        popup: "z-50", // Apply Tailwind CSS class to adjust z-index
      },
    }).then((result) => {
      if (result.isConfirmed) {
        handleExistingCustomer();
      } else if (result.isDenied) {
        handleGuestCustomer();
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        handleNewCustomer();
      }
    });
  };

  const handleExistingCustomer = () => {
    MySwal.fire({
      title: "Select Existing Customer",
      backdrop: false,
      html: (
        <Autocomplete
          options={customers}
          getOptionLabel={(option) => option.FirstName}
          onChange={(e, value) => setSelectedCustomer(value)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Search"
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                },
              }}
            />
          )}
        />
      ),
    });
  };

  const handleGuestCustomer = () => {
    setSelectedCustomer("Guest Customer");
  };

  console.log("selected", selectedCustomer);

  const handleNewCustomer = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    if (name === "FirstName" || name === "LastName") {
      newValue = newValue.slice(0, 20); // Limit to 20 characters
      newValue = newValue.replace(/[0-9]/g, ""); // Allow only alphabets
    } else if (name === "PhoneNumber") {
      newValue = newValue.replace(/[^0-9]/g, ""); // Allow only numbers
    } else if (name === "Username") {
      newValue = newValue.slice(0, 25); // Limit to 25 characters
      newValue = newValue.replace(/\s/g, ""); // Remove spaces
    } else if (name === "Address") {
      newValue = newValue.slice(0, 100); // Limit to 100 characters
    } else if (name === "Email") {
      newValue = newValue.slice(0, 50); // Limit to 50 characters
    }
    setUserData({ ...userData, [name]: newValue });
    setErrors({ ...errors, [name]: "" }); // Clear the error when input changes
  };

  const validateForm = () => {
    const errors = {};
    if (!userData.FirstName.trim()) {
      errors.FirstName = "First Name is required";
    }
    if (!userData.LastName.trim()) {
      errors.LastName = "Last Name is required";
    }
    if (!userData.NIC.trim()) {
      errors.NIC = "NIC is required";
    } else if (
      !/^\d{9}[vVxX]?$/.test(userData.NIC) &&
      !/^\d{12}$/.test(userData.NIC)
    ) {
      errors.NIC = "Invalid NIC format";
    }
    if (userData.Email.trim() && !/\S+@\S+\.\S+/.test(userData.Email)) {
      errors.Email = "Invalid email address";
    }
    if (!userData.PhoneNumber.trim()) {
      errors.PhoneNumber = "Phone Number is required";
    } else if (!/^\d{10}$/.test(userData.PhoneNumber)) {
      errors.PhoneNumber = "Invalid phone number";
    }
    if (!userData.Address.trim()) {
      errors.Address = "Address is required";
    }
    if (!userData.Username.trim()) {
      errors.Username = "Username is required";
    }
    if (userData.Username.includes(" ")) {
      errors.Username = "Username cannot contain spaces";
    }
    if (!userData.Password.trim()) {
      errors.Password = "Password is required";
    }
    if (userData.Password.length < 8 || userData.Password.length > 15) {
      errors.Password = "Password must be between 8 and 15 characters";
    }

    setErrors(errors);
    return Object.keys(errors).length === 0; // Return true if there are no errors
  };

  const handleAddUser = async () => {
    console.log(userData);
    if (validateForm()) {
      try {
        const response = await fetch(
          "http://localhost:3001/api/user/register",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(userData),
          }
        );

        if (response.ok) {
          // User added successfully
          const data = await response.json();
          console.log("User added:", data);
          setSelectedCustomer(userData.FirstName);
          Swal.fire({
            icon: "success",
            title: "User Added Successfully!",
            customClass: {
              popup: "z-50", // Apply Tailwind CSS class to adjust z-index
            },
            didOpen: () => {
              document.querySelector(".swal2-container").style.zIndex = "9999"; // Adjust z-index here
            },
          }).then(() => {
            handleClose(); // Close the dialog box
          });
        } else if (response.status === 400) {
          // Error due to existing fields
          const { errors } = await response.json();
          // Handle specific error cases
          if (errors.Username) {
            Swal.fire({
              icon: "error",
              title: "User Addition Failed",
              text: errors.Username,
              customClass: {
                popup: "z-50", // Apply Tailwind CSS class to adjust z-index
              },
              didOpen: () => {
                document.querySelector(".swal2-container").style.zIndex =
                  "9999"; // Adjust z-index here
              },
            });
          } else if (errors.Email) {
            Swal.fire({
              icon: "error",
              title: "User Addition Failed",
              text: errors.Email,
              customClass: {
                popup: "z-50", // Apply Tailwind CSS class to adjust z-index
              },
              didOpen: () => {
                document.querySelector(".swal2-container").style.zIndex =
                  "9999"; // Adjust z-index here
              },
            });
          } else if (errors.NIC) {
            Swal.fire({
              icon: "error",
              title: "User Addition Failed",
              text: errors.NIC,
              customClass: {
                popup: "z-50", // Apply Tailwind CSS class to adjust z-index
              },
              didOpen: () => {
                document.querySelector(".swal2-container").style.zIndex =
                  "9999"; // Adjust z-index here
              },
            });
          } else {
            // Display generic error message
            Swal.fire({
              icon: "error",
              title: "User Addition Failed",
              text: "An error occurred while adding the user.",
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
          // Handle other response errors
          console.error("Failed to add user:", response.status);
          Swal.fire({
            icon: "error",
            title: "User Addition Failed",
            text: "An error occurred while adding the user.",
            customClass: {
              popup: "z-50", // Apply Tailwind CSS class to adjust z-index
            },
            didOpen: () => {
              document.querySelector(".swal2-container").style.zIndex = "9999"; // Adjust z-index here
            },
          });
        }
      } catch (error) {
        console.error("Error adding user:", error);
        Swal.fire({
          icon: "error",
          title: "User Addition Failed",
          text: "An error occurred while adding the user.",
          customClass: {
            popup: "z-50", // Apply Tailwind CSS class to adjust z-index
          },
          didOpen: () => {
            document.querySelector(".swal2-container").style.zIndex = "9999"; // Adjust z-index here
          },
        });
      }
    } else {
      // Validation failed, display an error message or handle accordingly
      Swal.fire({
        icon: "error",
        title: "Validation Failed",
        text: "Please correct the errors in the form.",
        customClass: {
          popup: "z-50", // Apply Tailwind CSS class to adjust z-index
        },
        didOpen: () => {
          document.querySelector(".swal2-container").style.zIndex = "9999"; // Adjust z-index here
        },
      });
    }
  };
  // Call handleSelectCustomer directly

  console.log("selected Customer", selectedCustomer);

  return (
    <div>
      {!selectedCustomer && (
        <Button
          variant="contained"
          onClick={handleSelectCustomer}
          size="small"
          sx={{
            "&.MuiButtonBase-root": {
              borderRadius: "8px",
            },
          }}
        >
          Select Customer
        </Button>
      )}

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
          Customer Registration
        </DialogTitle>
        <div className="mb-3">
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="First Name"
                  name="FirstName"
                  value={userData.FirstName}
                  onChange={handleChange}
                  fullWidth
                  error={Boolean(errors.FirstName)}
                  helperText={errors.FirstName}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Last Name"
                  name="LastName"
                  value={userData.LastName}
                  onChange={handleChange}
                  fullWidth
                  error={Boolean(errors.LastName)}
                  helperText={errors.LastName}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="NIC"
                  name="NIC"
                  value={userData.NIC}
                  onChange={handleChange}
                  fullWidth
                  error={Boolean(errors.NIC)}
                  helperText={errors.NIC}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Phone Number (07X XXX XXXX)"
                  name="PhoneNumber"
                  value={userData.PhoneNumber}
                  onChange={handleChange}
                  fullWidth
                  error={Boolean(errors.PhoneNumber)}
                  helperText={errors.PhoneNumber}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Email"
                  type="email"
                  name="Email"
                  value={userData.Email}
                  onChange={handleChange}
                  fullWidth
                  error={Boolean(errors.Email)}
                  helperText={errors.Email}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Address"
                  name="Address"
                  value={userData.Address}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows={4}
                  error={Boolean(errors.Address)}
                  helperText={errors.Address}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Username"
                  name="Username"
                  value={userData.Username}
                  onChange={handleChange}
                  fullWidth
                  error={Boolean(errors.Username)}
                  helperText={errors.Username}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  name="Password"
                  value={userData.Password}
                  onChange={handleChange}
                  fullWidth
                  error={Boolean(errors.Password)}
                  helperText={errors.Password}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={handlePasswordVisibility}>
                          {showPassword ? <Visibility /> : <VisibilityOff />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </DialogContent>
        </div>
        <DialogActions className="mx-4 mb-4">
          <div className="flex w-full justify-around">
            <div className="w-1/2">
              <Primarybutton
                onClick={handleAddUser}
                text="Create Account"
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
  );
};

export default CustomerAutocomplete;
