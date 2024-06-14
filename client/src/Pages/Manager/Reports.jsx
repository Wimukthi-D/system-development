import React from "react";
import axios from "axios";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import Button from "@mui/material/Button";

const fetchData = async () => {
  try {
    const [
      stock,
      branch,
      revenue,
      sales,
      order,
      remainStock,
      topSellingCategories,
      topSellingProducts,
    ] = await Promise.all([
      axios.get("http://localhost:3001/api/chart/getStock"),
      axios.get("http://localhost:3001/api/chart/getBranch"),
      axios.get("http://localhost:3001/api/chart/getRevenue?timeRange=month"),
      axios.get("http://localhost:3001/api/chart/getSales"),
      axios.get("http://localhost:3001/api/chart/getOrder"),
      axios.get("http://localhost:3001/api/chart/getRemainStock"),
      axios.get("http://localhost:3001/api/chart/getTopSellingCategories"),
      axios.get("http://localhost:3001/api/chart/getTopSellingProducts"),
    ]);

    return {
      stock: stock.data.stocks,
      branch: branch.data.branches,
      revenue: revenue.data.Revenue,
      sales: sales.data.Sales,
      order: order.data.Orders,
      remainStock: remainStock.data.Stocks,
      topSellingCategories: topSellingCategories.data.TopSellingCategories,
      topSellingProducts: topSellingProducts.data.TopSellingProducts,
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

const generateReport = async () => {
  const data = await fetchData();

  const doc = new jsPDF();

  // Title
  doc.setFontSize(18);
  doc.text("Monthly Report", 14, 22);

  // Stock Data
  doc.setFontSize(12);
  doc.text("Stock Data:", 14, 30);
  doc.autoTable({
    head: [
      [
        "Branch",
        "Drug Name",
        "Generic Name",
        "Category",
        "Quantity",
        "Unit Price",
        "Stock Date",
        "Expire Date",
      ],
    ],
    body: data.stock.map((item) => [
      item.branchName,
      item.drugname,
      item.genericName,
      item.categoryName,
      item.quantity,
      item.unitprice,
      item.stockDate,
      item.expireDate,
    ]),
    startY: 34,
  });

  // Revenue Data
  doc.addPage();
  doc.text("Revenue Data:", 14, 22);
  doc.autoTable({
    head: [["Time", "Revenue", "Branch ID"]],
    body: data.revenue.map((item) => [item.time, item.revenue, item.branchID]),
    startY: 26,
  });

  // Sales Data
  doc.addPage();
  doc.text(`Total Sales: ${data.sales}`, 14, 30);

  // Orders Data

  doc.text(`Total Orders: ${data.order}`, 14, 35);

  // Remaining Stock

  doc.text(`Remaining Stock Value: ${data.remainStock}`, 14, 40);

  // Top Selling Categories
  doc.addPage();
  doc.text("Top Selling Categories:", 14, 22);
  doc.autoTable({
    head: [["Category", "Total Quantity", "Total Revenue"]],
    body: data.topSellingCategories.map((item) => [
      item.category,
      item.totalQuantity,
      item.totalRevenue,
    ]),
    startY: 26,
  });

  // Top Selling Products
  doc.addPage();
  doc.text("Top Selling Products:", 14, 22);
  doc.autoTable({
    head: [["Drug Name", "Generic Name", "Total"]],
    body: data.topSellingProducts.map((item) => [
      item.drugname,
      item.genericName,
      item.Total,
    ]),
    startY: 26,
  });

  // Save the PDF
  doc.save("Monthly_Report.pdf");
};

const ReportButton = () => {
  return (
    <div>
      <Button variant="contained" onClick={generateReport}>
        Generate Report
      </Button>
      
    </div>
  );
};

export default ReportButton;
