import React from "react";
import {useTranslation} from "react-i18next"

export default function TermosECondicoes() {
    const {t}= useTranslation();
return (
<div className="max-w-4xl mx-auto px-4 py-8 text-gray-800 leading-relaxed">
  <h1 className="text-3xl font-semibold mb-4 md:mt-14 mt-10">{t("conditions.title")}</h1>


    <div className="space-y-6">
     <section>
        <h2 className="text-xl font-semibold mb-2">{t("conditions.subtitle")}</h2>
        <ul className="list-disc pl-6 space-y-1"> 
         <li >{t("conditions.text1")}</li>
         <li>
            {t("conditions.text2")}
         </li>
         <li>{t("conditions.text3")}</li>
         <li>{t("conditions.text4")}</li>
        </ul>
       
        </section>


        <div className="w-full h-[1px] bg-gray-300"></div>
        <section>
                <h2 className="text-xl font-semibold mb-2">{t("conditions.text5")}</h2>
                <ul className="list-disc pl-6 space-y-1"> 
                <li>{t("conditions.text6")}</li>
                <li>{t("conditions.text7")}</li>
                <li>{t("conditions.text8")}</li>
                </ul>
               
            </section> 
        <div className="w-full h-[1px] bg-gray-300"></div>
        <section>
        <h2 className="text-xl font-semibold mb-2">{t("conditions.text9")}</h2>
        <ul className="list-disc pl-6 space-y-1"> 
            <li>{t("conditions.text10")}</li>
            <li>{t("conditions.text11")}</li>
            </ul>
        </section>


        <div className="w-full h-[1px] bg-gray-300"></div>


            <section>
                <h2 className="text-xl font-semibold mb-2">{t("conditions.rules")}</h2>
                <ul className="list-disc pl-6 space-y-1">
                    <li>{t("conditions.text12")}</li>
                    <li>{t("conditions.text13")}</li>
                    <li>{t("conditions.text14")}</li>
                    <li>{t("conditions.text15")} </li>
                </ul>
            </section>


    
        </div>
</div>
);
}