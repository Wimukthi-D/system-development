import React from "react";

function ProductCard({ name, genericname, price, branch, inStock, image }) {
  return (
    <div className="w-52 bg-white shadow-lg rounded-xl    ">
      <div className="relative w-52 h-52 overflow-hidden shadow-md rounded-xl">
        <img
          src={`http://localhost:3001/` + image}
          alt="Product"
          className="scale-150 object-cover"
        />
        <div
          className={`absolute rounded-md ${
            inStock ? "bg-[#2ED573]" : "bg-[#EF4444]"
          } bottom-2 right-2`}
        >
          <p className="text-xs text-white px-2 py-1">
            {inStock ? "In Stock" : "Out of Stock"}
          </p>
        </div>
      </div>

      <div>
        <div className="flex flex-col px-2">
          <p className="text-base font-bold">{name}</p>
          <p className="text-sm text-gray-500">{genericname}</p>
        </div>

        <div className="flex justify-between items-center pt-4 pb-2 px-2">
          <p className="text-xs text-[#2ED573] font-bold">{price} LKR</p>
          <p className="text-xs text-gray-500">{branch}</p>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
