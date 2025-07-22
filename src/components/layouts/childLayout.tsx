
import Headers from "../meta/headers";
import { UserProfile } from "../../context/userProfileContext";
import AdminNavbar from "./adminNavbar";
import Footer from "./footer";
import Navbar from "./navbar";
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/react"
import { Toaster } from "sonner"
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

  return (

    <>
      <Headers title={title} description={description} />
      <main className="w-full relative min-h-screen bg-slate-50 overflow-x-hidden">
        {publicRoute ? 
        <>
        <Navbar
          profile={profile}
          currentPathname={currentPathname}
          isLogged={isLogged}
        />
        </>
        :
        <AdminNavbar 
        currentPathname={currentPathname}
          isLogged={isLogged}
          profile={profile}/>
        }
        <div id="page-content" className="z-10">
          {children}
          <Toaster richColors position="top-right" />
          <Analytics />
          <SpeedInsights />
        </div>
      </main>
      {publicRoute ? <Footer/>:<></>}
    </>
  );
};

export default EnvolveLayout;
