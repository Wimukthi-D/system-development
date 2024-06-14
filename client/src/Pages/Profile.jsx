import React from "react";
import Navbar from "../Components/Navbar";
import { jwtDecode } from "jwt-decode";
import { useState } from "react";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import { useEffect } from "react";
import {
  Button,
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
  IconButton,
  InputAdornment,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

function Profile() {
  const [token, setToken] = useState(null);
  const [Usertype, setUsertype] = useState(null);
  const [FirstName, setFirstName] = useState(null);
  const [userData, setUserData] = useState({
    Username: "",
    Password: "",
    FirstName: "",
    LastName: "",
    NIC: "",
    Email: "",
    PhoneNumber: "",
    Address: "",
    Usertype: "",
    BranchID: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [tableDataChanged, setTableDataChanged] = useState(false);

  const handleChange = (e) => {
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

  useEffect(() => {
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

  return (
    <div className="flex flex-col w-screen bg-[#EDEDED] h-screen">
      <div>
        <Navbar />
      </div>
      <div className="flex flex-col h-full justify-center">
        <div className="flex flex-col items-center h-4/5">
          <div className="flex w-3/5 bg-white  h-full rounded-xl shadow-xl">
            <div className="flex border justify-center items-center w-1/3">
              <div className="flex border justify-center  m-5">
                <Box
                  height={200}
                  width={200}
                  display="flex "
                  alignItems="center"
                  justifyContent="center"
                >
                  <Avatar
                    alt={FirstName}
                    src={FirstName}
                    sx={{
                      width: 180,
                      height: 180,

                      fontSize: 100,
                    }}
                  />
                </Box>
              </div>
            </div>
            <div className="flex justify-center w-2/3 m-5">
              <div className="flex w-2/3">
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
                </Grid>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
