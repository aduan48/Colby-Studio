import { useState } from 'react'
import Navbar from './components/Navbar'
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom'; 
import { Navigate } from 'react-router-dom';
import './App.css'
import Home from './pages/Home'
import { AnimatePresence } from 'framer-motion';
import ScrollToTop from './ScrollToTop';


function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <div className="App">


      <Router>
        <ScrollToTop />
        <Navbar />
        <AnimatedRoutes />
      </Router>
    </div>
  )
}

export default App;