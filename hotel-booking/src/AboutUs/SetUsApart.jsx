import {useTranslation} from "react-i18next"
const SetUsApart = () =>{
 const {t} = useTranslation();

    return(


        <section className="bg-gray py-5 px-6 md:px-20 flex justify-center">
      <div className="max-w-4xl mx-auto">
        {/* TÍTULO */}
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-5">
          {t("apart.title")}
        </h2>

        {/* LISTA DE DIFERENCIAIS */}
        <div className="space-y-8">
          {/* 1 */}
          <div>
            <h3 className="text-[#0099a8] text-lg sm:text-xl font-semibold mb-1">
              1. {t("apart.personalized")}
            </h3>
            <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
              {t("apart.personalizedinfo")}
            </p>
          </div>

          {/* 2 */}
          <div>
            <h3 className="text-[#0099a8] text-lg sm:text-xl font-semibold mb-1">
              2. {t("apart.details")}
            </h3>
            <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
              {t("apart.detailsinfo")}
            </p>
          </div>

          {/* 3 */}
          <div>
            <h3 className="text-[#0099a8] text-lg sm:text-xl font-semibold mb-1">
              3. {t("apart.cozy")}
            </h3>
            <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
              {t("apart.cozyinfo")}
            </p>
          </div>

          {/* 4 */}
          <div>
            <h3 className="text-[#0099a8] text-lg sm:text-xl font-semibold mb-1">
              4. {t("apart.digitalpayment")}
            </h3>
            <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
              {t("apart.digitalpaymentinfo")}
              dinheiro.
            </p>
          </div>
        </div>
      </div>
    </section>


    );
}
export default SetUsApart;