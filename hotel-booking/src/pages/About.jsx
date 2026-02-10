import {useEffect, useState} from 'react'
import { Link, useLocation } from "react-router-dom";

import AboutIntro from "../AboutUs/AboutIntro"
import ProblemSection from "../AboutUs/ProblemsSection"
import OperateSection from "../AboutUs/OperateSection"
import HospitalitySection from "../AboutUs/HospitalitySection"
import SetUsApart from "../AboutUs/SetUsApart"
import TourismGrowth from "../AboutUs/TourismGrowth"
import FutureProjects from "../AboutUs/FutureProjects"
const About = ()  =>{
    
  const location = useLocation();
          useEffect(() => {
    const scrollToHash = () => {
      if (location.hash) {
        const element = document.querySelector(location.hash);
        if (element) {
          // altura do header fixo (ajusta conforme o teu layout)
          const offset = 50;

          // posição do elemento na página
          const elementPosition = element.getBoundingClientRect().top + window.scrollY;
          const offsetPosition = elementPosition - offset;

          // animação de rolagem suave com easing
          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });
        }
      } else {
        // se não tiver hash, sobe pro topo
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    };

    // usa pequeno atraso pra garantir que o DOM já renderizou
    const timeout = setTimeout(scrollToHash, 100);

    return () => clearTimeout(timeout);
  }, [location]);
  return(

        <>
        <section id="intro"> 
           <AboutIntro />
        </section>
       <section id="problems" >
        <ProblemSection /> 
         </section>
      <section id="operate">
          <OperateSection />
         </section>
        <section id="hospitality"> 
          <HospitalitySection />
        </section>
            <section id="apart"> 
              <SetUsApart />
              </section>
            <section id="tourism"> 
                <TourismGrowth />
            </section>
            <section id="future">
               <FutureProjects />
               </section>
      
        </>
  );



}
export default About;