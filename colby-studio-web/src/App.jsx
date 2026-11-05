import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom'; 
import About from './pages/About'
import Request from './pages/Request'
import './App.css'
import Home from './pages/Home'
import BookingsPage from './pages/BookingsPage'
import Booking from './pages/Booking'
import PrivacyPolicy from './pages/PrivacyPolicy'
import { AnimatePresence } from 'framer-motion';
import ScrollToTop from './ScrollToTop';
import PageTransition from './components/PageTransition';


function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" onExitComplete={() => window.scrollTo(0, 0)}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/booking" element={<PageTransition><BookingsPage /></PageTransition>} />
        <Route path="/studio-booking" element={<PageTransition><Booking /></PageTransition>} />
        <Route path="/special-request" element={<PageTransition><Request /></PageTransition>} />
        <Route path="/privacy-policy" element={<PageTransition><PrivacyPolicy /></PageTransition>} />
        <Route path="/about" element={<PageTransition><About /></PageTransition>} />
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
        <div className='pages'>
          <AnimatedRoutes />
          <Footer />
        </div>
      </Router>
    </div>
  )
}

export default App;