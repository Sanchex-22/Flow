
import Headers from "../meta/headers";
import { UserProfile } from "../../context/userProfileContext";
import Footer from "./footer";
import Navbar from "./navbar";
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/react"
import { Toaster } from "sonner"
import SlideBar, { Company } from "./slideBar";
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
  companies?: Company[];
}

const EnvolveLayout: React.FC<childLayoutProps> = ({
  title,
  description,
  isLogged,
  profile,
  currentPathname,
  children,
  publicRoute,
  companies,
}) => {


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
        currentPathname={currentPathname
          isLogged={isLogged}
          profile={profile}/> */}
          <SlideBar 
          subroutes={[]}
          currentPathname={currentPathname}
          isLogged={isLogged}
          profile={profile}
          companies={companies}
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
