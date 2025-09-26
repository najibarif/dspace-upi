import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Footer from "./components/Footer";
import BackToTop from "./components/BackToTop";
import Outreach from "./pages/Outreach";
import Thesis from "./pages/Thesis";
import Equipments from "./pages/Equipments";

export default function App() {
  return (
    <div className="font-sans bg-gray-100 pt-[64px] md:pt-[104px]">
      <Navbar />

      {/* Routing */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Outreach" element={<Outreach />} />
        <Route path="/Thesis" element={<Thesis />} />
        <Route path="/Equipments" element={<Equipments />} />
      </Routes>

      <Footer />
      <BackToTop />
    </div>
  );
}
