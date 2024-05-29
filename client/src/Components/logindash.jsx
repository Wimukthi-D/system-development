import { useState } from "react";
import Loginbg from "../assets/loginbg.png";
import Plusjakarta from "../fonts/PlusJakartaSans-Regular.ttf";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Swal from "sweetalert2";

const Logindash = () => {
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
        localStorage.setItem("token",JSON.stringify({token}));
        const storedData = localStorage.getItem("token");
        const parsedData = JSON.parse(storedData);
        console.log(parsedData);

        // const decoded = jwtDecode(token);
        // console.log(decoded);

        // switch (decoded.role) {
        //   case "Manager":
        //     navigate("/Analysis");
        //     break;
        //   case "Cashier":
        //     navigate("/Billing");
        //     break;
        //   case "Staff":
        //     navigate("/Inventory");
        //     break;
        //   case "Supplier":
        //     navigate("/Orders");
        //     break;
        //   case "Customer":
        //     navigate("/");
        //     break;
        //   default:
        //     navigate("/");
        //     break;
        // }
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
    <div className="flex">
      <div className="flex w-1/2">
        <img
          src={Loginbg}
          alt="loginbg"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex w-1/2 justify-center">
        <div className="flex flex-col items-center justify-center h-screen">
          <h1
            className="text-4xl font-bold pb-4"
            style={{ fontFamily: Plusjakarta }}
          >
            Welcome Back!
          </h1>
          <input
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

          {/* <div className="flex items-center my-2 w-1/2">
            <input type="checkbox" id="rememberMe" className="mr-2" />
            <label htmlFor="rememberMe">Remember me</label>
          </div> */}

          <button
            className="bg-[#139E0C] hover:bg-[#0b6d08] focus:bg-[#0b6d08] text-white p-2 rounded-lg my-2 w-1/2 transition-colors duration-300 ease-in-out cursor-pointer"
            onClick={handleLogin}
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Logindash;
