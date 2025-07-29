
import Headers from "../meta/headers";
import { UserProfile } from "../../context/userProfileContext";
import AdminNavbar from "./adminNavbar";
import Footer from "./footer";
import Navbar from "./navbar";
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/react"
import { Toaster } from "sonner"
import SlideBar from "./slideBar";
interface CurrentPathname {
  name: string;
}

interface childLayoutProps {
  title: string;
  description: string;
  isLogged: boolean;
  profile: UserProfile | null;
  currentPathname: CurrentPathname;
  children: React.ReactNode;
  publicRoute: boolean;
}

const EnvolveLayout: React.FC<childLayoutProps> = ({
  title,
  description,
  isLogged,
  profile,
  currentPathname,
  children,
  publicRoute,
}) => {

  const myCompanies = [
  {
    "id": "8f043ca8-f4f3-44de-be0f-62dee31375ae",
    "code": "CO001",
    "name": "Intermaritime Solutions S.A.",
    "address": "Calle 50, Ciudad de Panamá, Panamá",
    "phone": "+507 263-1234",
    "email": "info@intermaritime.org",
    "isActive": true,
    "createdAt": "2025-07-29T16:02:31.603Z",
    "updatedAt": "2025-07-29T16:02:31.603Z",
    "createdByUserId": "23f807cd-82c1-4751-8a60-e7c2ccaa4067",
    "_count": {
      "users": 1,
      "equipments": 0,
      "licenses": 0,
      "documents": 0,
      "maintenances": 0
    }
  },
];

  return (

    <>
      <Headers title={title} description={description} />
      <main className="w-full relative min-h-screen bg-slate-50 overflow-x-hidden">
        <Toaster richColors position="top-right" />
        <Analytics />
        <SpeedInsights />
        {publicRoute ? 
        <>
        <Navbar
          profile={profile}
          currentPathname={currentPathname}
          isLogged={isLogged}
        />
        <div id="page-content" className="z-10">
            {children}
          </div>
        </>
        :
        <div className="min-h-screen bg-gray-900 text-white flex h-[90vh]">
        {/* <AdminNavbar 
        currentPathname={currentPathname}
          isLogged={isLogged}
          profile={profile}/> */}
          <SlideBar 
          subroutes={[]}
          currentPathname={currentPathname}
          isLogged={isLogged}
          profile={profile}
          companies={myCompanies}
          >
          </SlideBar>
          <div id="page-content" className="z-10 overflow-y-auto w-full">
            {children}
          </div>
        </div>
        }
      </main>
      {publicRoute ? <Footer/>:<></>}
    </>
  );
};

export default EnvolveLayout;
