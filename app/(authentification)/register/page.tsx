import RegisterPageContent from "./registreComponent"
import React, { Suspense } from 'react';
const RegistreHome = ()=>{
  return(
    <Suspense fallback={<div>Loading...</div>}>
       <RegisterPageContent/>
    </Suspense>
  )
}
export default RegistreHome