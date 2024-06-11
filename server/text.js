import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Collapse,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';

function Row({ row }) {
  const [open, setOpen] = useState(false);

  return (
    <React.Fragment>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
        <TableCell>{row.branchName}</TableCell>
        <TableCell>{row.orderdate}</TableCell>
        <TableCell>{row.confirmdate}</TableCell>
        <TableCell>{row.price}</TableCell>
        <TableCell>{row.note}</TableCell>
        <TableCell>{row.status}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Products
              </Typography>
              <Table size="small" aria-label="purchases">
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

export default function CollapsibleTable() {
  const [transfers, setTransfers] = useState([]);
  const [status, setStatus] = useState('');

  useEffect(() => {
    axios
      .get('/getTransfer', { params: { status } })
      .then((response) => {
        setTransfers(response.data.transfers);
      })
      .catch((error) => {
        console.error('There was an error fetching the data!', error);
      });
  }, [status]);

  return (
    <Box>
      <FormControl sx={{ minWidth: 120, marginBottom: 2 }}>
        <InputLabel>Status</InputLabel>
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          label="Status"
        >
          <MenuItem value=""><em>None</em></MenuItem>
          <MenuItem value="pending">Pending</MenuItem>
          <MenuItem value="confirmed">Confirmed</MenuItem>
          <MenuItem value="rejected">Rejected</MenuItem>
        </Select>
      </FormControl>
      <TableContainer component={Paper}>
        <Table aria-label="collapsible table">
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>Branch Name</TableCell>
              <TableCell>Order Date</TableCell>
              <TableCell>Confirm Date</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Note</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transfers.map((row) => (
              <Row key={row.transferID} row={row} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
