
import Headers from "../meta/headers";
import { UserProfile } from "../../context/userProfileContext";
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/react"
import { Toaster } from "sonner"
import SlideBar, { Company } from "./slideBar";
// SlideBar's props differ from what this layout passes in some builds/typescript
// Cast to any here to avoid prop-type mismatch errors at the layout boundary.
const SlideBarComponent: any = SlideBar;
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
      <main className="w-full relative min-h-screen overflow-x-hidden">
        <Toaster richColors position="top-right" />
        <Analytics />
        <SpeedInsights />
        {publicRoute ? 
        <>
          <div id="page-content" className="z-10 bg-gray-900 text-white min-h-screen ">
            {children}
          </div>
        </>
        :
        <div className="min-h-screen bg-gray-900 text-white flex h-[90vh]">

          <SlideBarComponent
            subroutes={[]}
            currentPathname={currentPathname}
            isLogged={isLogged}
            profile={profile}
            companies={companies}
          />
          <div id="page-content" className="z-10 overflow-y-auto w-full ">
            {children}
          </div>
        </div>
        }
      </main>
      {/* {publicRoute ? <Footer/>:<></>} */}
    </>
  );
};

export default EnvolveLayout;
