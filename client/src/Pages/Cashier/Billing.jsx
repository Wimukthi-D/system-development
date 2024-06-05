import React, { useEffect, useState } from "react";
import Navbar from "../../Components/Navbar";
import { DataGrid } from "@mui/x-data-grid";
import { Select, MenuItem, TextField, Autocomplete } from "@mui/material";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Invoice from "../../Components/Invoice";
import NewCustomerPopup from "../../Components/NewCustomerPopup";

const VISIBLE_FIELDS = [
  "stockID",
  "quantity",
  "branchName",
  "unitprice",
  "categoryName",
  "genericName",
  "drugname",
  "branchID",
  "expireDate",
  "stockDate",
];

const Billing = () => {
  const [inventoryData, setInventoryData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);

  const storedData = localStorage.getItem("token");
  const parsedData = JSON.parse(storedData);
  const token = parsedData.token;
  const decodedToken = jwtDecode(token);
  const UserFirstname = decodedToken.FirstName;
  const BranchName =
    inventoryData.find((item) => item.branchID === decodedToken.branchID)
      ?.branchName || "";

  useEffect(() => {
    axios
      .get("http://localhost:3001/api/bill/getStock")
      .then((response) => {
        const data = response.data.stocks;
        setInventoryData(data);
        setFilteredData(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching inventory data:", error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    filterData();
  }, [selectedBranch, selectedCategory, searchInput]);

  const filterData = () => {
    let filtered = inventoryData;
    if (selectedBranch) {
      filtered = filtered.filter((item) => item.branchName === selectedBranch);
    }
    if (selectedCategory) {
      filtered = filtered.filter(
        (item) => item.categoryName === selectedCategory
      );
    }
    if (searchInput) {
      filtered = filtered.filter(
        (item) =>
          item.drugname.toLowerCase().includes(searchInput.toLowerCase()) ||
          item.genericName.toLowerCase().includes(searchInput.toLowerCase())
      );
    }
    setFilteredData(filtered);
  };

  const getUniqueValues = (key) => {
    return [...new Set(inventoryData.map((item) => item[key]))];
  };

  const handleRowClick = (params) => {
    const selectedItem = params.row;
    const existingItem = selectedItems.find(
      (item) => item.stockID === selectedItem.stockID
    );
    if (existingItem) {
      setSelectedItems((prevItems) =>
        prevItems.map((item) =>
          item.stockID === selectedItem.stockID
            ? { ...item, count: item.count + 1 }
            : item
        )
      );
    } else {
      setSelectedItems((prevItems) => [
        ...prevItems,
        { ...selectedItem, count: 1 },
      ]);
    }
  };

  const columns = [
    { field: "stockID", headerName: "Stock ID", width: 100 },
    { field: "drugname", headerName: "Drug Name", width: 150 },
    { field: "genericName", headerName: "Generic Name", width: 130 },
    { field: "quantity", headerName: "Quantity", width: 100 },
    { field: "unitprice", headerName: "Unit Price", width: 120 },
    { field: "expireDate", headerName: "Expire Date", width: 120 },
    { field: "stockDate", headerName: "Stock Date", width: 120 },
  ];

  return (
    <div className="flex flex-col h-screen w-screen">
      <div>
        <Navbar />
      </div>
      <div className="flex h-full w-full">
        <div className="flex flex-col w-3/5 p-4">
          <div className="flex justify-center gap-4 mb-4">
            <Autocomplete
              freeSolo
              options={[]}
              onInputChange={(event, newInputValue) =>
                setSearchInput(newInputValue)
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search"
                  variant="outlined"
                  style={{ width: 300, marginRight: 16, borderRadius: "8px" }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                    },
                  }}
                />
              )}
            />
            <Select
              defaultValue=""
              onChange={(e) => setSelectedBranch(e.target.value)}
              displayEmpty
              style={{ marginRight: 16, borderRadius: "8px" }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                },
              }}
            >
              <MenuItem value="">All Branches</MenuItem>
              {getUniqueValues("branchName").map((branch) => (
                <MenuItem key={branch} value={branch}>
                  {branch}
                </MenuItem>
              ))}
            </Select>
            <Select
              defaultValue=""
              onChange={(e) => setSelectedCategory(e.target.value)}
              displayEmpty
              style={{ marginRight: 16, borderRadius: "8px" }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                },
              }}
            >
              <MenuItem value="">All Categories</MenuItem>
              {getUniqueValues("categoryName").map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </div>
          <DataGrid
            rows={filteredData}
            columns={columns}
            loading={loading}
            getRowId={(row) => row.stockID}
            onRowClick={handleRowClick}
            columnBuffer={2}
            sx={{
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "#e0e0e0",
                fontSize: "1rem",
                fontWeight: "bold",
              },
              "& .MuiDataGrid-cell": {
                padding: "0 8px", // Adjust padding to reduce column gaps
              },
            }}
          />
        </div>
        <div className="flex flex-col w-2/5 p-2 h-full">
          <div className="flex-col w-full rounded-lg p-4 h-full bg-[#f5f5f5]">
            <div className="flex flex-col justify-start mb-4 p-4 bg-gray-200 rounded-lg">
              <div>
                <strong>Cashier:</strong> {UserFirstname}
              </div>
              <div>
                <strong>Customer:</strong> {NewCustomerPopup()}
              </div>
              <div>
                <strong>Branch:</strong> {BranchName}
              </div>
              <div className="flex justify-between">
                <div>
                  <strong>Date:</strong> {new Date().toDateString()}
                </div>
                <div>
                  <strong>Time:</strong> {new Date().toLocaleTimeString()}
                </div>
              </div>
              <div></div>
            </div>
            <div className="flex flex-col w-full h-full ">
              <Invoice
                selectedItems={selectedItems}
                setSelectedItems={setSelectedItems}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Billing;
