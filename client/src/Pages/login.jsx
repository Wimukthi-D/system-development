import React from 'react'
import Navlogo from '../Components/navlogo'
import Logindash from '../Components/logindash'

const login = () => {
  return (
    <div className="fixed inset-0 overflow-hidden">
      <Navlogo/>
      <Logindash/>
    </div>
  )
}
export default login