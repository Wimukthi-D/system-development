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
import Button from "@mui/material/Button";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Swal from "sweetalert2";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import PrimaryButton from "./Primarybutton";
import { jwtDecode } from "jwt-decode";

const token = localStorage.getItem("token");
const parsedToken = JSON.parse(token);
const decodedToken = jwtDecode(parsedToken.token);
const Usertype = decodedToken.role;


function createData(
  id,
  username,
  firstName,
  lastName,
  email,
  phoneNumber,
  address,
  Usertype,
  nic,
  BranchID
) {
  return {
    id,
    username,
    firstName,
    lastName,
    email,
    phoneNumber,
    address,
    Usertype,
    nic,
    BranchID,
  };
}

function Row({ row, isOpen, onExpand }) {
  const [openDialog, setOpenDialog] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false); // State for toggling new password visibility
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // State for toggling confirm password visibility
  const [errors, setErrors] = useState({});
  const [userData, setUserData] = useState({
    Username: row.username,
    Password: row.Password,
    FirstName: row.firstName,
    LastName: row.lastName,
    NIC: row.nic,
    Email: row.email,
    PhoneNumber: row.phoneNumber,
    Address: row.address,
    Usertype: row.Usertype,
    BranchID: row.BranchID,
    HiredDate: row.HiredDate,
  });

  useEffect(() => {
    //when the expand is open do these things
    setUserData({
      Username: row.username,
      Password: row.Password,
      FirstName: row.firstName,
      LastName: row.lastName,
      NIC: row.nic,
      Email: row.email,
      PhoneNumber: row.phoneNumber,
      Address: row.address,
      Usertype: row.Usertype,
      BranchID: row.BranchID,
      HiredDate: row.HiredDate,
    });

    setErrors({});
  }, [row, isOpen]);

  useEffect(() => {
    // Reset BranchID to an empty string when Usertype changes
    setUserData((prevUserData) => ({
      ...prevUserData,
      BranchID: "",
    }));
  }, [userData.Usertype]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    if (name === "FirstName" || name === "LastName") {
      newValue = newValue.slice(0, 20); // Limit to 20 characters for Address
      newValue = newValue.replace(/[0-9]/g, ""); // Allow only alphabets
    } else if (name === "PhoneNumber") {
      newValue = newValue.slice(0, 10);
      newValue = newValue.replace(/[^0-9]/g, ""); // Allow only numbers
    } else if (name === "Username") {
      newValue = newValue.slice(0, 25); // Limit to 15 characters for Address
      newValue = newValue.replace(/\s/g, ""); // Remove spaces
    } else if (name === "Address") {
      newValue = newValue.slice(0, 100); // Limit to 100 characters for Address
    } else if (name === "Email") {
      newValue = newValue.slice(0, 50); // Limit to 50 characters for Email
    } else if (name === "NIC") {
      newValue = newValue.slice(0, 12); // Limit to 50 characters for Email
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
    if (!userData.Email) {
      userData.Email = "";
    } else if (!/\S+@\S+\.\S+/.test(userData.Email)) {
      errors.Email = "Invalid email address";
    }
    if (!userData.PhoneNumber.trim()) {
      errors.PhoneNumber = "Phone Number is required";
    } else if (!/^0\d{9}$/.test(userData.PhoneNumber)) {
      errors.PhoneNumber = "Invalid phone number";
    }
    if (!userData.Address.trim()) {
      errors.Address = "Address is required";
    }
    if (!userData.Usertype.trim()) {
      errors.Usertype = "Usertype is required";
    }
    if (!userData.Username.trim()) {
      errors.Username = "Username is required";
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
          text: "You are about to update this user. This action cannot be undone.",
          showCancelButton: true,
          confirmButtonText: "Yes, update it!",
          cancelButtonText: "Cancel",
        });

        if (confirmed.isConfirmed) {
          const response = await fetch(
            `http://localhost:3001/api/user/update/${row.id}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(userData),
            }
          );

          if (response.ok) {
            // User updated successfully
            const data = await response.json();
            const userID = data.userID;
            console.log("User Updated:", userID);
            Swal.fire({
              icon: "success",
              title: "User Updated Successfully!",
              customClass: {
                popup: "z-50", // Apply Tailwind CSS class to adjust z-index
              },
              didOpen: () => {
                document.querySelector(".swal2-container").style.zIndex =
                  "9999"; // Adjust z-index here
              },
            }).then(() => {
              window.location.reload(); // Reload the page after successful deletion
            });
          } else if (response.status === 400) {
            // Error due to existing fields
            const { errors } = await response.json();
            // Handle specific error cases
            if (errors.Username) {
              Swal.fire({
                icon: "error",
                title: "User Updating Failed",
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
                title: "User Updating Failed",
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
                title: "User Updating Failed",
                text: errors.NIC,
                customClass: {
                  popup: "z-50", // Apply Tailwind CSS class to adjust z-index
                },
                didOpen: () => {
                  document.querySelector(".swal2-container").style.zIndex =
                    "9999"; // Adjust z-index here
                },
              });
            } else if (errors.PhoneNumber) {
              Swal.fire({
                icon: "error",
                title: "User Updating Failed",
                text: errors.PhoneNumber,
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
                title: "User Updating Failed",
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
            console.error("Failed to Update user");
            Swal.fire({
              icon: "error",
              title: "User Updating Failed",
              text: "An error occurred while Updating the user.",
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
        console.error("Error Updating user:", error);
        let errorMessage = "An error occurred while Updating the user.";
        Swal.fire({
          icon: "error",
          title: "User Updating Failed",
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

  const handleResetPassword = () => {
    setOpenDialog(true);
  };

  const handleReset = async () => {
    let newPasswordError = "";
    let confirmPasswordError = "";

    // Check if newPassword and confirmPassword match
    if (newPassword !== confirmPassword) {
      confirmPasswordError = "Passwords do not match";
    }

    // Check if newPassword meets your criteria, e.g., minimum length
    if (newPassword.length < 8 || newPassword.length > 15) {
      newPasswordError = "Password must be between 8 and 15 characters";
    }

    // If there are errors, update the state to display them
    if (newPasswordError || confirmPasswordError) {
      setNewPasswordError(newPasswordError);
      setConfirmPasswordError(confirmPasswordError);
      return; // Don't proceed further if there are errors
    }

    try {
      const response = await fetch(
        `http://localhost:3001/api/user/resetpass/${row.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ newPassword }), // Pass newPassword as an object property
        }
      );

      if (response.ok) {
        const data = await response.json();
        const userID = data.userID;

        console.log("Password reset successfully for user ID:", userID);
        setOpenDialog(false);
        // Show success message using SweetAlert with user ID
        Swal.fire({
          icon: "success",
          title: "Password Reset Successful",
          text: `Password reset successfully for user ID: ${userID}`,
        });
        handleCancel();
      } else if (response.status === 400) {
        Swal.fire({
          icon: "error",
          title: "Password Reset Failed",
          text: "New password cannot be the same as the current password.",
          didOpen: () => {
            document.querySelector(".swal2-container").style.zIndex = "9999"; // Adjust z-index here
          },
        });
      } else if (response.status === 500) {
        Swal.fire({
          icon: "error",
          title: "Password Reset Failed",
          didOpen: () => {
            document.querySelector(".swal2-container").style.zIndex = "9999"; // Adjust z-index here
          },
        });
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      setOpenDialog(false);
      let errorMessage =
        "An error occurred while resetting your password. Please try again later.";

      // Customize error message based on specific scenarios
      if (
        error.message ===
        "New password cannot be the same as the current password"
      ) {
        errorMessage =
          "New password cannot be the same as the current password";
      }

      // Show error message using SweetAlert
      Swal.fire({
        icon: "error",
        title: "Password Reset Failed",
        text: errorMessage,
      });
    }
  };

  const handleDelete = async () => {
    try {
      const confirmed = await Swal.fire({
        icon: "warning",
        title: "Are you sure?",
        text: "You are about to delete this user. This action cannot be undone.",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel",
      });

      if (confirmed.isConfirmed) {
        const response = await fetch(
          `http://localhost:3001/api/user/delete/${row.id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          // User deleted successfully
          const data = await response.json();
          const userID = data.userID;
          console.log("User Deleted:", userID);
          Swal.fire({
            icon: "success",
            title: "User Deleted Successfully!",
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
      console.error("Error Deleting user:", error);
      let errorMessage = "An error occurred while Deleting the user.";
      Swal.fire({
        icon: "error",
        title: "User Deleting Failed",
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

  const handleCancel = () => {
    setNewPassword("");
    setConfirmPassword("");
    setNewPasswordError("");
    setConfirmPasswordError("");
    setOpenDialog(false);
  };

  return (
    <React.Fragment>
      {!isOpen && (
        <TableRow>
          <TableCell component="th" scope="row" align="left">
            {row.id}
          </TableCell>
          <TableCell align="left">{row.username}</TableCell>
          <TableCell align="left">{row.firstName}</TableCell>
          <TableCell align="left">{row.lastName}</TableCell>
          <TableCell align="left">{row.email}</TableCell>
          <TableCell align="left">{row.phoneNumber}</TableCell>
          <TableCell align="left">{row.address}</TableCell>
          <TableCell align="left">{row.Usertype}</TableCell>
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
              <div className="px-16  pt-12 pb-6">
                <div className="flex justify-between  mb-10">
                  <TextField
                    variant="standard"
                    label="userID"
                    defaultValue={row.id}
                    style={{ width: "75px" }}
                    InputProps={{ readOnly: true, disableUnderline: true }}
                  />
                  <TextField
                    variant="standard"
                    label="First Name"
                    value={userData.FirstName}
                    name="FirstName"
                    onChange={handleChange}
                    error={Boolean(errors.FirstName)}
                    helperText={errors.FirstName}
                    {...(!(Usertype === "Manager") && { readOnly: true, InputProps: { disableUnderline: true } })}
                  />
                  <TextField
                    variant="standard"
                    label="Last Name"
                    value={userData.LastName}
                    name="LastName"
                    onChange={handleChange}
                    error={Boolean(errors.LastName)}
                    helperText={errors.LastName}
                    {...(!(Usertype === "Manager") && { readOnly: true, InputProps: { disableUnderline: true } })}
                  />
                  <TextField
                    variant="standard"
                    label="NIC"
                    value={userData.NIC}
                    style={{ width: "120px" }}
                    name="NIC"
                    onChange={handleChange}
                    error={Boolean(errors.NIC)}
                    helperText={errors.NIC}
                    {...(!(Usertype === "Manager") && { readOnly: true, InputProps: { disableUnderline: true } })}
                  />
                  <TextField
                    variant="standard"
                    label="Phone Number"
                    value={userData.PhoneNumber}
                    style={{ width: "120px" }}
                    name="PhoneNumber"
                    onChange={handleChange}
                    error={Boolean(errors.PhoneNumber)}
                    helperText={errors.PhoneNumber}
                    {...(!(Usertype === "Manager") && { readOnly: true, InputProps: { disableUnderline: true } })}
                  />
                  <FormControl variant="standard" style={{ width: "125px" }}>
                    <InputLabel id="Usertype-label">User type</InputLabel>
                    <Select
                      labelId="Usertype-label"
                      id="Usertype"
                      name="Usertype"
                      value={userData.Usertype}
                      onChange={handleChange}
                      label="Usertype"
                      {...(!(Usertype === "Manager") && { readOnly: true, InputProps: { disableUnderline: true } })}
                    >
                      <MenuItem value="Manager">Manager</MenuItem>
                      <MenuItem value="Cashier">Cashier</MenuItem>
                      <MenuItem value="Staff">Staff</MenuItem>
                      <MenuItem value="Supplier">Supplier</MenuItem>
                      <MenuItem value="Customer">Customer</MenuItem>
                    </Select>
                  </FormControl>
                  {userData.Usertype !== "Supplier" &&
                    userData.Usertype !== "Customer" && (
                      <FormControl
                        style={{ width: "8rem" }}
                        variant="standard"
                        error={Boolean(errors.BranchID)}
                      >
                        <InputLabel>Branch</InputLabel>
                        <Select
                          value={userData.BranchID}
                          label="BranchID"
                          onChange={handleChange}
                          name="BranchID"
                          {...(!(Usertype === "Manager") && { readOnly: true, InputProps: { disableUnderline: true } })}
                        >
                          <MenuItem value="1">Dankotuwa</MenuItem>
                          <MenuItem value="2">Marawila</MenuItem>
                        </Select>
                      </FormControl>
                    )}
                </div>
                <div className="flex justify-between mb-8">
                  <TextField
                    variant="standard"
                    label="Username"
                    value={userData.Username}
                    style={{ width: "15%" }}
                    name="Username"
                    onChange={handleChange}
                    error={Boolean(errors.Username)}
                    helperText={errors.Username}
                    {...(!(Usertype === "Manager") && { readOnly: true, InputProps: { disableUnderline: true } })}
                  />
                  <TextField
                    variant="standard"
                    label="Email"
                    value={userData.Email}
                    style={{ width: "25%" }}
                    name="Email"
                    onChange={handleChange}
                    error={Boolean(errors.Email)}
                    helperText={errors.Email}
                    {...(!(Usertype === "Manager") && { readOnly: true, InputProps: { disableUnderline: true } })}
                  />
                  <TextField
                    variant="standard"
                    label="Address"
                    value={userData.Address}
                    style={{ width: "50%" }}
                    name="Address"
                    onChange={handleChange}
                    error={Boolean(errors.Address)}
                    helperText={errors.Address}
                    {...(!(Usertype === "Manager") && { readOnly: true, InputProps: { disableUnderline: true } })}
                  />
                </div>
                {Usertype == "Manager" && (
                  <div className="flex justify-end gap-4">
                    <PrimaryButton
                      text="RESET PASSWORD"
                      onClick={handleResetPassword}
                      color="#2563eb"
                      hoverColor="#1e40af"
                      activeColor="#1e3a8a"
                    />
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
                )}
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
      <Dialog
        open={openDialog}
        disableEscapeKeyDown={true}
        BackdropProps={{
          style: { backdropFilter: "blur(5px)" },
          invisible: true, // This will prevent backdrop click
        }}
      >
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter your new password and confirm.
          </DialogContentText>
          <div style={{ width: "350px" }}>
            <TextField
              autoFocus
              margin="dense"
              label="New Password"
              type={showNewPassword ? "text" : "password"} // Toggle password visibility based on showNewPassword state
              fullWidth
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                // Hide helper text if the input field is touched
                if (e.target.value.length > 0) {
                  setNewPasswordError("");
                }
              }}
              error={!!newPasswordError}
              helperText={newPasswordError}
              InputProps={{
                endAdornment: (
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    edge="end"
                  >
                    {showNewPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                ),
              }}
            />
            <TextField
              margin="dense"
              label="Confirm Password"
              type={showConfirmPassword ? "text" : "password"} // Toggle password visibility based on showConfirmPassword state
              fullWidth
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                // Hide helper text if the input field is touched
                if (e.target.value.length > 0) {
                  setConfirmPasswordError("");
                }
              }}
              error={!!confirmPasswordError}
              helperText={confirmPasswordError}
              InputProps={{
                endAdornment: (
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                ),
              }}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleReset} color="primary">
            Reset
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}

Row.propTypes = {
  row: PropTypes.shape({
    id: PropTypes.number.isRequired,
    username: PropTypes.string.isRequired,
    firstName: PropTypes.string.isRequired,
    lastName: PropTypes.string.isRequired,
    email: PropTypes.string,
    phoneNumber: PropTypes.string.isRequired,
    address: PropTypes.string.isRequired,
    Usertype: PropTypes.string.isRequired,
    nic: PropTypes.string.isRequired,
  }).isRequired,
  isOpen: PropTypes.bool.isRequired,
  onExpand: PropTypes.func.isRequired,
};

export default function CollapsibleTable() {
  const [expandedRow, setExpandedRow] = useState(null);
  const [userData, setUserData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/user/getUser");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        const userData = data.users; // Access the users property
        if (Array.isArray(userData)) {
          const transformedData = userData.map((user) =>
            createData(
              user.userID,
              user.Username,
              user.FirstName,
              user.LastName,
              user.Email,
              user.PhoneNumber,
              user.Address,
              user.Usertype,
              user.NIC,
              user.BranchID
            )
          );
          setUserData(transformedData);
        } else {
          throw new Error("Data received is not in the expected format");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
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
              User ID
            </TableCell>
            <TableCell align="left" style={{ fontWeight: "bold" }}>
              Username
            </TableCell>
            <TableCell align="left" style={{ fontWeight: "bold" }}>
              First Name
            </TableCell>
            <TableCell align="left" style={{ fontWeight: "bold" }}>
              Last Name
            </TableCell>
            <TableCell align="left" style={{ fontWeight: "bold" }}>
              Email
            </TableCell>
            <TableCell align="left" style={{ fontWeight: "bold" }}>
              Phone Number
            </TableCell>
            <TableCell align="left" style={{ fontWeight: "bold" }}>
              Address
            </TableCell>
            <TableCell align="left" style={{ fontWeight: "bold" }}>
              User type
            </TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody style={{ background: "#F7F7F7" }}>
          {userData.map((user) => (
            <React.Fragment key={user.id}>
              <Row
                row={user}
                isOpen={expandedRow === user.id}
                onExpand={handleRowExpand}
              />
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
