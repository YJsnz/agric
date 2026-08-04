import { HashRouter, Route, Routes, useLocation } from 'react-router-dom'
import ScrollToTop from './components/ScrollToTop'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Product from './pages/Product'
import Solutions from './pages/Solutions'
import DigitalTwin from './pages/DigitalTwin'
import About from './pages/About'
import Contact from './pages/Contact'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'

function Shell() {
  const { pathname } = useLocation()
  // 认证页是沉浸式全屏布局，不展示营销导航与页脚
  const isAuth = pathname === '/sign-in' || pathname === '/sign-up'

  return (
    <>
      {!isAuth && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/product" element={<Product />} />
        <Route path="/solutions" element={<Solutions />} />
        <Route path="/digital-twin" element={<DigitalTwin />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="*" element={<Home />} />
      </Routes>
      {!isAuth && <Footer />}
    </>
  )
}

export default function App() {
  return (
    <HashRouter>
      <ScrollToTop />
      <div className="w-full min-h-screen bg-page text-ink">
        <Shell />
      </div>
    </HashRouter>
  )
}
