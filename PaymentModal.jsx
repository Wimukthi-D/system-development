import React, { useEffect } from 'react';
import Swal from 'sweetalert2';

const PaymentModal = ({ 
  isOpen, 
  onClose, 
  selectedPayment, 
  total, 
  cashGiven, 
  setCashGiven, 
  cardDetails, 
  setCardDetails, 
  handlePlaceOrder, 
  balance, 
  errors 
}) => {
    useEffect(() => {
        if (balance !== null) {
          // Show SweetAlert when balance is not null
          const swalWithBackdrop = Swal.mixin({
            customClass: {
              backdrop: 'swal2-backdrop-hide'
            }
          });
    
          swalWithBackdrop.fire({
            title: 'Order Placed Successfully',
            html: `Balance: LKR ${balance}`,
            icon: 'success',
            showCancelButton: false,
            allowEscapeKey:false,
            allowOutsideClick:false,
            confirmButtonText: 'OK'
          }).then((result) => {
            if (result.isConfirmed) {
              // Refresh the window
              onClose();
              window.location.reload();
            }
          });
        }
      }, [balance]);

  if (!isOpen) return null;

  const handleCashGivenChange = (e) => {
    const value = e.target.value;
    if (/^\d*\.?\d{0,2}$/.test(value)) {
      setCashGiven(value);
    }
  };

  const handleCardNumberChange = (e) => {
    const value = e.target.value;
    if (/^\d{0,16}$/.test(value)) {
      setCardDetails({ ...cardDetails, cardNumber: value });
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 z-40 bg-opacity-50 backdrop-blur-sm flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg w-1/3">
        {selectedPayment === 'cash' ? (
          <div>
            <h2 className="text-xl font-bold mb-4">Cash Payment</h2>
            <div className="mb-4">
              <label className="block text-sm font-bold mb-2">Total Amount: LKR {total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</label>
              <input 
                type="text" 
                className={`w-full px-3 py-2 border rounded ${errors.cashGiven ? 'border-red-500' : ''}`} 
                value={cashGiven} 
                onChange={handleCashGivenChange} 
                placeholder="Enter amount given by customer"
              />
              {errors.cashGiven && <p className="text-red-500 text-sm mt-1">{errors.cashGiven}</p>}
            </div>
            <div className="flex justify-between">
              <button className="bg-gray-500 hover:bg-gray-700 text-white py-2 px-4 rounded" onClick={onClose}>Back</button>
              <button className="bg-[#F05756] hover:bg-[#dc4e4e] text-white py-2 px-4 rounded" onClick={handlePlaceOrder}>Place Order</button>
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-bold mb-4">Card Payment</h2>
            <div className="mb-4">
              <label className="block text-sm font-bold mb-2">Total Amount: LKR {total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</label>
              <input 
                type="text" 
                className={`w-full px-3 py-2 border rounded mb-2 ${errors.cardNumber ? 'border-red-500' : ''}`} 
                value={cardDetails.cardNumber} 
                onChange={handleCardNumberChange} 
                placeholder="Enter card number"
              />
              {errors.cardNumber && <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>}
              <input 
                type="text" 
                className={`w-full px-3 py-2 border rounded ${errors.invoiceNumber ? 'border-red-500' : ''}`} 
                value={cardDetails.invoiceNumber} 
                onChange={(e) => setCardDetails({ ...cardDetails, invoiceNumber: e.target.value })} 
                placeholder="Enter invoice number"
              />
              {errors.invoiceNumber && <p className="text-red-500 text-sm mt-1">{errors.invoiceNumber}</p>}
            </div>
            <div className="flex justify-between">
              <button className="bg-gray-500 hover:bg-gray-700 text-white py-2 px-4 rounded" onClick={onClose}>Back</button>
              <button className="bg-[#F05756] hover:bg-[#dc4e4e] text-white py-2 px-4 rounded" onClick={handlePlaceOrder}>Place Order</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;
