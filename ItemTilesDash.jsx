import React, { useState, useEffect } from 'react';

const storedData = localStorage.getItem('token');
let token;

if (storedData) {
  const parsedData = JSON.parse(storedData);
  token = parsedData.token;
} else {// Handle the case where the token is not stored
  token = null;
}

function ItemTiles({ image, name, icode, price, description }) {
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState(false);
  //const [stockAvailable, setStockAvailable] = useState(false);
  const [stock, setStock] = useState({
    kandyQuantity: 0,
    gurudeniyaQuantity: 0,
  });


  useEffect(() => {
    fetchStockInformation();
  }, []);

  const fetchStockInformation = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/product/getstock', {
        headers: {
          'authorization': token,
        },
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      const productData = data.products; // Access the users property
      console.log(productData);
      if (Array.isArray(productData)) {
        const currentProducts = productData.filter(product => product.ItemCode === icode);

        let kandyQuantity = 0;
        let gurudeniyaQuantity = 0;

        currentProducts.forEach(product => {
          if (product.WarehouseLocation === 'Kandy') {
            kandyQuantity += product.StockQuantity;
          } else if (product.WarehouseLocation === 'Gurudeniya') {
            gurudeniyaQuantity += product.StockQuantity;
          }
        });

        setStock({
          kandyQuantity,
          gurudeniyaQuantity,
        });
      } else {
        throw new Error('Data received is not in the expected format');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleMouseEnter = () => {
    setHovered(true);
  };

  const handleMouseLeave = () => {
    setHovered(false);
  };

  const toggleDescription = () => {
    setExpanded(!expanded);
  };

  const isOutOfStock = stock.kandyQuantity + stock.gurudeniyaQuantity === 0;

  return (
    <div
      className={`min-w-[245px] max-w-[230px] rounded-xl bg-white mb-5 hover:border-[#76767639] hover:border-[3px] border-[3px] border-transparent ${
        hovered ? 'hover:cursor-pointer' : ''
      } ${expanded ? 'h-auto' : isOutOfStock ? 'h-[370px] max-h-[380px]' : 'h-[370px] max-h-[460px]'}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={toggleDescription}
    >
      <div className='items-center'>
        <img src={image} alt={name} className="mt-6 mb-2 max-h-[165px] max-w-[230px] min-h-[165px] mx-auto" />
      </div>
      <div className="px-3 mt-1 mb-5">
        <h1 className="text-black text-[14px] font-semibold">{name}</h1>
        <h1 className="text-[#929292] text-[10px]">Item Code: {icode}</h1>
        <h1 className="mt-2 text-black text-[14px] font-semibold">LKR {price.toFixed(2)}</h1>
        {expanded && <h1 className="mt-2 text-[12px] whitespace-pre-line break-words">{description}</h1>}
        {stock.kandyQuantity + stock.gurudeniyaQuantity > 0 ? (
          <div className='flex-col'>
            <div className='mb-3'>
              <button className="bg-[#2e7e33] text-sm text-white font-semibold py-1 px-1 mt-3 rounded-xl w-[70px]">
                In Stock
              </button>
            </div>
            <div className='flex items-center'>
              <div className="flex justify-center items-center bg-[#dcd031] p-[2px] w-5 h-5 rounded-sm">
                G
              </div>
              <span className="ml-2"><b>{stock.gurudeniyaQuantity}</b> Units Left</span>
            </div>
            <div className='flex items-center'>
              <div className="flex justify-center items-center bg-[#dc7331] p-[2px] w-5 h-5 rounded-sm">
                K
              </div>
              <span className="ml-2"><b>{stock.kandyQuantity}</b> Units Left</span>
            </div>
          </div>
        ) : (
          <button className="bg-[#d32f2f] text-sm text-white font-semibold py-1 px-1 mt-3 rounded-xl w-[100px]">
            Out of Stock
          </button>
        )}
      </div>
    </div>
  );
}

export default ItemTiles;
