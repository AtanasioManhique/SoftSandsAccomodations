import { useState } from 'react'
import palmtree from '../assets/palmtree.png'

import { Link } from 'react-router-dom'
import arrow from '../assets/right-arrow.png'
import {useTranslation} from "react-i18next"

const Footer = () => {
  const [openLang, setOpenLang] = useState(false)
  const [openCurrency, setOpenCurrency] = useState(false)
  const {t}= useTranslation();

  return (
    <div>
      <div className='bg-[#F6F9FC] text-gray-500/80 pt-3 px-6 md:px-16 lg:px-24 xl:px-32 mt-7'>
        <div className='flex flex-wrap justify-between gap-12 md:gap-6'>

          {/* LOGO + TEXTO */}
          <div className='max-w-80'>
            <Link className="flex items-center gap-2 text-xl font-semibold" to='/'>
              <img src={palmtree} alt="logo" className='mb-4 h-8 md:h-9' />
              <span className='flex mb-4'>SoftSands</span>
            </Link>

            <p className='text-base'>
            {t("footer.description")}
            </p>

            <div className='flex items-center gap-3 mt-4'>
              <a href='https://www.instagram.com/softsandsaccommodation/' target='_blank' rel='noopener noreferrer'>
                <img src="/icons/instagram.png" className='w-6 h-6'/>
              </a>
              <a href='https://www.facebook.com/softsandsaccommodations' target='_blank' rel='noopener noreferrer'>
                <img src="/icons/facebook.png" className='w-6 h-6'/>
              </a>
            </div>
          </div>

          {/* EMPRESA */}
          <div>
            <p className='font-playfair text-xl text-gray-800'>{t("footer.company")}</p>
            <ul className='mt-3 flex flex-col gap-2 text-base'>
              <li><Link to="/sobre#intro">{t("footer.aboutus")}</Link></li>
              <li><Link to="/sobre#problems">{t("footer.ourmission")}</Link></li>
              <li><Link to="/sobre#apart">{t("footer.apart")}</Link></li>
              <li><Link to="/sobre#operate">{t("footer.operate")}</Link></li>

            </ul>
            
          </div>

          {/* SUPORTE */}
          <div>
            <p className='font-playfair text-xl text-gray-800'>{t("footer.support")}</p>
            <ul className='mt-3 flex flex-col gap-2 text-base'>
              <li><Link to="/contactenos" onClick={()=> window.scrollTo(0,0)}>{t("footer.contactus")}</Link></li>
              <li><Link to="/termosecondições" onClick={() => window.scrollTo(0, 0)}>{t("footer.conditions")}</Link></li>
              <li><Link to="/politicacancelamento" onClick={() => window.scrollTo(0, 0)}>{t("footer.cancellation")}</Link></li>
            </ul>
          </div>

          {/* NEWSLETTER */}
          <div className='max-w-80'>
            <p className='text-lg text-gray-800'>{t("footer.staytuned")}</p>
            <p className='mt-3 text-base'>
              {t("footer.build")}
            </p>
            <div className='flex items-center mt-4'>
              <input
                type="text"
                className='bg-white rounded-l border border-gray-300 h-9 px-3 outline-none'
                placeholder={t("footer.email")}
              />
              <button className='flex items-center justify-center bg-black h-9 w-9 rounded-r'>
                <img src={arrow} className='w-3.5 invert'/>
              </button>
            </div>

          </div>
        </div>

        <hr className='border-gray-300 mt-8' />

        {/* FOOTER BOTTOM */}
        <div className='flex flex-col md:flex-row gap-4 items-center justify-between py-5 text-base'>

          <p>
            © {new Date().getFullYear()} SoftSands Accommodations. {t("footer.rights")}.
          </p>

        

        </div>
      </div>
    </div>
  )
}



export default Footer
