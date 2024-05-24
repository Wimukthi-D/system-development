import { useState } from 'react';
import Loginbg from '../assets/loginbg.png';
import Plusjakarta from '../fonts/PlusJakartaSans-Regular.ttf';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Logindash = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    const data = { username, password };
    axios.post('http://localhost:3001/api/auth/login', data, {
      // add any additional configurations here
    }).then(response => {
      console.log(response.data);
      const { usertype } = response.data;
      console.log(usertype);
  
      switch (usertype) {
        case 'Manager':
          navigate('/Staffmanagement');
          break;
        case 'Cashier':
          navigate('/Inventory');
          break;
        case 'Staff':
          navigate('/Inventory');
          break;
        case 'Supplier':
          navigate('/');
          break;
        default:
          navigate('*');
          break;
      }
    }).catch(error => {
      console.error(error);
    });
  };
  
  return (
    <div className="flex">

        <div className="w-1/2">
          <img src={Loginbg} alt="loginbg" className='w-full h-full object-cover'/>
        </div>

        <div className="w-1/2">
          <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-4xl font-bold pb-4" style={{ fontFamily: Plusjakarta }}>Welcome Back!</h1>
            <input type="text" placeholder="Enter your Username" className="border-2 border-gray-300 p-2 rounded-lg my-2 w-1/2" onChange={(event) => 
              {setUsername(event.target.value);
              }} />
            <input type="password" placeholder="Enter your Password" className="border-2 border-gray-300 p-2 rounded-lg my-2 w-1/2" onChange={(event) => 
              {setPassword(event.target.value);
              }} />

            <div className="flex items-center my-2 w-1/2">
              <input type="checkbox" id="rememberMe" className="mr-2" />
              <label htmlFor="rememberMe">Remember me</label>
            </div>
            
           <button className="bg-[#139E0C] hover:bg-[#0b6d08] focus:bg-[#0b6d08] text-white p-2 rounded-lg my-2 w-1/2 transition-colors duration-300 ease-in-out cursor-pointer" onClick={handleLogin}>Login</button>
          </div>
        </div>
    </div>
  );
};

export default Logindash;
