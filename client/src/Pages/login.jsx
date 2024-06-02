import { useState } from "react";
import Loginbg from "../assets/loginbg.png";
import Plusjakarta from "../fonts/PlusJakartaSans-Regular.ttf";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Swal from "sweetalert2";
import Navlogo from "../Components/navlogo";
import Logo from "../assets/DM logo.png";
import { TextField, IconButton, InputAdornment } from "@mui/material";
import { styled } from "@mui/system";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const RoundedTextField = styled(TextField)({
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
  },
});

const Logindash = () => {
  const handlePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    const data = { username, password };
    axios
      .post("http://localhost:3001/api/auth/login", data, {
        // add any additional configurations here
      })
      .then((response) => {
        const token = response.data.token;
        localStorage.setItem("token", JSON.stringify({ token }));
        const storedData = localStorage.getItem("token");
        const parsedData = JSON.parse(storedData);
        console.log(parsedData);
        const decoded = jwtDecode(token);
         console.log(decoded);

        switch (decoded.role) {
          case "Manager":
            navigate("/manager-dashboard");
            break;
          case "Cashier":
            navigate("/cashier-dashboard");
            break;
          case "Staff":
            navigate("/staff-dashboard");
            break;
          case "Supplier":
            navigate("/supplier-dashboard");
            break;
          case "Customer":
            navigate("/customer-dashboard");
            break;
          default:
            navigate("/");
            break;
        }
      })
      .catch((error) => {
        console.error(error);
        Swal.fire({
          icon: "error",
          title: error.response.data.error,
          customClass: {
            popup: "z-50", // Apply Tailwind CSS class to adjust z-index
          },
          didOpen: () => {
            document.querySelector(".swal2-container").style.zIndex = "9999"; // Adjust z-index here
          },
        });
      });
  };

  return (
    <div className="flex flex-col w-screen h-screen">
      <div className="flex-col w-full bg-white">
        <img src={Logo} alt="logo" className="h-16  ml-5 pb-2 pt-2" />
        <div className="flex-col bg-[#139E0C] h-8"></div>
      </div>
      <div className="flex w-full  justify-center items-center overflow-hidden">
        <div className="flex w-1/2 h-full">
          <img
            src={Loginbg}
            alt="loginbg"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex w-1/2 h-full items-center justify-center">
          <div className="flex flex-col items-center gap-4 justify-center w-1/2 h-full ">
            <h1
              className="text-4xl mb-5 font-bold"
              style={{ fontFamily: Plusjakarta }}
            >
              Welcome Back!
            </h1>
            <RoundedTextField
              variant="outlined"
              label="Username"
              name="Username"
              onChange={(event) => {
                setUsername(event.target.value);
              }}
              fullWidth
            />
            <RoundedTextField
              variant="outlined"
              label="Password"
              type={showPassword ? "text" : "password"}
              name="Password"
              onChange={(event) => {
                setPassword(event.target.value);
              }}
              fullWidth
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
            {/* <input
              type="text"
              placeholder="Enter your Username"
              className="border-2 border-gray-300 p-2 rounded-lg my-2 w-1/2"
              onChange={(event) => {
                setUsername(event.target.value);
              }}
            />
            <input
              type="password"
              placeholder="Enter your Password"
              className="border-2 border-gray-300 p-2 rounded-lg my-2 w-1/2"
              onChange={(event) => {
                setPassword(event.target.value);
              }}
            />

            <div className="flex items-center my-2 w-1/2">
            <input type="checkbox" id="rememberMe" className="mr-2" />
            <label htmlFor="rememberMe">Remember me</label>
          </div> */}

            <button
              className="bg-[#139E0C] hover:bg-[#0b6d08] focus:bg-[#0b6d08] text-white text-2xl py-3 my-5 rounded-lg w-full transition-colors duration-300 ease-in-out cursor-pointer"
              onClick={handleLogin}
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Logindash;
