import React, { useState } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

function TableIn({stockID, drugName, genericName, branch, unitPrice, quantity,expiration,stockdate,restock,productID}) {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  return (
    <div>
      <table className="border table-auto text-black">
        <tbody>
          <tr className="flex w-screen pr-8 justify-around">
            <td>{stockID}</td>
            <td>{drugName}</td>
            <td>{genericName}</td>
            <td>{branch}</td>
            <td>{unitPrice} LKR</td>
            <td>{quantity}</td>
            <td>
              {expanded ? (
                <ExpandLessIcon onClick={toggleExpand} />
              ) : (
                <ExpandMoreIcon onClick={toggleExpand} />
              )}
            </td>
          </tr>
          {expanded && (
            <tr>
              <td>{expiration}</td>
              <td>{stockdate}</td>
              <td>{restock}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default TableIn;
