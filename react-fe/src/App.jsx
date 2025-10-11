import React from "react";
import { Routes, Route, Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import BackToTop from "./components/BackToTop";
import Login from "./components/Login";
import Home from "./pages/Home";
import Paper from "./pages/Paper/Paper";
import PaperDetail from "./pages/Paper/PaperDetail";
import Project from "./pages/Project";
import Patent from "./pages/Patent";
import Outreach from "./pages/Outreach";
import Thesis from "./pages/Thesis";
import Equipments from "./pages/Equipments";
import Organization from "./pages/Organization";
import Profile from "./pages/profile/Profile";
import ProfileDetail from "./pages/profile/ProfileDetail";

// Layout utama dengan Navbar & Footer
function MainLayout() {
  return (
    <div className="font-sans bg-white pt-[64px] md:pt-[80px] min-h-screen">
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
        <Route path='/patent' element={<Patent />} />
        <Route path='/profiles' element={<Profile />} />
        <Route path="/profile/:id" element={<ProfileDetail />} />
      </Routes>

      <Outlet /> {/* Tempat halaman anak (Home, Paper, dst) ditampilkan */}
      <Footer />
      <BackToTop />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* ======= LOGIN PAGE ======= */}
      <Route
        path="/login"
        element={
          <div className="grid w-[100%] h-screen place-items-center bg-gradient-to-r from-[#000000] to-[#9D1414] overflow-hidden">
            <Login />
          </div>
        }
      />

      {/* ======= MAIN LAYOUT ======= */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="paper" element={<Paper />} />
        <Route path="paper/:id" element={<PaperDetail />} />
        <Route path="project" element={<Project />} />
        <Route path="patent" element={<Patent />} />
        <Route path="outreach" element={<Outreach />} />
        <Route path="thesis" element={<Thesis />} />
        <Route path="equipment" element={<Equipments />} />
        <Route path="organization" element={<Organization />} />
        <Route path="organization/:id" element={<Organization />} />
        <Route path="profiles" element={<Profile />} />
      </Route>
    </Routes>
  );
}
