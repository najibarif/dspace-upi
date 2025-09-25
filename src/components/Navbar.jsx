export default function Navbar() {
  return (
    <header className="bg-red-700 text-white">
      <div className="container mx-auto flex justify-between items-center py-4 px-6">
        <div className="flex items-center space-x-3">
          <img src="/upi-logo.png" alt="UPI Logo" className="h-10" />
          <span className="text-xl font-bold">
            Universitas Pendidikan Indonesia
          </span>
        </div>
        <nav className="space-x-6 hidden md:flex">
          <a href="#" className="hover:text-gray-200">Home</a>
          <a href="#" className="hover:text-gray-200">Profiles</a>
          <a href="#" className="hover:text-gray-200">Organization</a>
          <a href="#" className="hover:text-gray-200">Paper</a>
          <a href="#" className="hover:text-gray-200">Project</a>
          <a href="#" className="hover:text-gray-200">Patent</a>
          <a href="#" className="hover:text-gray-200">Outreach</a>
          <a href="#" className="hover:text-gray-200">Thesis</a>
          <a href="#" className="hover:text-gray-200">Equipment</a>
        </nav>
      </div>
    </header>
  );
}
