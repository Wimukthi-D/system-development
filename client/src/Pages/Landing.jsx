import React from "react";
import ProductCard from "../Components/ProductCard"; // Assuming you have a ProductCard component for rendering product cards
import Pagination from "../Components/Pagination";
import Navland from "../Components/Navland";
import SearchIcon from "@mui/icons-material/Search";

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
  return (
    <div className="flex flex-col bg-[#EDEDED] w-screen ">
      <div className="relative ">
        <Navland />
        <div className="flex -mt-5 w-screen justify-center ">
          <div className="flex bg-white p-2 w-1/4 items-center shadow-xl shadow-[#75cf7098] rounded-lg px-4  ">
            <div className="flex w-full">
              <InputField placeholder="Search" />
              <SearchIcon className="mx-2 opacity-50 rounded-full hover:scale-110 transition cursor-pointer" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col pt-10 h-full">
        <div className="flex w-screen">
          <div className="flex-col p-4 rounded-xl w-1/5">
            <div className="flex-col rounded-xl border-black">
              <h2>Filter</h2>
            </div>
          </div>
          <div className="w-4/5 flex-col">
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
