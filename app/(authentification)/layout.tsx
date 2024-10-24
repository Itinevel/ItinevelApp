import DefaultLayout from "@/components/DefaultLayout"

const AuthLayout = async({
    children
}:{
    children: React.ReactNode
})=>{

 return(
    <>
     <DefaultLayout>
        <div className="">
          {children}
        </div>
     </DefaultLayout>
    </>
 )
}
export default AuthLayout