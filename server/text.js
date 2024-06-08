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
    Usertype: "Customer",
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
    axios
      .get("http://localhost:3001/api/bill/getCustomer")
      .then((response) => {
        setCustomers(response.data.customers);
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
        popup: "z-50",
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
      newValue = newValue.slice(0, 20);
      newValue = newValue.replace(/[0-9]/g, "");
    } else if (name === "PhoneNumber") {
      newValue = newValue.replace(/[^0-9]/g, "");
    } else if (name === "Username") {
      newValue = newValue.slice(0, 25);
      newValue = newValue.replace(/\s/g, "");
    } else if (name === "Address") {
      newValue = newValue.slice(0, 100);
    } else if (name === "Email") {
      newValue = newValue.slice(0, 50);
    }
    setUserData({ ...userData, [name]: newValue });
    setErrors({ ...errors, [name]: "" });
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
    return Object.keys(errors).length === 0;
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
          const data = await response.json();
          console.log("User added:", data);
          setSelectedCustomer(userData.FirstName);
          Swal.fire({
            icon: "success",
            title: "User Added Successfully!",
            customClass: {
              popup: "z-50",
            },
            didOpen: () => {
              document.querySelector(".swal2-container").style.zIndex =
                "9999";
            },
          }).then(() => {
            handleClose();
          });
        } else if (response.status === 400) {
          const { errors } = await response.json();
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
          } else {
            Swal.fire({
              icon: "error",
              title: "User Addition Failed",
              text: "An error occurred while adding the user.",
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
          throw new Error("An error occurred while adding the user.");
        }
      } catch (error) {
        console.error("An error occurred:", error);
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
    }
  };

  return (
    <>
      <Button
        variant="outlined"
        color="primary"
        onClick={handleSelectCustomer}
      >
        Select Customer
      </Button>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add Customer</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="First Name"
            name="FirstName"
            value={userData.FirstName}
            onChange={handleChange}
            fullWidth
            variant="outlined"
            error={Boolean(errors.FirstName)}
            helperText={errors.FirstName}
            InputProps={{
              style: { borderRadius: "8px" },
            }}
            inputProps={{ maxLength: 20 }}
          />
          <TextField
            margin="dense"
            label="Last Name"
            name="LastName"
            value={userData.LastName}
            onChange={handleChange}
            fullWidth
            variant="outlined"
            error={Boolean(errors.LastName)}
            helperText={errors.LastName}
            InputProps={{
              style: { borderRadius: "8px" },
            }}
            inputProps={{ maxLength: 20 }}
          />
          <TextField
            margin="dense"
            label="NIC"
            name="NIC"
            value={userData.NIC}
            onChange={handleChange}
            fullWidth
            variant="outlined"
            error={Boolean(errors.NIC)}
            helperText={errors.NIC}
            InputProps={{
              style: { borderRadius: "8px" },
            }}
          />
          <TextField
            margin="dense"
            label="Phone Number"
            name="PhoneNumber"
            value={userData.PhoneNumber}
            onChange={handleChange}
            fullWidth
            variant="outlined"
            error={Boolean(errors.PhoneNumber)}
            helperText={errors.PhoneNumber}
            InputProps={{
              style: { borderRadius: "8px" },
            }}
          />
          <TextField
            margin="dense"
            label="Email"
            name="Email"
            value={userData.Email}
            onChange={handleChange}
            fullWidth
            variant="outlined"
            error={Boolean(errors.Email)}
            helperText={errors.Email}
            InputProps={{
              style: { borderRadius: "8px" },
            }}
          />
          <TextField
            margin="dense"
            label="Address"
            name="Address"
            value={userData.Address}
            onChange={handleChange}
            fullWidth
            variant="outlined"
            error={Boolean(errors.Address)}
            helperText={errors.Address}
            InputProps={{
              style: { borderRadius: "8px" },
            }}
            inputProps={{ maxLength: 100 }}
          />
          <TextField
            margin="dense"
            label="Username"
            name="Username"
            value={userData.Username}
            onChange={handleChange}
            fullWidth
            variant="outlined"
            error={Boolean(errors.Username)}
            helperText={errors.Username}
            InputProps={{
              style: { borderRadius: "8px" },
            }}
            inputProps={{ maxLength: 25 }}
          />
          <TextField
            margin="dense"
            label="Password"
            type={showPassword ? "text" : "password"}
            name="Password"
            value={userData.Password}
            onChange={handleChange}
            fullWidth
            variant="outlined"
            error={Boolean(errors.Password)}
            helperText={errors.Password}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handlePasswordVisibility}>
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
              style: { borderRadius: "8px" },
            }}
            inputProps={{ maxLength: 15 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleAddUser} color="primary">
            Add User
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CustomerAutocomplete;
