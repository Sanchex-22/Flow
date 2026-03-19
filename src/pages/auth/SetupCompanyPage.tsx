import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Building2, CheckCircle, ArrowRight } from "lucide-react";
import appConfig from "../../utils/appConfig";
import { useAppLogo } from "../../utils/useAppLogo";
import useUserProfile from "../../hook/userUserProfile";
import Images from "../../assets";

const { VITE_API_URL } = import.meta.env;

export default function SetupCompanyPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { profile } = useUserProfile();

  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    ruc: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [createdCompany, setCreatedCompany] = useState<{ code: string; name: string } | null>(null);

  const logoSrc = useAppLogo();
  const appName = appConfig.name;

  // Redirect non-super-admin users
  useEffect(() => {
    if (profile && profile.roles !== "SUPER_ADMIN") {
      navigate("/login");
    }
  }, [profile, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    setError(null);

    try {
      const jwt = localStorage.getItem("jwt");
      const res = await fetch(`${VITE_API_URL}/api/companies/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
        },
        body: JSON.stringify({
          ...form,
          createdByUserId: profile?.id,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || t("setup.errorCreate"));
      }

      const company = await res.json();
      setCreatedCompany({ code: company.code, name: company.name });

      // Persist the new company as selected so CompanyProvider picks it up on reload
      localStorage.setItem("selectedCompany", JSON.stringify(company));

      setDone(true);
      // Full reload so SWR re-fetches my-companies with the new association
      setTimeout(() => {
        window.location.href = `/${company.code}/dashboard`;
      }, 1500);
    } catch (err: any) {
      setError(err.message || t("setup.errorCreate"));
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 bg-gray-100 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:bg-gray-200 transition text-sm";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="min-h-screen bg-[#1c1c1e] flex items-center justify-center relative overflow-hidden">
      <div className="absolute bottom-0 left-0 w-1/2 h-40 bg-white" style={{ clipPath: "polygon(0 40%, 100% 0%, 100% 100%, 0 100%)" }} />
      <div className="absolute bottom-0 right-0 w-1/2 h-40 bg-white" style={{ clipPath: "polygon(0 0%, 100% 40%, 100% 100%, 0 100%)" }} />

      <div className="relative z-10 w-full max-w-lg px-4 py-8">
        <div className="bg-white rounded-2xl p-8 md:p-10 shadow-2xl">
          {/* Logo & header */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-purple-200">
              <img src={logoSrc ?? Images?.logo} alt="logo" className="select-none w-8 h-8" />
            </div>
            <p className="text-xs font-semibold text-purple-600 uppercase tracking-widest mb-1">{appName}</p>
          </div>

          {/* Done state */}
          {done && createdCompany ? (
            <div className="text-center space-y-4">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
              <h2 className="text-2xl font-bold text-gray-900">{t("setup.doneTitle")}</h2>
              <p className="text-gray-500 text-sm">
                {t("setup.doneDesc")} <strong>{createdCompany.name}</strong>
              </p>
              <button
                onClick={() => navigate(`/${createdCompany.code}/dashboard`)}
                className="inline-flex items-center justify-center gap-2 w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
              >
                {t("setup.goToDashboard")}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-2">
                <Building2 className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">{t("setup.title")}</h2>
              </div>
              <p className="text-gray-500 text-sm mb-6">{t("setup.subtitle")}</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className={labelClass}>{t("setup.companyName")} *</label>
                  <input
                    required
                    className={inputClass}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder={t("setup.companyNamePlaceholder")}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t("setup.email")}</label>
                    <input
                      type="email"
                      className={inputClass}
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="company@example.com"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t("setup.phone")}</label>
                    <input
                      type="tel"
                      className={inputClass}
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>{t("setup.address")}</label>
                  <input
                    className={inputClass}
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder={t("setup.addressPlaceholder")}
                  />
                </div>

                <div>
                  <label className={labelClass}>{t("setup.ruc")}</label>
                  <input
                    className={inputClass}
                    value={form.ruc}
                    onChange={(e) => setForm({ ...form, ruc: e.target.value })}
                    placeholder="12345678-9-10"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>
                )}

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
                >
                  {saving ? t("setup.creating") : t("setup.createCompany")}
                  {!saving && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
