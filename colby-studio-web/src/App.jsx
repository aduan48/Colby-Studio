import { lazy, Suspense } from 'react';
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import './App.css'
import Home from './pages/Home' // landing page stays eager so it shows instantly
import { AnimatePresence } from 'framer-motion';
import ScrollToTop from './ScrollToTop';
import PageTransition from './components/PageTransition';

const About = lazy(() => import('./pages/About'));
const Request = lazy(() => import('./pages/Request'));
const BookingsPage = lazy(() => import('./pages/BookingsPage'));
const Booking = lazy(() => import('./pages/Booking'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));

/** Wraps a page in the transition + a placeholder while its code downloads */
const page = (el) => (
  <PageTransition>
    <Suspense fallback={<div className="page-loading" />}>{el}</Suspense>
  </PageTransition>
);

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" onExitComplete={() => window.scrollTo(0, 0)}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={page(<Home />)} />
        <Route path="/booking" element={page(<BookingsPage />)} />
        <Route path="/studio-booking" element={page(<Booking />)} />
        <Route path="/special-request" element={page(<Request />)} />
        <Route path="/privacy-policy" element={page(<PrivacyPolicy />)} />
        <Route path="/about" element={page(<About />)} />
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