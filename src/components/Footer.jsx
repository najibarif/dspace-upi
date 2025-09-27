import logoUpi from "../assets/logo-upi.png";
import logoLppm from "../assets/logo-lppm.png";
import { FaInstagram, FaYoutube } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className='mt-10'>
      <div className='bg-[#808080] text-white py-8'>
        <div className='mx-auto px-6 md:px-24'>
          <div className='flex flex-col lg:flex-row gap-8 lg:gap-12'>
            <div className='flex justify-center lg:justify-start'>
              <div className='flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6'>
                <img src={logoUpi} alt='UPI Logo' className='h-16 w-auto' />
                <img src={logoLppm} alt='LPPM Logo' className='h-16 w-auto' />
              </div>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-3 gap-8 flex-1'>
              <div>
                <h4 className='text-lg md:text-xl font-semibold mb-4 underline text-center sm:text-left'>
                  Contact Us
                </h4>
                <div className='space-y-2 text-sm md:text-base text-center sm:text-left'>
                  <p className='font-semibold'>
                    Universitas Pendidikan Indonesia
                  </p>
                  <p>Jl. Dr. Setiabudhi No. 229 Bandung</p>
                  <p>40154</p>
                  <p>West Java - Indonesia</p>
                  <p>E-mail: </p>
                </div>
              </div>

              <div>
                <h4 className='text-lg md:text-xl font-semibold mb-4 underline text-center sm:text-left'>
                  Important links
                </h4>
                <div className='space-y-2 text-sm md:text-base text-center sm:text-left'>
                  <a
                    href='https://sinta.kemdiktisaintek.go.id/affiliations/profile/414'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='block hover:text-gray-300 transition-colors'
                  >
                    SINTA UPI
                  </a>
                  <a
                    href='https://litabmas.upi.edu/'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='block hover:text-gray-300 transition-colors'
                  >
                    Litabmas UPI
                  </a>
                  <a
                    href='https://kkn.upi.edu/login'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='block hover:text-gray-300 transition-colors'
                  >
                    KKN Tematik & P2MB
                  </a>
                  <a
                    href='https://bima.kemdiktisaintek.go.id/'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='block hover:text-gray-300 transition-colors'
                  >
                    BIMA
                  </a>
                </div>
              </div>

              <div>
                <h4 className='text-lg md:text-xl font-semibold mb-4 underline text-center sm:text-left'>
                  Follow us
                </h4>
                <div className='flex justify-center sm:justify-start space-x-4'>
                  <a
                    href='https://www.instagram.com/dppmupi_untukindonesia/'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-white hover:text-gray-300 transition-colors'
                  >
                    <FaInstagram className='w-6 h-6' />
                  </a>
                  <a
                    href='https://www.youtube.com/@lppmupi3369'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-white hover:text-gray-300 transition-colors'
                  >
                    <FaYoutube className='w-6 h-6' />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='bg-black text-white py-4 md:py-5'>
        <div className='max-w-7xl mx-auto px-6 md:px-24 text-center'>
          <p className='text-sm md:text-base'>
            &copy; Universitas Pendidikan Indonesia 2025
          </p>
        </div>
      </div>
    </footer>
  );
}
