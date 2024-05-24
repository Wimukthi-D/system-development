import React, { useState, useEffect } from 'react';
import Table from '../Components/UserTable';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Grid, MenuItem, FormControl, InputLabel, Select, IconButton, InputAdornment } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import Swal from 'sweetalert2';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const Users = () => {
  const [open, setOpen] = useState(false);
  const [userData, setUserData] = useState({
    Username: '',
    Password: '',
    FirstName: '',
    LastName: '',
    NIC: '',
    Email: '',
    PhoneNumber: '',
    Address: '',
    Role: '',
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
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
    setUserData({
      Username: '',
      Password: '',
      FirstName: '',
      LastName: '',
      NIC: '',
      Email: '',
      PhoneNumber: '',
      Address: '',
      Role: '',
    });
    setErrors({});
    setShowPassword(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    if (name === 'FirstName' || name === 'LastName') {
      newValue = newValue.slice(0, 20); // Limit to 20 characters for Address
      newValue = newValue.replace(/[0-9]/g, ''); // Allow only alphabets
    } else if (name === 'PhoneNumber') {
      newValue = newValue.replace(/[^0-9]/g, ''); // Allow only numbers
    } else if (name === 'Username') {
      newValue = newValue.slice(0, 25); // Limit to 15 characters for Address
      newValue = newValue.replace(/\s/g, ''); // Remove spaces
    }else if (name === 'Address') {
      newValue = newValue.slice(0, 100); // Limit to 100 characters for Address
    } else if (name === 'Email') {
      newValue = newValue.slice(0, 50); // Limit to 50 characters for Email
    }
    setUserData({ ...userData, [name]: newValue });
    setErrors({ ...errors, [name]: '' }); // Clear the error when input changes
  };

  const handlePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateForm = () => {
    const errors = {};
    if (!userData.FirstName.trim()) {
      errors.FirstName = 'First Name is required';
    }
    if (!userData.LastName.trim()) {
      errors.LastName = 'Last Name is required';
    }
    if (!userData.NIC.trim()) {
      errors.NIC = 'NIC is required';
    } else if (!/^\d{9}[vVxX]?$/.test(userData.NIC) && !/^\d{12}$/.test(userData.NIC)) {
      errors.NIC = 'Invalid NIC format';
    }
    if (userData.Email.trim() && !/\S+@\S+\.\S+/.test(userData.Email)) {
      errors.Email = 'Invalid email address';
    }
    if (!userData.PhoneNumber.trim()) {
      errors.PhoneNumber = 'Phone Number is required';
    } else if (!/^\d{10}$/.test(userData.PhoneNumber)) {
      errors.PhoneNumber = 'Invalid phone number';
    }
    if (!userData.Address.trim()) {
      errors.Address = 'Address is required';
    }
    if (!userData.Role.trim()) {
      errors.Role = 'Role is required';
    }
    if (!userData.Username.trim()) {
      errors.Username = 'Username is required';
    }
    if (userData.Username.includes(' ')) {
      errors.Username = 'Username cannot contain spaces';
    }
    if (!userData.Password.trim()) {
      errors.Password = 'Password is required';
    } else if (userData.Password.length < 8 || userData.Password.length > 15) {
      errors.Password = 'Password must be between 8 and 15 characters';
    }
    setErrors(errors);
    return Object.keys(errors).length === 0; // Return true if there are no errors
  };

  const handleAddUser = async () => {
    if (validateForm()) {
      try {
        const response = await fetch('http://localhost:3001/api/user/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        });

        if (response.ok) {
          // User added successfully
          const data = await response.json();
          console.log('User added:', data);
          Swal.fire({
            icon: 'success',
            title: 'User Added Successfully!',
            customClass: {
              popup: 'z-50', // Apply Tailwind CSS class to adjust z-index
            },
            didOpen: () => {
              document.querySelector('.swal2-container').style.zIndex = '9999'; // Adjust z-index here
            }
          }).then(() => {
            handleClose(); // Close the dialog box
            setTableDataChanged(prevState => !prevState); // <--- Add this line to update the tableDataChanged state
          });
        } else if (response.status === 400) {// Error due to existing fields
          const { errors } = await response.json();
          // Handle specific error cases
          if (errors.Username) {
            Swal.fire({
              icon: 'error',
              title: 'User Addition Failed',
              text: errors.Username,
              customClass: {
                popup: 'z-50', // Apply Tailwind CSS class to adjust z-index
              },
              didOpen: () => {
                document.querySelector('.swal2-container').style.zIndex = '9999'; // Adjust z-index here
              }
            });
          } else if (errors.Email) {
            Swal.fire({
              icon: 'error',
              title: 'User Addition Failed',
              text: errors.Email,
              customClass: {
                popup: 'z-50', // Apply Tailwind CSS class to adjust z-index
              },
              didOpen: () => {
                document.querySelector('.swal2-container').style.zIndex = '9999'; // Adjust z-index here
              }
            });
          } else if (errors.NIC) {
            Swal.fire({
              icon: 'error',
              title: 'User Addition Failed',
              text: errors.NIC,
              customClass: {
                popup: 'z-50', // Apply Tailwind CSS class to adjust z-index
              },
              didOpen: () => {
                document.querySelector('.swal2-container').style.zIndex = '9999'; // Adjust z-index here
              }
            });
          } else if (errors.PhoneNumber) {
            Swal.fire({
              icon: 'error',
              title: 'User Addition Failed',
              text: errors.PhoneNumber,
              customClass: {
                popup: 'z-50', // Apply Tailwind CSS class to adjust z-index
              },
              didOpen: () => {
                document.querySelector('.swal2-container').style.zIndex = '9999'; // Adjust z-index here
              }
            });
          } else {
            // Handle other validation errors
            Swal.fire({
              icon: 'error',
              title: 'User Addition Failed',
              text: '',
              html: Object.values(errors).map(error => `<div>${error}</div>`).join(''),
              customClass: {
                popup: 'z-50', // Apply Tailwind CSS class to adjust z-index
              },
              didOpen: () => {
                document.querySelector('.swal2-container').style.zIndex = '9999'; // Adjust z-index here
              }
            });
          }
        } else {
          // Other server-side error
          console.error('Failed to add user');
          Swal.fire({
            icon: 'error',
            title: 'User Addition Failed',
            text: 'An error occurred while adding the user.',
            customClass: {
              popup: 'z-50', // Apply Tailwind CSS class to adjust z-index
            },
            didOpen: () => {
              document.querySelector('.swal2-container').style.zIndex = '9999'; // Adjust z-index here
            }
          });
        }
      } catch (error) {
        // Handle network or unexpected errors
        console.error('Error adding user:', error);
        let errorMessage = 'An error occurred while adding the user.';
        Swal.fire({
          icon: 'error',
          title: 'User Addition Failed',
          text: errorMessage,
          customClass: {
            popup: 'z-50', // Apply Tailwind CSS class to adjust z-index
          },
          didOpen: () => {
            document.querySelector('.swal2-container').style.zIndex = '9999'; // Adjust z-index here
          }
        });
      }
    }
  };

  return (
    <div className="h-screen flex bg-[#F7F7F7]">
      <div className='w-20 h-screen'></div>
      <div className="flex w-full overflow-y-auto">
        <div className='flex-col w-full'>
          <div className='flex justify-end mt-10 mr-10'>
            <Button variant="contained" color="success" startIcon={<AddIcon />} onClick={handleClickOpen}>Add User</Button>
            <Dialog
              open={open}
              aria-labelledby="form-dialog-title"
              disableEscapeKeyDown={true}
              BackdropProps={{
                style: { backdropFilter: 'blur(5px)' },
                invisible: true // This will prevent backdrop click
              }}
            >
              <DialogTitle id="form-dialog-title" className='text-center font-extrabold'>Add User</DialogTitle>
              <div className='mb-3'>
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
                        type={showPassword ? 'text' : 'password'}
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
                    <Grid item xs={6}>
                      <FormControl fullWidth error={Boolean(errors.Role)}>
                        <InputLabel>Role</InputLabel>
                        <Select
                          value={userData.Role}
                          onChange={handleChange}
                          name="Role"
                        >
                          <MenuItem value="admin">Admin</MenuItem>
                          <MenuItem value="showroom staff">Showroom Staff</MenuItem>
                          <MenuItem value="warehouse staff">Warehouse Staff</MenuItem>
                          <MenuItem value="supplier">Supplier</MenuItem>
                        </Select>
                      </FormControl>
                      {errors.Role && <div style={{ color: 'red' }}>{errors.Role}</div>}
                    </Grid>
                  </Grid>
                </DialogContent>
              </div>
              <DialogActions className="mx-4 mb-4">
                <div className='w-full space-y-2'>
                  <Button onClick={handleAddUser} color="success" variant="contained" fullWidth >
                    Add User
                  </Button>
                  <Button onClick={handleClose} color="error" variant="contained" fullWidth >
                    Cancel
                  </Button>
                </div>
              </DialogActions>
            </Dialog>
          </div>
          <div className='p-10'>
            <Table reloadData={tableDataChanged} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;