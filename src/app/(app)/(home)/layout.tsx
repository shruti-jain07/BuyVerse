import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { Category } from '@/payload-types';
import { Navbar } from "./navbar";
import { Footer } from "./footer";
import { SearchFilters } from "./search-filters";
interface Props{
    children:React.ReactNode
}
const Layout = async({children}:Props) => {
  const payload = await getPayload({
        config: configPromise,
      })
  const data = await payload.find({
    collection: 'categories',
    depth:1,//subcategories count
    pagination:false,
    where:{
      parent:{
        exists:false,
      },
    },
  });
  const formattedData=data.docs.map((doc)=>({
    ...doc,
    subcategories:(doc.subcategories?.docs ?? []).map((doc)=>({
      //since i setted up depth:1 so it will 100% be a type of category so ...doc as category is ok to use
      ...doc as Category,
     subcategories:undefined,
    }))
  }));
  console.log({
    data,
    formattedData,
})
  return (
    <div className="flex flex-col min-h-screen">
        <Navbar/>
        <SearchFilters data={formattedData}/>
        <div className="flex-1 bg-[#FFFFFF]">
           {children}
        </div>
     
      <Footer/>
    </div>
  )
}

export default Layout;
