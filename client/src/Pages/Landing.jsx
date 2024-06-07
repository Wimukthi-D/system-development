import React, { useState, useEffect } from "react";
import ProductCard from "../Components/ProductCard"; // Assuming you have a ProductCard component for rendering product cards
import Pagination from "../Components/Pagination";
import Navland from "../Components/Navland";
import SearchIcon from "@mui/icons-material/Search";
import Navbar from "../Components/Navbar";
import { jwtDecode } from "jwt-decode";

function InputField({ placeholder }) {
  return (
    <input
      type="text"
      placeholder={placeholder}
      className="outline-none border-none w-96"
    />
  );
}

function LandingPage() {
  const [token, setToken] = useState(null);
  useEffect(() => {
    const storedData = localStorage.getItem("token");
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setToken(parsedData.token);
      const decodedToken = jwtDecode(parsedData.token);
    }
  }, []);

  return (
    <div className="flex flex-col bg-[#EDEDED] w-screen h-screen">
      <div>{token ? <Navbar /> : <Navland />}</div>
      <div className="flex flex-col h-full">
        <div className="flex w-screen ">
          <div className="flex-col p-4 rounded-xl w-1/5">
            <div className="flex-col rounded-xl border-black">
              <h2>Filter</h2>
            </div>
          </div>
          <div className="w-4/5 flex-col ">
            <div className="flex justify-around py-4">
              <ProductCard
                name="Penadol tablets 500mg"
                genericname={"Paracetamol"}
                price={"3.54"}
                branch={"Dankotuwa|Marawila"}
                inStock="1"
              />
              <ProductCard
                name="Penadol tablets 500mg"
                genericname={"Paracetamol"}
                price={"3.54"}
                branch={"Dankotuwa|Marawila"}
              />
              <ProductCard
                name="Penadol tablets 500mg"
                genericname={"Paracetamol"}
                price={"3.54"}
                branch={"Dankotuwa|Marawila"}
              />
              <ProductCard
                name="Penadol tablets 500mg"
                genericname={"Paracetamol"}
                price={"3.54"}
                branch={"Dankotuwa|Marawila"}
              />
            </div>
            <div className="flex justify-around py-4">
              <ProductCard
                name="Penadol tablets 500mg"
                genericname={"Paracetamol"}
                price={"3.54"}
                branch={"Dankotuwa|Marawila"}
                inStock="1"
              />
              <ProductCard
                name="Penadol tablets 500mg"
                genericname={"Paracetamol"}
                price={"3.54"}
                branch={"Dankotuwa|Marawila"}
              />
              <ProductCard
                name="Penadol tablets 500mg"
                genericname={"Paracetamol"}
                price={"3.54"}
                branch={"Dankotuwa|Marawila"}
              />
              <ProductCard
                name="Penadol tablets 500mg"
                genericname={"Paracetamol"}
                price={"3.54"}
                branch={"Dankotuwa|Marawila"}
              />
            </div>
          </div>
        </div>

        <div className="flex-col w-screen justify-center items-center py-3 ">
          <div className="flex justify-center">
            <Pagination />
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
