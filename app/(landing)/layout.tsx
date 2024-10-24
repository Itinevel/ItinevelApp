"use client"

import { Children } from "react"

const LandingLayout = async({
    children,
}:{children:React.ReactNode})=>{
return(
    <div className=" flex items-center justify-center">
        <div className=" flex items-center ">
            {children}
        </div>

    </div>
)
}
export default LandingLayout