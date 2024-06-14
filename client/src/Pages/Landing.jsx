import React, { useState, useEffect } from "react";
import ProductCard from "../Components/ProductCard"; // Assuming you have a ProductCard component for rendering product cards
import Navland from "../Components/Navland";
import Stack from "@mui/material/Stack";
import Pagination from "@mui/material/Pagination";
import Navbar from "../Components/Navbar";
import { jwtDecode } from "jwt-decode"; // Remove curly braces
import {
  Button,
  Grid,
  FormControlLabel,
  Checkbox,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

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
  const [token, setToken] = useState(null);
  const [products, setProducts] = useState([]);
  const [branches, setBranches] = useState([]);
  const [categories, setCategories] = useState([]);
  const [branchFilters, setBranchFilters] = useState([]);
  const [inStockFilter, setInStockFilter] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const storedData = localStorage.getItem("token");
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setToken(parsedData.token);
      jwtDecode(parsedData.token); // No need to store the decoded token if not used
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchBranches();
    fetchCategories();
  }, [branchFilters, inStockFilter, categoryFilter, page]);

  const fetchProducts = () => {
    const branchQuery = branchFilters.join(",");
    const inStockQuery = inStockFilter ? "true" : "false";
    const categoryQuery = categoryFilter;

    const query = new URLSearchParams({
      branches: branchQuery,
      inStock: inStockQuery,
      category: categoryQuery,
      page: page,
      limit: 8,
    }).toString();

    console.log(query);

    fetch(`http://localhost:3001/api/landing/getProduct?${query}`)
      .then((response) => response.json())
      .then((data) => {
        // Process the data to group by productID and merge quantities
        const groupedProducts = data.products.reduce((acc, product) => {
          const {
            productID,
            drugname,
            genericName,
            unitprice,
            image,
            branchName,
            quantity,
          } = product;

          if (!acc[productID]) {
            acc[productID] = {
              productID,
              drugname,
              genericName,
              unitprice,
              image,
              branches: [],
            };
          }

          acc[productID].branches.push({ branchName, quantity });
          return acc;
        }, {});

        // Convert the grouped products from an object back to an array
        setProducts(Object.values(groupedProducts));
      })
      .catch((error) => console.error("Error fetching products:", error));
  };

  const fetchBranches = () => {
    fetch("http://localhost:3001/api/landing/getBranches")
      .then((response) => response.json())
      .then((data) => setBranches(data.branches))
      .catch((error) => console.error("Error fetching branches:", error));
  };

  const fetchCategories = () => {
    fetch("http://localhost:3001/api/landing/getCategories")
      .then((response) => response.json())
      .then((data) => setCategories(data.categories))
      .catch((error) => console.error("Error fetching categories:", error));
  };

  const handleBranchFilterChange = (event) => {
    const { value } = event.target;
    setBranchFilters(
      branchFilters.includes(value)
        ? branchFilters.filter((branch) => branch !== value)
        : [...branchFilters, value]
    );
  };

  const handleInStockFilterChange = (event) => {
    setInStockFilter(event.target.checked);
  };

  const handleCategoryFilterChange = (event) => {
    setCategoryFilter(event.target.value);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  return (
    <div className="flex flex-col bg-[#EDEDED] w-screen h-screen">
      <div>{token ? <Navbar /> : <Navland />}</div>
      <div className="flex flex-col h-full">
        <div className="flex w-screen">
          <div className="flex-col p-4 rounded-xl border-2 px-10 py-20 justify-center w-1/5">
            <div className="flex justify-between border-2"></div>
            <div className="flex flex-col w-full gap-5 py-5">
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  {branches.map((branch) => (
                    <FormControlLabel
                      key={branch.branchName}
                      control={
                        <Checkbox
                          color="primary"
                          checked={branchFilters.includes(branch.branchName)}
                          onChange={handleBranchFilterChange}
                          value={branch.branchName}
                        />
                      }
                      label={branch.branchName}
                    />
                  ))}
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        color="primary"
                        checked={inStockFilter}
                        onChange={handleInStockFilterChange}
                      />
                    }
                    label="In Stock"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        color="primary"
                        checked={!inStockFilter}
                        onChange={() => setInStockFilter(!inStockFilter)}
                      />
                    }
                    label="Out of Stock"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel id="category-filter-label">Category</InputLabel>
                    <Select
                      labelId="category-filter-label"
                      id="category-filter"
                      value={categoryFilter}
                      onChange={handleCategoryFilterChange}
                    >
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      {categories.map((category) => (
                        <MenuItem
                          key={category.categoryName}
                          value={category.categoryName}
                        >
                          {category.categoryName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </div>
          </div>
          <div className="flex border-2 w-4/5 justify-center">
            <div className="flex flex-wrap gap-5 justify-around px-16 py-5">
              {products.map((product) => (
                <ProductCard
                  key={product.productID}
                  name={product.drugname}
                  genericname={product.genericName}
                  price={product.unitprice}
                  inStock={product.branches.some(
                    (branch) => branch.quantity > 0
                  )}
                  branches={product.branches}
                  image={product.image}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex-col w-screen justify-center items-center py-3">
          <div className="flex justify-center">
            <Stack spacing={2}>
              <Pagination
                count={10} // This should be dynamic based on total pages
                page={page}
                variant="outlined"
                shape="rounded"
                onChange={handlePageChange}
              />
            </Stack>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
