import DefaultLayout from "@/components/DefaultLayout"

const ProtectedLayout = async({
    children
}:{
    children: React.ReactNode
})=>{

 return(
    <>
     <DefaultLayout>
        {children}
     </DefaultLayout>
    </>
 )
}
export default ProtectedLayout