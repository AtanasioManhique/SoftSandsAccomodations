import React from "react";
import {useTranslation} from "react-i18next"
export default function PoliticaCancelamento() {

    const {t}= useTranslation();
return (
<div className="max-w-4xl mx-auto px-4 py-8 text-gray-800 leading-relaxed">
  <h1 className="text-3xl font-semibold mb-4 md:mt-14 mt-10">{t("policy.title")}</h1>


    <div className="space-y-6">
     <section>
        <ul className="list-disc pl-6 space-y-1"> 
         <li>{t("policy.subtitle")}</li>
         <li>
            {t("policy.text1")}
         </li>
         <li>{t("policy.text2")}</li>
         <li>{t("policy.text3")}</li>
        </ul>
        </section>


        <div className="w-full h-[1px] bg-gray-300"></div>
        <section>
                <h2 className="text-xl font-semibold mb-2">{t("policy.cancellationtax")}</h2>
                <ul className="list-disc pl-6 space-y-1"> 
                <li>{t("policy.text4")}</li>
                <li>{t("policy.text5")}</li>
                <li>{t("policy.text6")} </li>
                <li> {t("policy.text7")} </li>
               
                </ul>
               
            </section> 
        <div className="w-full h-[1px] bg-gray-300"></div>
        <section>
        <h2 className="text-xl font-semibold mb-2">{t("policy.schedulling")}</h2>
      
            <p> {t("policy.schedullingtext")} </p>
        </section>


    
        </div>
</div>
);
}