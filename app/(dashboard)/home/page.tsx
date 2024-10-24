import { redirect } from "next/navigation"
import HeaderHome from "./_component/headerhome"
import FooterPage from "./_component/footer"
import ContentPage from "./_component/content"

const SellerUserPage = ()=>{
    const role = "Seller"
    if(role !== "Seller"){
        redirect('/')
    }
    return(
        <div className="w-full scrollbar-thin scrollbar-thumb-rounded-full scrollbar-thumb-blue-500 scrollbar-track-gray-200 h-screen bg-gray-100 flex flex-col items-center font-amifer overflow-x-hidden">
            <HeaderHome/>
            <ContentPage/>
            <FooterPage/>
        </div>
    )
}
export default SellerUserPage