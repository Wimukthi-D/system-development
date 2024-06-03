import React, { useEffect, useState } from 'react';
import SearchBar from '../../Components/showroom/SearchBar';
import CategoryTiles from '../../Components/showroom/CategoryTiles';
import ItemTiles from '../../Components/showroom/ItemTiles';
import DashedLine from '../../Components/showroom/DashedLine';
import PaymentModal from '../../Components/showroom/PaymentModal';
import jsPDF from 'jspdf';
import PopularIcon from '../../Assets/icons/popular.png';
import WallIcon from '../../Assets/icons/wall tiles.png';
import DefaultIcon from '../../Assets/icons/gallery.png';
import FloorIcon from '../../Assets/icons/floor tiles.png';
import ClosetIcon from '../../Assets/icons/closets.png';
import BasinIcon from '../../Assets/icons/basins.png';
import BidetsIcon from '../../Assets/icons/bidets.png';
import BathIcon from '../../Assets/icons/bath.png';
import CashIcon from '../../Assets/icons/cash.png';
import CardIcon from '../../Assets/icons/card.png';
import EventNoteIcon from '@mui/icons-material/EventNote';
import { ArrowBack, Search } from '@mui/icons-material';
import { FaTrash } from 'react-icons/fa';
import ProductCard from '../../Components/showroom/ProductCard';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Grid, IconButton } from '@mui/material';


const ShowroomDashboard = () => {

  const [selectedItem, setSelectedItem] = useState([]);
  const [userName, setUserName] = useState({
    userID: '',
    Name: '',
  });
  const [nextOrderNumber, setNextOrderNumber] = useState(null);
  const [Customer, setCustomer] = useState({
    Name: '',
    CustomerID: '',
  });
  const [showDialog, setShowDialog] = useState(true)
  const [open, setOpen] = useState(false)
  const [open1, setOpen1] = useState(false)
  const [errors, setErrors] = useState({});
  const [userData, setUserData] = useState({
    Username: '',
    Password: '',
    FirstName: '',
    LastName: '',
    NIC: '',
    Email: '',
    PhoneNumber: '',
    Address: '',
    Role: '',
  });
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState([]);
  const [token, setToken] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchText, setSearchText] = useState('');
  const [sortOption, setSortOption] = useState('NewestFirst');
  const [suggestions, setSuggestions] = useState([]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedPayment, setselectedPayment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cashGiven, setCashGiven] = useState('');
  const [cardDetails, setCardDetails] = useState({ cardNumber: '', invoiceNumber: '' });
  const [balance, setBalance] = useState(null);
  const [paymenterrors, setpaymentErrors] = useState({});

  const handleSelectOption = (option) => {
    setselectedPayment(option);
  };

  const handleContinue = () => {
    if (selectedPayment && selectedItem.length !== 0) {
      setIsModalOpen(true);
    }
  };

  const validateInputs = () => {
    const newErrors = {};
    if (selectedPayment === 'cash') {
      if (!cashGiven || parseFloat(cashGiven) < total) {
        newErrors.cashGiven = 'Please enter a valid amount that is greater than or equal to the total amount.';
      }
    } else if (selectedPayment === 'card') {
      if (!/^\d{16}$/.test(cardDetails.cardNumber)) {
        newErrors.cardNumber = 'Card number must be exactly 16 digits.';
      }
      if (!cardDetails.invoiceNumber) {
        newErrors.invoiceNumber = 'Please enter the invoice number.';
      }
    }
    return newErrors;
  };

  const generatePDFBill = (orderData, cash, currentDateTime) => {
    const shopInfo = {
      name: 'Ramitha Ceramic',
      address: '49,King Street,Kandy',
      tel: '081-2222494'
    };

    const orderDate = new Date(currentDateTime);
    const formattedDate = orderDate.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const formattedTime = orderDate.toLocaleTimeString('en-IN');

    const doc = new jsPDF();

    const pageWidth = doc.internal.pageSize.getWidth();

    const shopNameFontSize = 20;
    const addressFontSize = 16;
    const telFontSize = 14;

    // Shop Name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(shopNameFontSize);
    const shopNameWidth = doc.getTextDimensions(shopInfo.name).w;
    doc.text(shopInfo.name, (pageWidth - shopNameWidth) / 2, 10);

    // Address
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(addressFontSize);
    const addressWidth = doc.getTextDimensions(shopInfo.address).w;
    doc.text(shopInfo.address, (pageWidth - addressWidth) / 2, 18);

    // Tel
    doc.setFontSize(telFontSize);
    const telWidth = doc.getTextDimensions(`Tel: ${shopInfo.tel}`).w;
    doc.text(`Tel: ${shopInfo.tel}`, (pageWidth - telWidth) / 2, 25);

    // Add order details
    let ynew = 45;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(`Order No: ${nextOrderNumber}`, 10, ynew);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(13);
    doc.text(`Order Date: ${formattedDate}`, 10, ynew += 8);
    doc.text(`Order Time: ${formattedTime}`, 10, ynew += 8);
    doc.text(`Cashier: ${userName.Name}`, 10, ynew += 8);
    if (Customer.Name) {
      doc.text(`Customer: ${Customer.Name}`, 10, ynew += 8);
    }

    // Add items table header
    let y = ynew += 18;
    doc.text('ItemCode', 10, y);
    doc.text('ItemName', 40, y);
    doc.text('Qty', 105, y, { align: 'right' });
    doc.text('UnitPrice', 145, y, { align: 'right' });
    doc.text('Price', 195, y, { align: 'right' });

    // Add full-width dashed line
    doc.setLineDashPattern([1, 1], 0);
    doc.line(10, y + 3, pageWidth - 10, y + 3);
    doc.setLineDashPattern([], 0); // Reset line dash pattern

    y += 12;
    orderData.items.forEach(item => {
      doc.text(item.itemCode, 10, y);
      doc.text(item.Name, 40, y);
      doc.text(item.quantity.toString(), 105, y, { align: 'right' });
      doc.text(item.unitPrice.toFixed(2), 145, y, { align: 'right' });
      doc.text((item.unitPrice * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }), 195, y, { align: 'right' });
      y += 10;
    });

    // Add full-width dashed line
    doc.setLineDashPattern([1, 1], 0);
    doc.line(10, y - 2, pageWidth - 10, y - 2);
    doc.setLineDashPattern([], 0); // Reset line dash pattern

    // Add subtotal, discounts, and total
    doc.text('Subtotal', 10, y + 10);
    doc.text(':', 40, y + 10);
    doc.text(subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }), 195, y + 10, { align: 'right' });

    doc.text('Discounts', 10, y + 18);
    doc.text(':', 40, y + 18);
    doc.text('0.00', 195, y + 18, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Total', 10, y + 26);
    doc.setFont('helvetica', 'normal');
    doc.text(':', 40, y + 26);
    doc.setFont('helvetica', 'bold');
    doc.text(orderData.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }), 195, y + 26, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(13);
    // Add full-width dashed line
    doc.setLineDashPattern([1, 1], 0);
    doc.line(10, y + 32, pageWidth - 10, y + 32);
    doc.setLineDashPattern([], 0); // Reset line dash pattern

    // Add amount received and balance
    doc.text('Cash Paid', 10, y + 40);
    doc.text(':', 40, y + 40);
    doc.text(cash.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }), 195, y + 40, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.text('Total Change', 10, y + 48);
    doc.setFont('helvetica', 'normal');
    doc.text(':', 40, y + 48);
    doc.setFont('helvetica', 'bold');
    doc.text((cash - orderData.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }), 195, y + 48, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    // Add full-width dashed line
    doc.setLineDashPattern([1, 1], 0);
    doc.line(10, y + 54, pageWidth - 10, y + 54);
    doc.setLineDashPattern([], 0); // Reset line dash pattern

    // Add thank you message
    const thankYouMessage = 'Thank you for shopping with us!';
    const thankYouWidth = doc.getTextDimensions(thankYouMessage).w;
    doc.text(thankYouMessage, (pageWidth - thankYouWidth) / 2, y + 80);

    return doc;
  };



  const handlePlaceOrder = async () => {
    try {
      const newErrors = validateInputs();
      if (Object.keys(newErrors).length === 0) {
        if (selectedPayment === 'cash') {
          const cash = parseFloat(cashGiven);
          const bal = cash - total;

          const currentDateTime = new Date();
          const sriLankanTime = new Date(currentDateTime.getTime() + (5.5 * 60 * 60 * 1000));

          // Prepare data to send to backend
          const orderData = {
            userID: userName.userID,
            customerID: Customer.CustomerID,
            orderDate: sriLankanTime, // current date and time
            totalAmount: total,
            items: selectedItem.map(item => ({
              itemCode: item.ItemCode,
              Name: item.Name,
              quantity: item.count, // Assuming you have quantity stored in your selectedItem state
              unitPrice: item.Price
            }))
          };

          // Make API call to backend
          const response = await fetch('http://localhost:3001/api/order/placeOrder', {
            method: 'POST',
            headers: {
              'authorization': token,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
          });

          if (response.ok) {
            const data = await response.json();
            console.log('Order placed successfully:', data);
            setBalance(bal.toFixed(2));
            const pdfDoc = generatePDFBill(orderData, cash, currentDateTime);

            // Save the PDF
            pdfDoc.save('bill.pdf');

          } else {
            throw new Error('Failed to place order');
          }

        } else if (selectedPayment === 'card') {
          // Handle card payment logic here
          // Reset form fields or handle submission logic
          setIsModalOpen(false);
        }
      } else {
        setpaymentErrors(newErrors);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      // Show error using SweetAlert
      Swal.fire({
        icon: 'error',
        title: 'Failed to place order!',
      });
    }
  };

  const handleBackbilling = () => {
    setIsModalOpen(false);
    setBalance(null);
    setCashGiven('');
    setCardDetails({ cardNumber: '', invoiceNumber: '' });
    setpaymentErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    if (name === 'FirstName' || name === 'LastName') {
      newValue = newValue.slice(0, 20); // Limit to 20 characters for Address
      newValue = newValue.replace(/[0-9]/g, ''); // Allow only alphabets
    } else if (name === 'PhoneNumber') {
      newValue = newValue.slice(0, 10);
      newValue = newValue.replace(/[^0-9]/g, ''); // Allow only numbers
    } else if (name === 'Username') {
      newValue = newValue.slice(0, 25); // Limit to 15 characters for Address
      newValue = newValue.replace(/\s/g, ''); // Remove spaces
    } else if (name === 'Address') {
      newValue = newValue.slice(0, 100); // Limit to 100 characters for Address
    } else if (name === 'Email') {
      newValue = newValue.slice(0, 50); // Limit to 50 characters for Email
    } else if (name === 'NIC') {
      newValue = newValue.slice(0, 12); // Limit to 50 characters for Email
    }
    setUserData({ ...userData, [name]: newValue });
    setErrors({ ...errors, [name]: '' }); // Clear the error when input changes
  };

  const validateForm = () => {
    const errors = {};
    if (!userData.FirstName.trim()) {
      errors.FirstName = 'First Name is required';
    }
    if (!userData.LastName.trim()) {
      errors.LastName = 'Last Name is required';
    }
    if (!userData.NIC.trim()) {
      errors.NIC = 'NIC is required';
    } else if (!/^\d{9}[vVxX]?$/.test(userData.NIC) && !/^\d{12}$/.test(userData.NIC)) {
      errors.NIC = 'Invalid NIC format';
    }
    if (userData.Email.trim() && !/\S+@\S+\.\S+/.test(userData.Email)) {
      errors.Email = 'Invalid email address';
    }
    if (!userData.PhoneNumber.trim()) {
      errors.PhoneNumber = 'Phone Number is required';
    } else if (!/^0\d{9}$/.test(userData.PhoneNumber)) {
      errors.PhoneNumber = 'Invalid phone number';
    }
    if (!userData.Address.trim()) {
      errors.Address = 'Address is required';
    }
    setErrors(errors);
    return Object.keys(errors).length === 0; // Return true if there are no errors
  };

  const handleItemClick = (product) => {
    // Check if the selected product already exists in the list
    const index = selectedItem.findIndex((item) => item.ItemCode === product.ItemCode);

    if (index !== -1) {
      // If the product exists, update its count
      const updatedItems = [...selectedItem];
      updatedItems[index].count += 1;
      setSelectedItem(updatedItems);
    } else {
      // If the product doesn't exist, add it to the list with count 1
      setSelectedItem((prevSelectedItems) => [
        ...prevSelectedItems,
        { ...product, count: 1 }, // Add count property to the product
      ]);
    }
  };


  const handleRemove = (product) => {
    setSelectedItem((prevSelectedItems) =>
      prevSelectedItems.filter((item) => item.ItemCode !== product.ItemCode)
    );
  };

  const handleAddProduct = (product, amount) => {
    const updatedItems = [...selectedItem];
    const index = updatedItems.findIndex((item) => item.ItemCode === product.ItemCode);

    if (index !== -1) {
      updatedItems[index].count += amount;
      setSelectedItem(updatedItems);
    } else {
      setSelectedItem((prevSelectedItems) => [
        ...prevSelectedItems,
        { ...product, count: 1 },
      ]);
    }
  };

  const handleMinus = (product, amount) => {
    const updatedItems = [...selectedItem];
    const index = updatedItems.findIndex((item) => item.ItemCode === product.ItemCode);

    if (index !== -1 && updatedItems[index].count > 1) {
      updatedItems[index].count -= amount;
      setSelectedItem(updatedItems);
    }
  };

  const handleClearItems = () => {
    if (selectedItem.length > 0) {
      // Show confirmation dialog
      Swal.fire({
        title: 'Are you sure?',
        text: 'You want to empty the cart.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#2D865B',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, empty it!'
      }).then((result) => {
        if (result.isConfirmed) {
          // If confirmed, clear the cart
          setSelectedItem([]);
        }
      });
    }
  };

  // Calculate subtotal
  const subtotal = selectedItem.reduce((acc, curr) => acc + curr.Price * curr.count, 0);

  // Calculate total (assuming no discount for now)
  const total = subtotal;


  const checkUsername = async () => {
    const storedData = localStorage.getItem('token');
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      const token = parsedData.token;
      try {
        const decodedToken = jwtDecode(token);
        if (decodedToken) {
          setUserName({
            userID: decodedToken.userId,
            Name: decodedToken.FirstName,
          });
        }
      } catch (error) {
        setUserName({
          userID: null,
          Name: null,
        });
      }
    } else {
      setUserName({
        userID: null,
        Name: null,
      });
    }
    //setIsLoading(false); // Set loading state to false once authentication check is done
  };

  const fetchNextOrderNumber = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/order/nextOrderNumber', {
        headers: {
          'authorization': token,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch');
      }
      const data = await response.json();
      console.log(data);
      setNextOrderNumber(data.nextOrderNumber);
    } catch (error) {
      console.error('Error fetching next order number:', error);
      // Handle error
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchNextOrderNumber();
    checkUsername();
    setShowDialog(true);
    const storedData = localStorage.getItem('token');
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setToken(parsedData.token);
    }

  }, [token]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/product/getproduct', {
        headers: {
          'authorization': token,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []); // Assuming the response contains a key 'products'
      } else {
        console.error('Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/category/get', {
        headers: {
          'authorization': token,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setCategory(data.categories || []); // Assuming the response contains a key 'products'
        //console.log(category);
      } else {
        console.error('Failed to fetch categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchPopularProducts = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/product/popular', {
        headers: {
          'authorization': token,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setProducts(data.popularProducts || []); // Ensure data.popularProducts is an array
      } else {
        console.error('Failed to fetch popular products');
      }
    } catch (error) {
      console.error('Error fetching popular products:', error);
    }
  };

  const handleCategoryClick = (categoryName) => {
    if (categoryName === 'Popular') {
      fetchPopularProducts();
    } else {
      fetchProducts();
    }
    setSelectedCategory(categoryName);
  };

  const handleSortChange = (event) => {
    setSortOption(event.target.value);
  };

  const handleNewCustomer = () => {
    // Logic for handling new customer
    setShowDialog(false); // Close dialog after handling
    setOpen(true);
  };

  const handleExistingCustomer = () => {
    setShowDialog(false); // Close dialog after handling
    setOpen1(true);
  };

  const handlewithoutCustomer = () => {
    setShowDialog(false);
  };

  const handleBack = () => {
    setOpen1(false);
    setShowDialog(true);
    setErrors({});
    setPhoneNumber('');
  };

  const handlePhoneNumberChange = (event) => {
    const inputValue = event.target.value;
    // Only allow numeric characters
    const onlyNumbers = inputValue.replace(/[^0-9]/g, '');
    // Limit to 10 characters
    const trimmedValue = onlyNumbers.slice(0, 10);
    setPhoneNumber(trimmedValue);
  };

  const handleClose = () => {
    setOpen(false);
    setShowDialog(true);
    setUserData({
      FirstName: '',
      LastName: '',
      NIC: '',
      Email: '',
      PhoneNumber: '',
      Address: '',
    });
    setErrors({});
  };

  const handleCustomerSearch = async () => {
    const errors = {};
    if (!/^0\d{9}$/.test(phoneNumber)) {
      errors.PhoneNumber = 'Invalid phone number';
      setErrors(errors);
    } else {
      setErrors({});
      try {
        const response = await fetch('http://localhost:3001/api/customer/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'authorization': token,
          },
          body: JSON.stringify({ PhoneNumber: phoneNumber }),
        });

        if (response.ok) {
          // User added successfully
          const data = await response.json();
          console.log('Customer exists:', data);
          const cusdata = data.customer;
          console.log('Customer', cusdata);
          setCustomer({
            Name: cusdata[0].firstname,
            CustomerID: cusdata[0].customerid,
          });
          setOpen1(false);
        }

      } catch (error) {
        // Handle network or unexpected errors
        console.error('Error searching customer:', error);
        let errorMessage = 'An error occurred while searching the Customer.';
        Swal.fire({
          icon: 'error',
          title: 'Customer Not Exists',
          text: errorMessage,
          customClass: {
            popup: 'z-50', // Apply Tailwind CSS class to adjust z-index
          },
          didOpen: () => {
            document.querySelector('.swal2-container').style.zIndex = '9999'; // Adjust z-index here
          }
        });
      }
    }

  }

  const handleAdd = async () => {
    if (validateForm()) {
      try {
        const response = await fetch('http://localhost:3001/api/customer/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'authorization': token,
          },
          body: JSON.stringify(userData),
        });

        if (response.ok) {
          // User added successfully
          const data = await response.json();
          console.log('Customer added:', data);
          setCustomer({
            Name: data.Name,
            CustomerID: data.CustomerId,
          });
          Swal.fire({
            icon: 'success',
            title: 'Customer Added Successfully!',
            customClass: {
              popup: 'z-50', // Apply Tailwind CSS class to adjust z-index
            },
            didOpen: () => {
              document.querySelector('.swal2-container').style.zIndex = '9999'; // Adjust z-index here
            }
          }).then(() => {
            handleClose();
            setShowDialog(false);
          });
        } else if (response.status === 400) {// Error due to existing fields
          const { errors } = await response.json();
          // Handle specific error cases
          if (errors.Email) {
            Swal.fire({
              icon: 'error',
              title: 'Customer Addition Failed',
              text: errors.Email,
              customClass: {
                popup: 'z-50', // Apply Tailwind CSS class to adjust z-index
              },
              didOpen: () => {
                document.querySelector('.swal2-container').style.zIndex = '9999'; // Adjust z-index here
              }
            });
          } else if (errors.NIC) {
            Swal.fire({
              icon: 'error',
              title: 'Customer Addition Failed',
              text: errors.NIC,
              customClass: {
                popup: 'z-50', // Apply Tailwind CSS class to adjust z-index
              },
              didOpen: () => {
                document.querySelector('.swal2-container').style.zIndex = '9999'; // Adjust z-index here
              }
            });
          } else if (errors.PhoneNumber) {
            Swal.fire({
              icon: 'error',
              title: 'Customer Addition Failed',
              text: errors.PhoneNumber,
              customClass: {
                popup: 'z-50', // Apply Tailwind CSS class to adjust z-index
              },
              didOpen: () => {
                document.querySelector('.swal2-container').style.zIndex = '9999'; // Adjust z-index here
              }
            });
          } else {
            // Handle other validation errors
            Swal.fire({
              icon: 'error',
              title: 'Customer Addition Failed',
              text: '',
              html: Object.values(errors).map(error => `<div>${error}</div>`).join(''),
              customClass: {
                popup: 'z-50', // Apply Tailwind CSS class to adjust z-index
              },
              didOpen: () => {
                document.querySelector('.swal2-container').style.zIndex = '9999'; // Adjust z-index here
              }
            });
          }
        } else {
          // Other server-side error
          console.error('Failed to add customer');
          Swal.fire({
            icon: 'error',
            title: 'Customer Addition Failed',
            text: 'An error occurred while adding the Customer.',
            customClass: {
              popup: 'z-50', // Apply Tailwind CSS class to adjust z-index
            },
            didOpen: () => {
              document.querySelector('.swal2-container').style.zIndex = '9999'; // Adjust z-index here
            }
          });
        }
      } catch (error) {
        // Handle network or unexpected errors
        console.error('Error adding customer:', error);
        let errorMessage = 'An error occurred while adding the Customer.';
        Swal.fire({
          icon: 'error',
          title: 'Customer Addition Failed',
          text: errorMessage,
          customClass: {
            popup: 'z-50', // Apply Tailwind CSS class to adjust z-index
          },
          didOpen: () => {
            document.querySelector('.swal2-container').style.zIndex = '9999'; // Adjust z-index here
          }
        });
      }
    }
  };

  const handleSearch = (text) => {
    setSearchText(text);
    if (text.length > 0) {
      const matchedSuggestions = products
        .filter((product) =>
          product.Name.toLowerCase().includes(text.toLowerCase()) ||
          product.ItemCode.toLowerCase().includes(text.toLowerCase())
        )
        .slice(0, 5); // Limit the number of suggestions
      setSuggestions(matchedSuggestions);
    } else {
      setSuggestions([]);
    }
  };

  const handleSelectSuggestion = (suggestion) => {
    setSearchText(suggestion.Name);
    setSuggestions([]);
  };


  const getIconForCategory = (categoryName) => {
    switch (categoryName) {
      case 'Wall Tiles':
        return { icon: WallIcon, isIconComponent: false };
      case 'Floor Tiles':
        return { icon: FloorIcon, isIconComponent: false };
      case 'Water Closets':
        return { icon: ClosetIcon, isIconComponent: false };
      case 'Wash Basins':
        return { icon: BasinIcon, isIconComponent: false };
      case 'Bidets':
        return { icon: BidetsIcon, isIconComponent: false };
      case 'Bath & Shower':
        return { icon: BathIcon, isIconComponent: false };
      default:
        return { icon: DefaultIcon, isIconComponent: false };
    }
  };

  const filteredProducts = products
    .filter((product) =>
      (selectedCategory === 'Popular' || selectedCategory === 'All') || product.CName === selectedCategory
    )
    .filter((product) =>
      product.Name.toLowerCase().includes(searchText.toLowerCase()) ||
      product.ItemCode.toLowerCase().includes(searchText.toLowerCase())
    );

  const sortedProducts = selectedCategory === 'Popular' ? filteredProducts : [...filteredProducts].sort((a, b) => {
    switch (sortOption) {
      case 'A-Z':
        return a.Name.localeCompare(b.Name);
      case 'Z-A':
        return b.Name.localeCompare(a.Name);
      case 'PriceLowHigh':
        return a.Price - b.Price;
      case 'PriceHighLow':
        return b.Price - a.Price;
      case 'NewestFirst':
        return new Date(b.created_at) - new Date(a.created_at);
      case 'OldestFirst':
        return new Date(a.created_at) - new Date(b.created_at);
      default:
        return 0;
    }
  });


  return (
    <div className="h-screen flex bg-[#F7F7F7]">
      <div className='w-20 h-screen'></div>
      <div className="flex w-full overflow-y-auto">
        <div className="w-[65%]">
          <SearchBar
            onSearch={handleSearch}
            suggestions={suggestions}
            onSelectSuggestion={handleSelectSuggestion}
            setSuggestions={setSuggestions}  // Pass setSuggestions function
          />
          <h1 className="text-[#2B2B2B] font-semibold text-xl mx-8 mt-8">Choose Category</h1>
          <div className="mx-8 overflow-x-auto overflow-y-hidden whitespace-nowrap" style={{ height: '140px', scrollbarWidth: 'none', '-ms-overflow-style': 'none' }}>
            <div className="flex space-x-[52px]">
              <CategoryTiles
                icon={EventNoteIcon}
                text={"All"}
                isIconComponent={true}
                onClick={() => handleCategoryClick('All')}
                isSelected={selectedCategory === 'All'}
              />
              <CategoryTiles
                icon={PopularIcon}
                text={"Popular"}
                onClick={() => handleCategoryClick('Popular')}
                isSelected={selectedCategory === 'Popular'}
              />
              {category?.length > 0 ? (
                category.map((category, index) => {
                  const { icon, isIconComponent } = getIconForCategory(category.Name);
                  return (
                    <CategoryTiles
                      key={index}
                      icon={icon}
                      text={category.Name}
                      isIconComponent={isIconComponent}
                      onClick={() => handleCategoryClick(category.Name)}
                      isSelected={selectedCategory === category.Name}
                    />
                  );
                })
              ) : (
                <p>No categories available.</p>
              )}
            </div>
          </div>
          <div className="flex justify-end mt-8 mx-8">
            {selectedCategory !== 'Popular' && (
              <>
                <p className="text-[#000000] text-[14px] mr-3">Sort by :</p>
                <select
                  value={sortOption}
                  onChange={handleSortChange}
                  className="text-[#000000] text-[14px] border border-gray-300 rounded px-2 mb-4 h-5"
                >
                  <option value="A-Z">Name (A-Z)</option>
                  <option value="Z-A">Name (Z-A)</option>
                  <option value="PriceLowHigh">Price (low to high)</option>
                  <option value="PriceHighLow">Price (high to low)</option>
                  <option value="NewestFirst">Date Added (newest first)</option>
                  <option value="OldestFirst">Date Added (oldest first)</option>
                </select>
              </>
            )}
          </div>
          <div className="gap-5 ml-8 mr-4 overflow-y-auto mt-2 flex flex-wrap" style={{ maxHeight: '85vh', height: '100%', paddingRight: '16px', boxSizing: 'content-box' }}>
            {sortedProducts?.length > 0 ? (
              sortedProducts.map((product, index) => (
                <ItemTiles
                  key={index}
                  image={product.Photo}
                  name={product.Name}
                  icode={product.ItemCode}
                  price={product.Price}
                  description={product.Description}
                  onClick={() => handleItemClick(product)}
                />
              ))
            ) : (
              <p>No products available.</p>
            )}
          </div>
        </div>
        <div className="w-[35%]">
          <h1 className="text-[#2B2B2B] font-semibold text-[26px] text-center mx-10 mt-11 relative">
            Bill
            <FaTrash className="absolute top-0 right-0 mt-2 mr-2 cursor-pointer text-red-500" onClick={handleClearItems} />
          </h1>
          <div className="h-[70%] mx-6 overflow-auto">
            {/* Render selected item data */}
            <p>Order No: {nextOrderNumber}</p>
            <p>Cashier: {userName.Name}</p>
            <p>Customer: {Customer.Name}</p>
            <br />

            <div className="max-h-[78%] overflow-auto">
              {selectedItem.map((product, index) => (
                <ProductCard
                  key={index}
                  product={product}
                  handleRemove={handleRemove}
                  count={product.count}
                  onAdd={(amount) => handleAddProduct(product, amount)}
                  onMinus={(amount) => handleMinus(product, amount)}
                />
              ))}
            </div>
          </div>
          <div className="h-[23%] mx-8">
            <div className='flex'>
              <div className="w-[50%]">
                <h1 className="text-[#929292] text-[14px] mb-3">Subtotal</h1>
              </div>
              <div className="w-[50%] text-end">
                <h1 className="text-[#929292] text-[14px] mb-3">{subtotal.toFixed(2)}</h1>
              </div>
            </div>
            <div className='flex'>
              <div className="w-[50%] justify-between">
                <h1 className="text-[#929292] text-[14px] mb-3">Discount</h1>
              </div>
              <div className="w-[50%] text-end">
                <h1 className="text-[#929292] text-[14px] mb-3">0.00</h1>
              </div>
            </div>

            <DashedLine />
            <div className='flex'>
              <div className="w-[50%] justify-between">
                <h1 className="text-black text-[24px] font-bold mb-3">Total</h1>
              </div>
              <div className="w-[50%] text-end">
                <h1 className="text-black text-[24px] font-bold mb-3">
                  LKR&nbsp;&nbsp;{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h1>
              </div>
            </div>

          </div>
          <div className="h-[20%] mx-10 items-center justify-center">
            <h1 className="text-black text-[26px] font-bold mb-6 text-center">Payment Method</h1>
            <div className='flex justify-center items-center'>
              <div
                className={`border-2 border-transparent ${selectedPayment === 'cash' ? 'bg-[#FFEEEF] border-[#F05756] border-2' : 'hover:bg-[#FFEEEF] hover:border-[#F05756] hover:border-2 cursor-pointer'} rounded-lg w-[85px] h-[70px] mr-5 flex flex-col justify-center items-center`}
                onClick={() => handleSelectOption('cash')}
              >
                <img src={CashIcon} alt="cash" className="mt-6 mb-2" />
                <h1 className="text-[#929292] text-[14px] mb-3 text-center">Cash</h1>
              </div>
              <div
                className={`border-2 border-transparent ${selectedPayment === 'card' ? 'bg-[#FFEEEF] border-[#F05756] border-2' : 'hover:bg-[#FFEEEF] hover:border-[#F05756] hover:border-2 cursor-pointer'} rounded-lg w-[85px] h-[70px] flex flex-col justify-center items-center`}
                onClick={() => handleSelectOption('card')}
              >
                <img src={CardIcon} alt="card" className="mt-6 mb-2" />
                <h1 className="text-[#929292] text-[14px] mb-3 text-center">Card</h1>
              </div>
            </div>
            <button className="bg-[#F05756] hover:bg-[#dc4e4e] text-white font-normal py-2 px-4 rounded-lg w-full h-12 mt-8 mb-4" onClick={handleContinue}>
              CONTINUE
            </button>

            <PaymentModal
              isOpen={isModalOpen}
              onClose={handleBackbilling}
              selectedPayment={selectedPayment}
              total={total}
              cashGiven={cashGiven}
              setCashGiven={setCashGiven}
              cardDetails={cardDetails}
              setCardDetails={setCardDetails}
              handlePlaceOrder={handlePlaceOrder}
              balance={balance}
              errors={paymenterrors}
            />

            <Dialog
              open={showDialog}
              aria-labelledby="form-dialog-title"
              disableEscapeKeyDown={true}
              BackdropProps={{
                style: { backdropFilter: 'blur(5px)' },
                invisible: true // This will prevent backdrop click
              }}
            >
              <DialogTitle id="form-dialog-title" className='text-center font-extrabold'>Are you a new or existing customer?</DialogTitle>
              <DialogActions className="mx-4 mb-4">
                <div>
                  <div className='w-full space-x-4'>
                    <Button onClick={handleNewCustomer} color="success" variant="contained"  >
                      New Customer
                    </Button>
                    <Button onClick={handleExistingCustomer} color="error" variant="contained"  >
                      Existing Customer
                    </Button>
                  </div>
                  <div className='mt-5 text-center'>
                    <h1
                      onClick={handlewithoutCustomer}
                      style={{ cursor: 'pointer', color: 'red' }}
                    >
                      <b>Proceed without Customer {'>>>'}</b>
                    </h1>
                  </div>
                </div>
              </DialogActions>
            </Dialog>

            <Dialog
              open={open}
              aria-labelledby="form-dialog-title"
              disableEscapeKeyDown={true}
              BackdropProps={{
                style: { backdropFilter: 'blur(5px)' },
                invisible: true // This will prevent backdrop click
              }}
            >
              <DialogTitle id="form-dialog-title" className='text-center font-extrabold'>Add Customer</DialogTitle>
              <div className='mb-3'>
                <DialogContent>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        label="First Name"
                        name="FirstName"
                        value={userData.FirstName}
                        onChange={handleChange}
                        fullWidth
                        error={Boolean(errors.FirstName)}
                        helperText={errors.FirstName}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="Last Name"
                        name="LastName"
                        value={userData.LastName}
                        onChange={handleChange}
                        fullWidth
                        error={Boolean(errors.LastName)}
                        helperText={errors.LastName}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="NIC"
                        name="NIC"
                        value={userData.NIC}
                        onChange={handleChange}
                        fullWidth
                        error={Boolean(errors.NIC)}
                        helperText={errors.NIC}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="Phone Number (07X XXX XXXX)"
                        name="PhoneNumber"
                        value={userData.PhoneNumber}
                        onChange={handleChange}
                        fullWidth
                        error={Boolean(errors.PhoneNumber)}
                        helperText={errors.PhoneNumber}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="Email"
                        type="email"
                        name="Email"
                        value={userData.Email}
                        onChange={handleChange}
                        fullWidth
                        error={Boolean(errors.Email)}
                        helperText={errors.Email}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="Address"
                        name="Address"
                        value={userData.Address}
                        onChange={handleChange}
                        fullWidth
                        multiline
                        rows={4}
                        error={Boolean(errors.Address)}
                        helperText={errors.Address}
                      />
                    </Grid>
                  </Grid>
                </DialogContent>
              </div>
              <DialogActions className="mx-4 mb-4">
                <div className='w-full space-y-2'>
                  <Button onClick={handleAdd} color="success" variant="contained" fullWidth >
                    Add Cusotmer
                  </Button>
                  <Button onClick={handleClose} color="error" variant="contained" fullWidth >
                    Cancel
                  </Button>
                </div>
              </DialogActions>
            </Dialog>

            <Dialog
              open={open1}
              aria-labelledby="form-dialog-title"
              disableEscapeKeyDown={true}
              BackdropProps={{
                style: { backdropFilter: 'blur(5px)' },
                invisible: true // This will prevent backdrop click
              }}
            >
              <div className="relative">
                <IconButton onClick={handleBack} className="absolute left-2 top-2 text-gray-700">
                  <ArrowBack />
                </IconButton>
                <DialogTitle id="form-dialog-title" className="text-center font-extrabold px-5 pt-10">
                  Search Existing Customer
                </DialogTitle>
                <DialogContent className="mb-3 px-5">
                  <Grid container alignItems="center">
                    <Grid item xs={12} className="flex">
                      <TextField
                        label="Phone Number"
                        name="PhoneNumber"
                        fullWidth
                        value={phoneNumber}
                        onChange={handlePhoneNumberChange}
                        error={Boolean(errors.PhoneNumber)}
                        helperText={errors.PhoneNumber}
                        className="flex-grow mr-2"
                      />
                      <IconButton onClick={handleCustomerSearch} color="primary">
                        <Search />
                      </IconButton>
                    </Grid>
                  </Grid>
                </DialogContent>
              </div>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ShowroomDashboard;
