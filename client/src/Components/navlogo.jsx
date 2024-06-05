import React from 'react'
import Logo from '../assets/DM logo.png'
import { jwtDecode } from 'jwt-decode'

const navlogo = () => {




  return (
    <div className='bg-white'>
      <img src={Logo} alt="logo" className = 'h-16  ml-5 pb-2 pt-2'/>
        <div className= 'bg-[#139E0C] h-8'>
        </div>
    </div>
  )
}

export default navlogo
