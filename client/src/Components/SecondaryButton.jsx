import React from "react";

function SecondaryButton({ text, onClick }) {
  return (
    <div className="flex justify-center items-center">
      <button
        className="rounded-lg bg-opacity-0 hover:bg-[#2b7c2b] h-9 transition text-white px-4 cursor-pointer outline outline-1 active:bg-[#233d16]"
        onClick={onClick}
      >
        {text}
      </button>
    </div>
  );
}

export default SecondaryButton;
