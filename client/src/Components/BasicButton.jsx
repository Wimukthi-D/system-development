import React from "react";

function BasicButton({ text }) {
  return (
    // Return a button with the text passed as a prop
    <div className="flex justify-center items-center pr-10">
      <button className="rounded-full bg-[#139E0C] hover:bg-[#437729] h-9 transition text-white px-8 cursor-pointer active:bg-[#192c10]">
        {text}
      </button>
    </div>
  );
}

export default BasicButton;
