import React, { useState } from "react";
import { TextField, Button } from "@mui/material";
import { grey } from "@mui/material/colors";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import { MonetizationOn } from "@mui/icons-material";
import { createTheme } from "@mui/material/styles";
import { ThemeProvider } from "@emotion/react";
import Swal from "sweetalert2";
import jsPDF from "jspdf";
import "jspdf-autotable";
import html2canvas from "html2canvas";
import Header from "../assets/Header.png";

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

const Invoice = ({
  selectedItems,
  setSelectedItems,
  branchID,
  branchName,
  customerID,
  customerName,
  cashierID,
  cashierName,
}) => {
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [amountPaid, setAmountPaid] = useState(0);

  if (customerName === null) {
    customerName = "Guest";
  }

  console.log("selected passed", selectedItems);

  const handleCountChange = (event, stockID, increment = 0) => {
    const newCount =
      parseInt(event.target ? event.target.value : event, 10) + increment;
    if (!isNaN(newCount) && newCount > 0) {
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

  const handleCardPayment = () => {
    setPaymentMethod("card");
    setAmountPaid(calculateGrandTotal());
  };

  const handleContinue = () => {
    const data = selectedItems.map((item) => ({
      productID: item.productID,
      quantity: item.count,
      unitprice: item.unitprice,
      stockID: item.stockID,
    }));

    // Create the payload for the POST request
    const payload = {
      items: data,
      paymentMethod,
      cashierID,
      branchID,
      customerID,
    };
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
        } else {
          console.log("Invoice submitted successfully", data);
          Swal.fire({
            icon: "success",
            title: "Successful",
            text: "Invoice submitted successfully",
          }).then(() => {
            console.log("saleID:");
            generatePDF();
          });
        }
        return response.json();
      })
      .then((data) => {
        console.log("Sale ID:", data.saleID); // Access the saleID here
      })
      .catch((error) => {
        console.error("Error submitting invoice", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Error submitting invoice: " + error.message,
        });
      });
  };

  const calculateBalance = () => {
    return amountPaid - calculateGrandTotal();
  };

  const generatePDF = async () => {
    const input = document.getElementById("invoice");
    const canvas = await html2canvas(input);
    const imgData = canvas.toDataURL("image/png", 1.0); // Capture the invoice as an image
    const pdf = new jsPDF();
    const date = new Date().toLocaleString();

    // Create a promise to handle image loading
    const loadImage = (src) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = src;
        img.onload = () => resolve(img);
        img.onerror = (err) => reject(err);
      });
    };

    try {
      const logo = await loadImage(Header); // Path to your logo

      // Add logo to the PDF
      pdf.addImage(logo, "PNG", 0, 0, 210, 45); // Adjust the position and size as needed

      // Set font size for the header
      pdf.setFontSize(12);
      pdf.text(`Date & Time: ${date}`, 10, 45);
      pdf.text(`Cashier: ${cashierName}`, 10, 50);
      pdf.text(`Branch: ${branchName}`, 10, 55);
      pdf.text(`Customer: ${customerName}`, 10, 60);

      const tableRows = selectedItems.map((item) => [
        item.drugname,
        item.unitprice,
        item.count,
        item.unitprice * item.count,
      ]);

      // Set font size for the table header
      pdf.setFontSize(12);
      pdf.autoTable({
        head: [["Product", "Unit Price", "Quantity", "Total"]],
        body: tableRows,
        startY: 65,
      });

      // Set font size for the summary
      pdf.setFontSize(12);
      pdf.text(`Sub Total:`, 10, pdf.lastAutoTable.finalY + 10);
      pdf.text(
        `${calculateTotal().toFixed(2)}`,
        100,
        pdf.lastAutoTable.finalY + 10,
        { align: "right" }
      );
      pdf.text(`Discount:`, 10, pdf.lastAutoTable.finalY + 15);
      pdf.text(`${discount}%`, 100, pdf.lastAutoTable.finalY + 15, {
        align: "right",
      });
      pdf.setFontSize(16);
      pdf.text(`Grand Total:`, 10, pdf.lastAutoTable.finalY + 25);
      pdf.text(
        `${calculateGrandTotal().toFixed(2)}`,
        100,
        pdf.lastAutoTable.finalY + 25,
        { align: "right" }
      );

      pdf.setFontSize(12);
      pdf.text(`Payment Method:`, 10, pdf.lastAutoTable.finalY + 35);
      pdf.text(`${paymentMethod}`, 100, pdf.lastAutoTable.finalY + 35, {
        align: "right",
      });

      pdf.text(`Amount Paid:`, 10, pdf.lastAutoTable.finalY + 40);
      pdf.text(`${amountPaid.toFixed(2)}`, 100, pdf.lastAutoTable.finalY + 40, {
        align: "right",
      });
      pdf.text(`Balance:`, 10, pdf.lastAutoTable.finalY + 45);
      pdf.text(
        `${calculateBalance().toFixed(2)}`,
        100,
        pdf.lastAutoTable.finalY + 45,
        {
          align: "right",
        }
      );

      pdf.save(customerName + `.pdf`);
      window.location.reload();
    } catch (error) {
      console.error("Error loading the logo image:", error);
    }
  };

  return (
    <div id="invoice" className="flex flex-col justify-between">
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
                  style={{ width: 80, textAlign: "center" }}
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
              onClick={() => {
                handleCardPayment();
              }}
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
              {
                <>
                  <Button
                    variant="contained"
                    fullWidth
                    color="LGreen"
                    style={{
                      borderRadius: "10px",
                      textEmphasisColor: { grey },
                    }}
                    onClick={handleContinue}
                    disabled={
                      !paymentMethod || amountPaid < calculateGrandTotal()
                    }
                  >
                    Continue
                  </Button>
                </>
              }
            </ThemeProvider>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
