import React from "react";
import { Routes, Route, Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import BackToTop from "./components/BackToTop";
import Login from "./components/Login";
import Home from "./pages/Home";
import Paper from "./pages/Paper/Paper";
import PaperDetail from "./pages/Paper/PaperDetail";
import Project from "./pages/project/Project";
import Patent from "./pages/patent/Patent";
import Outreach from "./pages/outreach/Outreach";
import Thesis from "./pages/thesis/Thesis";
import Equipments from "./pages/equipment/Equipments";
import EquipmentDetail from "./pages/equipment/EquipmentDetail";
import Organization from "./pages/organization/Organization";
import Profile from "./pages/profile/Profile";
import ProfileDetail from "./pages/profile/ProfileDetail";
import DetailProject from "./pages/project/DetailProject";
import DetailPatent from "./pages/patent/PatentDetail";
import OutreachDetail from "./pages/outreach/OutreachDetail";
import ThesisDetail from "./pages/thesis/ThesisDetail";
import OrganizationDetail from "./pages/organization/OrganizationDetail";

// Layout utama dengan Navbar & Footer
const MainLayout = () => (
  <div className='font-sans bg-white pt-[64px] md:pt-[80px] min-h-screen'>
    <Navbar />
    <main className='min-h-[calc(100vh-64px)] flex flex-col'>
      <Outlet />
    </main>
    <Footer />
    <BackToTop />
  </div>
);

// Layout untuk halaman login tanpa Navbar & Footer
const AuthLayout = () => (
  <div className='font-sans min-h-screen'>
    <Outlet />
  </div>
);

export default function App() {
  return (
    <div className='font-sans min-h-screen'>
      <Routes>
        {/* Routes with Main Layout (with Navbar & Footer) */}
        <Route element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path='/' element={<Home />} />
          <Route path='/paper' element={<Paper />} />
          <Route path='/paper/:id' element={<PaperDetail />} />
          <Route path='/project' element={<Project />} />
          <Route path='/projects/:id' element={<DetailProject />} />
          <Route path='/patent' element={<Patent />} />
          <Route path='/outreach' element={<Outreach />} />
          <Route path='/outreach/:id' element={<OutreachDetail />} />
          <Route path='/thesis' element={<Thesis />} />
          <Route path='/thesis/:id' element={<ThesisDetail />} />
          <Route path='/equipment' element={<Equipments />} />
          <Route path='/equipment/:id' element={<EquipmentDetail />} />
          <Route path='/organization' element={<Organization />} />
          <Route path='/organization/:id' element={<OrganizationDetail />} />
          <Route path='/patent' element={<Patent />} />
          <Route path='/detailpatent/:id' element={<DetailPatent />} />
          <Route path='/profiles' element={<Profile />} />
          <Route path='/profile/:id' element={<ProfileDetail />} />
        </Route>

        {/* Routes with Auth Layout (without Navbar & Footer) */}
        <Route element={<AuthLayout />}>
          <Route path='/login' element={<Login />} />
        </Route>
      </Routes>
    </div>
  );
}
