import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import BackToTop from "./components/BackToTop";
import Outreach from "./pages/Outreach";
import Thesis from "./pages/Thesis";
import Equipments from "./pages/Equipments";

import Home from "./pages/Home";
import Paper from "./pages/Paper";
import Patent from "./pages/Patent";
import Project from "./pages/Project";

export default function App() {
  return (
    <Router>
      <div className="font-sans bg-gray-100 pt-[64px] md:pt-[80px]">
        <Navbar />

        {/* Routing untuk halaman */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/paper" element={<Paper />} />
          <Route path="/patent" element={<Patent />} />
          <Route path="/project" element={<Project />} />
          <Route path="/Outreach" element={<Outreach />} />
        <Route path="/Thesis" element={<Thesis />} />
        <Route path="/Equipments" element={<Equipments />} />
        </Routes>

        <Footer />
        <BackToTop />
      </div>
    </Router>
  );
}
