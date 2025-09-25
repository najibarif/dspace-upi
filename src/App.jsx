import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import SDGs from "./components/SDGs";
import Footer from "./components/Footer";

export default function App() {
  return (
    <div className="font-sans bg-gray-100">
      <Navbar />
      <Hero />
      <SDGs />
      <Footer />
    </div>
  );
}
