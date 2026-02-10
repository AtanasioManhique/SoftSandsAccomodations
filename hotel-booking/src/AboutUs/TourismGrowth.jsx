import {useTranslation} from "react-i18next"
const TourismGrowth = () =>{
 const {t} = useTranslation();
return(

         <section className="bg-gray py-5 px-6 md:px-18 flex justify-center">
      <div className="w-full max-w-4xl">
        {/* TÍTULO */}
        <h2 className="text-3xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-6">
          {t("tourism.title")}
        </h2>

        {/* PARÁGRAFO INTRODUTÓRIO */}
        <p className="text-gray-800 text-base sm:text-lg md:text-xl leading-relaxed mb-12">
          {t("tourism.description")}
        </p>

        {/* LISTA DE AÇÕES */}
        <div className="space-y-10">
          {/* 1 */}
          <div>
            <h3 className="text-[#0099a8] text-lg sm:text-xl font-semibold mb-2">
              1. {t("tourism.localcompanys")}
            </h3>
            <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
              {t("tourism.localcompanysinfo")}
            </p>
          </div>

          {/* 2 */}
          <div>
            <h3 className="text-[#0099a8] text-lg sm:text-xl font-semibold mb-2">
              2. {t("tourism.localjob")}
            </h3>
            <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
             {t("tourism.localjobinfo")}
            </p>
          </div>

          {/* 3 */}
          <div>
            <h3 className="text-[#0099a8] text-lg sm:text-xl font-semibold mb-2">
              3. {t("tourism.regional")}
            </h3>
            <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
              {t("tourism.regionalinfo")}
            </p>
          </div>

          {/* 4 */}
          <div>
            <h3 className="text-[#0099a8] text-lg sm:text-xl font-semibold mb-2">
              4. {t("tourism.sustainable")}
            </h3>
            <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
             {t("tourism.sustainableinfo")}
            </p>
          </div>
        </div>
      </div>
    </section>


);


}
export default TourismGrowth;