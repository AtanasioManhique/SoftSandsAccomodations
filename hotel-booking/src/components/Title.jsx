
const Title = ({title, subTitle, font, align}) => {

    return(

        <div className={`flex flex-col justift-center items-center text-center ${align==="left" && "md:items-start md:text-left"} `}>
            <h1 className={`text-4xl md:text-[40px] ${font || "font-playfair"}`}>{title}</h1>
            <p className={'text-xl md:text-xl text-gray-600/90 mt-2 max-2-174 '}>{subTitle}</p>
        </div>

    );

}
export default Title;