import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Footer from "./components/Footer";
import BackToTop from "./components/BackToTop";

export default function App() {
  return (
    <div className='font-sans bg-gray-100 pt-[64px] md:pt-[104px]'>
      <Navbar />
      <Home />
      <Footer />
      <BackToTop />
    </div>
  );
}
