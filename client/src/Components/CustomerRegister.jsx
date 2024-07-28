import React, { useState, useEffect } from "react";
import Primarybutton from "../Components/Primarybutton";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Swal from "sweetalert2";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Grid,
  IconButton,
  InputAdornment,
} from "@mui/material";

const CustomerRegister = ({ open }) => {
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [tableDataChanged, setTableDataChanged] = useState(false);
  const token = localStorage.getItem("token");
  const [userData, setUserData] = useState({
    Username: "",
    Password: "",
    FirstName: "",
    LastName: "",
    NIC: "",
    Email: "",
    PhoneNumber: "",
    Address: "",
    Usertype: "Customer",
    BranchID: "null",
  });

  const handleClose = () => {
    setUserData({
      Username: "",
      Password: "",
      FirstName: "",
      LastName: "",
      NIC: "",
      Email: "",
      PhoneNumber: "",
      Address: "",
      Usertype: "Customer",
      BranchID: "null",
    });
    setErrors({});
    setShowPassword(false);
  };

  const handleChange = (e) => {
    // Handle input changes
    const { name, value } = e.target;
    let newValue = value;
    if (name === "FirstName" || name === "LastName") {
      newValue = newValue.slice(0, 20); // Limit to 20 characters for Address
      newValue = newValue.replace(/[0-9]/g, ""); // Allow only alphabets
    } else if (name === "PhoneNumber") {
      newValue = newValue.replace(/[^0-9]/g, ""); // Allow only numbers
    } else if (name === "Username") {
      newValue = newValue.slice(0, 25); // Limit to 15 characters for Address
      newValue = newValue.replace(/\s/g, ""); // Remove spaces
    } else if (name === "Address") {
      newValue = newValue.slice(0, 100); // Limit to 100 characters for Address
    } else if (name === "Email") {
      newValue = newValue.slice(0, 50); // Limit to 50 characters for Email
    }
    setUserData({ ...userData, [name]: newValue });
    setErrors({ ...errors, [name]: "" }); // Clear the error when input changes
  };

  const handlePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateForm = () => {
    // Validate the form data
    const errors = {};
    if (!userData.FirstName.trim()) {
      // Check if First Name is not empty
      errors.FirstName = "First Name is required";
    }
    if (!userData.LastName.trim()) {
      // Check if Last Name is not empty
      errors.LastName = "Last Name is required";
    }
    if (!userData.NIC.trim()) {
      // Check if NIC is not empty
      errors.NIC = "NIC is required";
    } else if (
      !/^\d{9}[vVxX]?$/.test(userData.NIC) && // Check if NIC is valid
      !/^\d{12}$/.test(userData.NIC)
    ) {
      errors.NIC = "Invalid NIC format";
    }
    if (userData.Email.trim() && !/\S+@\S+\.\S+/.test(userData.Email)) {
      // Check if email is not empty and valid
      errors.Email = "Invalid email address";
    }
    if (!userData.PhoneNumber.trim()) {
      errors.PhoneNumber = "Phone Number is required";
    } else if (!/^\d{10}$/.test(userData.PhoneNumber)) {
      // Check if phone number is valid
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
    } else if (userData.Password.length < 8 || userData.Password.length > 15) {
      // Check if password is between 8 and 15 characters
      errors.Password = "Password must be between 8 and 15 characters";
    }

    setErrors(errors);
    return Object.keys(errors).length === 0; // Return true if there are no errors
  };

  const handleAddUser = async () => {
    if (validateForm()) {
      try {
        console.log("Adding user:", userData);
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
          Swal.fire({
            icon: "success",
            title: "User Added Successfully!",
            customClass: {
              popup: "z-50",
            },
            didOpen: () => {
              document.querySelector(".swal2-container").style.zIndex = "9999";
            },
          }).then(() => {
            handleClose(); // Close the dialog box
            window.location.reload(); // Reload the table data
            setTableDataChanged((prevState) => !prevState);
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
                popup: "z-50",
              },
              didOpen: () => {
                document.querySelector(".swal2-container").style.zIndex =
                  "9999";
              },
            });
          } else if (errors.Email) {
            Swal.fire({
              icon: "error",
              title: "User Addition Failed",
              text: errors.Email,
              customClass: {
                popup: "z-50",
              },
              didOpen: () => {
                document.querySelector(".swal2-container").style.zIndex =
                  "9999";
              },
            });
          } else if (errors.NIC) {
            Swal.fire({
              icon: "error",
              title: "User Addition Failed",
              text: errors.NIC,
              customClass: {
                popup: "z-50",
              },
              didOpen: () => {
                document.querySelector(".swal2-container").style.zIndex =
                  "9999";
              },
            });
          } else if (errors.PhoneNumber) {
            Swal.fire({
              icon: "error",
              title: "User Addition Failed",
              text: errors.PhoneNumber,
              customClass: {
                popup: "z-50",
              },
              didOpen: () => {
                document.querySelector(".swal2-container").style.zIndex =
                  "9999";
              },
            });
          } else {
            // Handle other validation errors
            Swal.fire({
              icon: "error",
              title: "User Addition Failed",
              text: "",
              html: Object.values(errors)
                .map((error) => `<div>${error}</div>`)
                .join(""),
              customClass: {
                popup: "z-50",
              },
              didOpen: () => {
                document.querySelector(".swal2-container").style.zIndex =
                  "9999";
              },
            });
          }
        } else {
          // Other server-side error
          console.error("Failed to add user");
          Swal.fire({
            icon: "error",
            title: "User Addition Failed",
            text: "An error occurred while adding the user.",
            customClass: {
              popup: "z-50",
            },
            didOpen: () => {
              document.querySelector(".swal2-container").style.zIndex = "9999";
            },
          });
        }
      } catch (error) {
        // Handle network or unexpected errors
        console.error("Error adding user:", error);
        let errorMessage = "An error occurred while adding the user.";
        Swal.fire({
          icon: "error",
          title: "User Addition Failed",
          text: errorMessage,
          customClass: {
            popup: "z-50",
          },
          didOpen: () => {
            document.querySelector(".swal2-container").style.zIndex = "9999";
          },
        });
      }
    }
  };

  return (
    <div>
      <div className="flex px-10 gap-4">
        <Dialog
          open={open}
          aria-labelledby="form-dialog-title"
          disableEscapeKeyDown={true}
          BackdropProps={{
            style: {
              backdropFilter: "blur(5px)",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
            },
            invisible: true, //prevent backdrop click
          }}
          PaperProps={{
            style: {
              borderRadius: 20, // Adjust the value to your desired roundness
            },
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
    </div>
  );
};

export default CustomerRegister;
