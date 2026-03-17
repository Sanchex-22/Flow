import { useState } from "react";
import LoginForm from "../../components/forms/loginForm";
import Images from "../../assets";
import { useTranslation } from "react-i18next";
import { Shield, Cpu, Activity, Lock } from "lucide-react";

const appName = import.meta.env.VITE_APP_NAME || "Flow IT";

const features = [
  { icon: Shield, label: "Security", desc: "Role-based access control" },
  { icon: Cpu, label: "Devices", desc: "Full IT asset management" },
  { icon: Activity, label: "Monitoring", desc: "Real-time dashboards" },
  { icon: Lock, label: "Compliance", desc: "Audit logs & reports" },
];

export default function LoginPage() {
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-[#1d1d1f] flex overflow-hidden">

      {/* ── Left panel: branding ── */}
      <div className="hidden lg:flex flex-1 relative flex-col justify-between p-12 overflow-hidden">
        {/* Ambient glow blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-600/20 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-600/20 blur-[100px]" />
        </div>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10">
            <img src={Images?.logo} alt="logo" className="w-6 h-6 object-contain" />
          </div>
          <span className="text-white font-semibold text-lg tracking-tight">{appName}</span>
        </div>

        {/* Hero text */}
        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="text-5xl font-bold text-white leading-tight tracking-tight mb-4">
              {t("login.heroTitle")}
            </h1>
            <p className="text-[#86868b] text-xl leading-relaxed max-w-sm">
              {t("login.heroSubtitle")}
            </p>
          </div>

          {/* Feature pills */}
          <div className="grid grid-cols-2 gap-3 max-w-sm">
            {features.map(({ icon: Icon, label, desc }) => (
              <div
                key={label}
                className="flex items-start gap-3 p-4 rounded-2xl bg-white/[0.04] backdrop-blur-sm border border-white/[0.08] hover:bg-white/[0.07] transition-colors"
              >
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{label}</p>
                  <p className="text-[#86868b] text-xs leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-[#6e6e73] text-xs">
            © {new Date().getFullYear()} {appName}. All rights reserved.
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="hidden lg:block w-px bg-white/[0.08]" />

      {/* ── Right panel: form ── */}
      <div className="flex-1 lg:max-w-[480px] flex flex-col items-center justify-center p-8 relative bg-[#161617]">

        <div className="w-full max-w-sm space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10">
              <img src={Images?.logo} alt="logo" className="w-7 h-7 object-contain" />
            </div>
            <span className="text-white font-semibold text-xl">{appName}</span>
          </div>

          {/* Heading */}
          <div className="space-y-1.5">
            <h2 className="text-2xl font-bold text-white tracking-tight">{t("login.title")}</h2>
            <p className="text-[#86868b] text-sm">{t("login.subtitle")}</p>
          </div>

          {/* Form — dark variant */}
          <LoginForm
            pending={pending}
            setPending={setPending}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            error={error}
            setError={setError}
            dark
          />
        </div>
      </div>
    </div>
  );
}
