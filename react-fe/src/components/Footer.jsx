import logoUpi from "../assets/logo-upi.png";
import logoLppm from "../assets/lppm-logo.png";
import { FaInstagram, FaYoutube } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className='mt-12 bg-gray-50'>
      <div className='bg-[#808080] text-white py-8 sm:py-10 md:py-12'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex flex-col lg:flex-row gap-8 lg:gap-20'>
            {/* Logo Section */}
            <div className='flex-1 flex flex-col items-center lg:items-start mb-6 lg:mb-0'>
              <div className='flex flex-col sm:flex-row items-center gap-8'>
                <div className='relative h-48 w-64 flex items-center justify-center'>
                  <img
                    src={logoUpi}
                    alt='UPI Logo'
                    width={176}
                    height={88}
                    loading='lazy'
                    decoding='async'
                    className='h-auto w-full max-h-48 object-contain object-center filter contrast-110 transition-transform duration-300 hover:scale-105'
                    style={{ imageRendering: 'auto' }}
                  />
                </div>
                <div className='relative h-24 w-44 flex items-center justify-center'>
                  <img
                    src={logoLppm}
                    alt='LPPM Logo'
                    width={176}
                    height={88}
                    loading='lazy'
                    decoding='async'
                    className='h-auto w-full max-h-48 object-contain object-center filter contrast-110 transition-transform duration-300 hover:scale-105'
                    style={{ imageRendering: 'auto' }}
                  />
                </div>
              </div>
            </div>


            {/* Contact & Links Section */}
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full'>
              {/* Contact Info */}
              <div className='space-y-3'>
                <h4 className='text-lg font-semibold border-b border-gray-500 pb-2'>
                  Contact Us
                </h4>
                <div className='space-y-2 text-sm text-gray-200'>
                  <p className='font-medium'>
                    Universitas Pendidikan Indonesia
                  </p>
                  <p>Jl. Dr. Setiabudhi No. 229 Bandung</p>
                  <p>40154, West Java - Indonesia</p>
                  <p>Email: lppm@upi.edu</p>
                  <p>Phone: +62 22 2013163</p>
                </div>
              </div>

              {/* Quick Links */}
              <div className='space-y-3'>
                <h4 className='text-lg font-semibold border-b border-gray-500 pb-2'>
                  Quick Links
                </h4>
                <nav className='space-y-2'>
                  {[
                    { name: 'SINTA UPI', href: 'https://sinta.kemdikbud.go.id/affiliations/profile/414' },
                    { name: 'Litabmas UPI', href: 'https://litabmas.upi.edu/' },
                    { name: 'KKN Tematik & P2MB', href: 'https://kkn.upi.edu/login' },
                    { name: 'BIMA', href: 'https://bima.kemdikbud.go.id/' },
                    { name: 'Simlitabmas', href: 'https://simlitabmas.kemdikbud.go.id/' }
                  ].map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='block text-gray-200 hover:text-white transition-colors duration-200 hover:pl-2'
                    >
                      {item.name}
                    </a>
                  ))}
                </nav>
              </div>

              {/* Social Media */}
              <div className='space-y-3'>
                <h4 className='text-lg font-semibold border-b border-gray-500 pb-2'>
                  Follow Us
                </h4>
                <div className='flex space-x-4 pt-1'>
                  {[
                    {
                      icon: <FaInstagram className='w-5 h-5' />,
                      href: 'https://www.instagram.com/dppmupi_untukindonesia/',
                      label: 'Instagram'
                    },
                    {
                      icon: <FaYoutube className='w-5 h-5' />,
                      href: 'https://www.youtube.com/@lppmupi3369',
                      label: 'YouTube'
                    }
                  ].map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='bg-white/10 hover:bg-white/20 rounded-full p-2.5 transition-colors duration-200'
                      aria-label={social.label}
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>

                <div className='pt-2'>
                  <p className='text-sm text-gray-300'>
                    Stay updated with our latest activities
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Section */}
      <div className='bg-black text-white py-4'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex flex-col md:flex-row justify-between items-center'>
            <p className='text-sm text-gray-300'>
              &copy; {new Date().getFullYear()} LPPM UPI. All rights reserved.
            </p>
            <div className='mt-2 md:mt-0 flex space-x-4'>
              <a href='#' className='text-sm text-gray-300 hover:text-white transition-colors'>
                Privacy Policy
              </a>
              <a href='#' className='text-sm text-gray-300 hover:text-white transition-colors'>
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
