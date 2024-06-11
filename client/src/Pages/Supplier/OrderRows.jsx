import * as React from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

function OrderRows(props) {
  const { row } = props;
  const [open, setOpen] = React.useState(false);

  return (
    <React.Fragment>
      <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          {row.orderID}
        </TableCell>
        <TableCell>
          {row.FirstName} {row.LastName}
        </TableCell>
        <TableCell>{row.supplierID}</TableCell>
        <TableCell>{row.orderdate}</TableCell>
        <TableCell>{row.approvedate}</TableCell>
        <TableCell>{row.deliverdate}</TableCell>
        <TableCell>{row.receivedate}</TableCell>
        <TableCell>{row.price}</TableCell>
        <TableCell>{row.status}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={10}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Products
              </Typography>
              <Table size="small" aria-label="products">
                <TableHead>
                  <TableRow>
                    <TableCell>Product ID</TableCell>
                    <TableCell>Drug Name</TableCell>
                    <TableCell>Generic Name</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Unit Price</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.products.map((product) => (
                    <TableRow key={product.productID}>
                      <TableCell>{product.productID}</TableCell>
                      <TableCell>{product.drugname}</TableCell>
                      <TableCell>{product.genericName}</TableCell>
                      <TableCell>{product.quantity}</TableCell>
                      <TableCell>{product.unitprice}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

OrderRows.propTypes = {
  row: PropTypes.shape({
    orderID: PropTypes.number.isRequired,
    FirstName: PropTypes.string.isRequired,
    LastName: PropTypes.string.isRequired,
    supplierID: PropTypes.number.isRequired,
    orderdate: PropTypes.string.isRequired,
    approvedate: PropTypes.string.isRequired,
    deliverdate: PropTypes.string.isRequired,
    receivedate: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    status: PropTypes.string.isRequired,
    products: PropTypes.arrayOf(
      PropTypes.shape({
        productID: PropTypes.number.isRequired,
        drugname: PropTypes.string.isRequired,
        genericName: PropTypes.string.isRequired,
        quantity: PropTypes.number.isRequired,
        unitprice: PropTypes.number.isRequired,
      })
    ).isRequired,
  }).isRequired,
};

export default OrderRows;
