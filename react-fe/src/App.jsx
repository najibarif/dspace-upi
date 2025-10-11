import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import BackToTop from "./components/BackToTop";

import Home from "./pages/Home";
import Paper from "./pages/Paper/Paper";
import PaperDetail from "./pages/Paper/PaperDetail";
import Project from "./pages/Project";
import Patent from "./pages/Patent";
import Outreach from "./pages/Outreach";
import Thesis from "./pages/Thesis";
import Equipments from "./pages/Equipments";
import Organization from "./pages/Organization";
import Profiles from "./pages/Profiles";

export default function App() {
  return (
    <div className='font-sans bg-gray-100 pt-[64px] md:pt-[80px]'>
      <Navbar />

      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/paper' element={<Paper />} />
        <Route path='/paper/:id' element={<PaperDetail />} />
        <Route path='/project' element={<Project />} />
        <Route path='/patent' element={<Patent />} />
        <Route path='/outreach' element={<Outreach />} />
        <Route path='/thesis' element={<Thesis />} />
        <Route path='/equipment' element={<Equipments />} />
        <Route path='/organization' element={<Organization />} />
        <Route path='/organization/:id' element={<Organization />} />
        <Route path='/profiles' element={<Profiles />} />
      </Routes>

      <Footer />
      <BackToTop />
    </div>
  );
}
