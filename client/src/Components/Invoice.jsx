import React, { useState } from "react";
import { TextField, Button } from "@mui/material";
import axios from "axios";
import { grey } from "@mui/material/colors";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import { MonetizationOn } from "@mui/icons-material";
import { createTheme } from "@mui/material/styles";
import { ThemeProvider } from "@emotion/react";

const theme = createTheme({
  palette: {
    LGreen: {
      main: "#4ade80",
      light: "#16a34a",
      dark: "#22c55e",
      contrastText: "#242105",
    },
  },
});

const Invoice = ({ selectedItems, setSelectedItems, branchID }) => {
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [amountPaid, setAmountPaid] = useState(0);

  const handleCountChange = (event, stockID, increment = 0) => {
    const newCount =
      parseInt(event.target ? event.target.value : event, 10) + increment;
    if (!isNaN(newCount) && newCount > 0 ) {
      setSelectedItems((prevItems) =>
        prevItems.map((item) =>
          item.stockID === stockID ? { ...item, count: newCount } : item
        )
      );
    }
  };

  const handleRemoveItem = (stockID) => {
    setSelectedItems((prevItems) =>
      prevItems.filter((item) => item.stockID !== stockID)
    );
  };

  const calculateTotal = () => {
    return selectedItems.reduce(
      (acc, item) => acc + item.unitprice * item.count,
      0
    );
  };

  const calculateGrandTotal = () => {
    const total = calculateTotal();
    return total - (total * discount) / 100;
  };

  const handleContinue = () => {
    const data = selectedItems.map((item) => ({
      stockID: item.stockID,
      amount: item.count,
      branchID: item.branchID,
    }));

    // Create the payload for the POST request
    const payload = {
      items: data,
      discount,
      total: calculateGrandTotal(),
      paymentMethod,
      amountPaid,
    };

    //console.log(payload);
    // Use fetch instead of axios to make the POST request
    fetch("http://localhost:3001/api/bill/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok" + response.statusText);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Invoice submitted successfully", data);
      })
      .catch((error) => {
        console.error("Error submitting invoice", error);
      });
  };

  const calculateBalance = () => {
    return amountPaid - calculateGrandTotal();
  };

  return (
    <div className="flex flex-col border justify-between">
      <div className="flex flex-col">
        <ul className="flex flex-col  gap-2">
          {selectedItems.map((item) => (
            <li
              key={item.stockID}
              className="flex justify-between py-2 bg-white rounded-lg shadow-sm  "
            >
              <div className="flex flex-col px-4">
                <div className="text">
                  <strong>{item.drugname}</strong>
                </div>
                {item.genericName}
              </div>
              <div className="flex items-center px-10">
                <strong>{item.unitprice * item.count} LKR</strong>
              </div>
              <div className="flex items-center">
                <Button
                  onClick={() =>
                    handleCountChange(item.count, item.stockID, -1)
                  }
                >
                  {<RemoveIcon />}
                </Button>
                <TextField
                  value={item.count}
                  onChange={(event) => handleCountChange(event, item.stockID)}
                  inputProps={{ min: 1 }}
                  size="small"
                  style={{ width: 80 , textAlign: "center" }}
                />
                <Button
                  onClick={() => handleCountChange(item.count, item.stockID, 1)}
                >
                  {<AddIcon />}
                </Button>
              </div>
              <div className="flex-1 flex gap-2">
                <Button onClick={() => handleRemoveItem(item.stockID)}>
                  {<RemoveCircleOutlineIcon sx={"color:red"} />}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-col p-2">
        <div className="flex justify-between px-5 pt-2 items-center">
          <div>Sub Total:</div>
          <div>{calculateTotal().toFixed(2)} LKR</div>
        </div>
        <div className="flex justify-end gap-4 px-4 ">
          <div className="flex justify-end py-2 mt-2">
            <TextField
              label="Discount (%)"
              value={discount}
              type="number"
              size="small"
              style={{ width: 100 }}
              onChange={(e) => setDiscount(parseFloat(e.target.value))}
              inputProps={{ min: 0, max: 100 }}
            />
          </div>
          <div className="flex justify-end py-2 mt-2">
            <TextField
              label="Amount Paid"
              type="number"
              style={{ width: 100 }}
              value={amountPaid}
              size="small"
              onChange={(e) => setAmountPaid(parseFloat(e.target.value))}
            />
          </div>
        </div>
        <div className="flex w-full px-5">
          <svg width="100%" height="10">
            <line
              x1="0"
              y1="100%"
              x2="100%"
              y2="100%"
              stroke="black"
              strokeWidth="2"
            />
          </svg>
        </div>
        <div className="flex justify-between px-5 mt-2 mb-5">
          <div className="flex text-3xl ">
            <strong>Total:</strong>
          </div>
          <div className="flex text-3xl">
            {calculateGrandTotal().toFixed(2)} LKR
          </div>
        </div>
        {paymentMethod === "cash" && (
          <>
            <div className="flex justify-between px-5 items-center  mt-2">
              <div>Balance:</div>
              <div>{calculateBalance().toFixed(2)} LKR</div>
            </div>
          </>
        )}
        <div className="flex w-full justify-center">
          <div className="flex justify-center w-1/2 px-5 gap-4 mt-2">
            <Button
              variant={paymentMethod === "cash" ? "contained" : "outlined"}
              onClick={() => setPaymentMethod("cash")}
              style={{ borderRadius: "10px" }}
              fullWidth
            >
              <div className="flex gap-2">
                {<MonetizationOn />}
                Cash
              </div>
            </Button>
            <Button
              variant={paymentMethod === "card" ? "contained" : "outlined"}
              onClick={() => setPaymentMethod("card")}
              style={{ borderRadius: "10px" }}
              fullWidth
            >
              <div className="flex gap-2">
                {<CreditCardIcon />}
                Card
              </div>
            </Button>
          </div>
        </div>
        <div className="flex w-full justify-center">
          <div className=" flex justify-center w-1/2 px-5 mt-4">
            <ThemeProvider theme={theme}>
              <Button
                variant="contained"
                fullWidth
                color="LGreen"
                style={{ borderRadius: "10px", textEmphasisColor: { grey } }}
                onClick={handleContinue}
                disabled={
                  !paymentMethod ||
                  (paymentMethod === "cash" && amountPaid <= 0)
                }
              >
                Continue
              </Button>
            </ThemeProvider>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
