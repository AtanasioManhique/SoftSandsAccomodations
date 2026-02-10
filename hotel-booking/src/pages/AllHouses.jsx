
import { Link } from "react-router-dom";
import Pontahouses from "../componentshouse/PontadeOuro"
import PontaMalongane from "../componentshouse/PontaMalongane"
import Mamolihouses from "../componentshouse/PontaMamoli"
import Bilenehouses from "../componentshouse/PraiadeBilene";
import PraiaTofo from "../componentshouse/PraiaTofo"
import PraiaBarra from "../componentshouse/PraiaBarra"
const AllHouses = () =>{

return(
    
    <div className='mb-50'>
        
    <Pontahouses/>
    <Bilenehouses />
     <PraiaTofo />
    <PontaMalongane />
    <Mamolihouses />
    <PraiaBarra />
    

        
    


    </div>



);


}
export default AllHouses;