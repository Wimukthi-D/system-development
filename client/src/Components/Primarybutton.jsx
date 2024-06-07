import React, { useState } from "react";
import AddIcon from "@mui/icons-material/Add";

function PrimaryButton({
  text,
  onClick,
  addIcon,
  color,
  hoverColor,
  activeColor,
  fullWidth,
  textColor,
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const handleHover = () => {
    setIsHovered(!isHovered);
  };

  const handleActive = () => {
    setIsActive(!isActive);
  };

  return (
    <div className="flex justify-center items-center">
      <button
        className={`rounded-lg   h-9 transition text-white px-5 cursor-pointer ${
          fullWidth ? "w-5/6" : ""
        }`}
        style={{
          backgroundColor: isActive
            ? activeColor
            : isHovered
            ? hoverColor
            : color,
          color: textColor, // Set text color
        }}
        onMouseEnter={handleHover}
        onMouseLeave={handleHover}
        onMouseDown={handleActive}
        onMouseUp={handleActive}
        onClick={onClick}
      >
        <div>
          {addIcon && <AddIcon className="mr-2" />} {text}
        </div>
      </button>
    </div>
  );
}

export default PrimaryButton;
