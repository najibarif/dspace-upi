import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import BackToTop from "./components/BackToTop";

import Home from "./pages/Home";
import Paper from "./pages/Paper";
import Patent from "./pages/Patent";
import Project from "./pages/Project";
import Outreach from "./pages/Outreach";
import Thesis from "./pages/Thesis";
import Equipments from "./pages/Equipments";
import Profiles from "./pages/Profiles";
import Organization from "./pages/Organization";

export default function App() {
  return (
    <div className='font-sans bg-gray-100 pt-[64px] md:pt-[80px]'>
      <Navbar />

      {/* Routing untuk halaman */}
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/paper' element={<Paper />} />
        <Route path='/patent' element={<Patent />} />
        <Route path='/project' element={<Project />} />
        <Route path='/outreach' element={<Outreach />} />
        <Route path='/thesis' element={<Thesis />} />
        <Route path='/equipment' element={<Equipments />} />
        <Route path='/profiles' element={<Profiles />} />
        <Route path='/organization' element={<Organization />} />
      </Routes>

      <Footer />
      <BackToTop />
    </div>
  );
}
