import React from 'react'
import Login from './Pages/login.jsx'
import Inventory from './Pages/Inventory.jsx'
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import Staffmanage from './Pages/Manager/Staffmanage.jsx';
import Analysis from './Pages/Manager/Analysis.jsx';
import LandingPage from './Pages/Landing.jsx';
import Users from './Pages/Users.jsx';
import TestSignup from './Pages/TestSignup.jsx';
import StockTable from './Components/StockTable.jsx';
import Billing from './Pages/Cashier/Billing.jsx';

function App() {
  return (
    
    <div className='App'>
      <Router>
        <Routes>
          <Route path='/' element={<LandingPage/>}/>
          <Route path='/Inventory' element={<Inventory/>}/>
          <Route path='/Staffmanagement' element={<Staffmanage/>}/>
          <Route path='/Analysis' element={<Analysis/>}/>
          <Route path='/login' element={<Login/>}/>
          <Route path='/Users' element={<Users/>}/>
          <Route path='/Test' element={<TestSignup/>}/>
          <Route path='/StockTable' element={<StockTable/>}/>
          <Route path='/Billing' element={<Billing/>}/>
          <Route path='*' element={<h1>Not Found</h1>}/>
        </Routes>
      </Router>
    </div>

  );
}

export default App;