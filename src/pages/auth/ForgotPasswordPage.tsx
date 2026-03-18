import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Mail, KeyRound, Eye, EyeOff, CheckCircle } from "lucide-react";
import appConfig from "../../utils/appConfig";
import { useAppLogo } from "../../utils/useAppLogo";

const { VITE_API_URL } = import.meta.env;

type Step = "email" | "code" | "done";

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await fetch(`${VITE_API_URL}/api/user/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      // Always move to code step (don't reveal if email exists)
      setStep("code");
    } catch {
      setError(t("forgot.errorSend"));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !newPassword.trim()) return;
    if (newPassword.length < 8) {
      setError(t("forgot.passwordTooShort"));
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${VITE_API_URL}/api/user/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || t("forgot.errorReset"));
      }
      setStep("done");
    } catch (err: any) {
      setError(err.message || t("forgot.errorReset"));
    } finally {
      setLoading(false);
    }
  };

  const logoSrc = useAppLogo();
  const appName = appConfig.name;

  return (
    <div className="min-h-screen bg-[#1c1c1e] flex items-center justify-center relative overflow-hidden">
      {/* Bottom waves */}
      <div className="absolute bottom-0 left-0 w-1/2 h-40 bg-white" style={{ clipPath: "polygon(0 40%, 100% 0%, 100% 100%, 0 100%)" }} />
      <div className="absolute bottom-0 right-0 w-1/2 h-40 bg-white" style={{ clipPath: "polygon(0 0%, 100% 40%, 100% 100%, 0 100%)" }} />

      <div className="relative z-10 w-full max-w-md px-4">
        <div className="bg-white rounded-2xl p-8 md:p-10 shadow-2xl">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-purple-200">
              <img src={Images?.logo} alt="logo" className="select-none w-8 h-8" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">{appName}</h1>
          </div>

          {/* STEP: done */}
          {step === "done" && (
            <div className="text-center space-y-4">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
              <h2 className="text-2xl font-semibold text-gray-900">{t("forgot.successTitle")}</h2>
              <p className="text-gray-500 text-sm">{t("forgot.successDesc")}</p>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition"
              >
                {t("forgot.backToLogin")}
              </Link>
            </div>
          )}

          {/* STEP: email */}
          {step === "email" && (
            <>
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <Mail className="w-5 h-5 text-purple-600" />
                  <h2 className="text-2xl font-semibold text-gray-900">{t("forgot.title")}</h2>
                </div>
                <p className="text-gray-500 text-sm">{t("forgot.subtitle")}</p>
              </div>

              <form onSubmit={handleSendCode} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t("login.email")}</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full px-4 py-3 bg-gray-100 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:bg-gray-200 transition"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-semibold py-3 rounded-lg transition"
                >
                  {loading ? t("forgot.sending") : t("forgot.sendCode")}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link to="/login" className="inline-flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700">
                  <ArrowLeft className="w-4 h-4" />
                  {t("forgot.backToLogin")}
                </Link>
              </div>
            </>
          )}

          {/* STEP: code */}
          {step === "code" && (
            <>
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <KeyRound className="w-5 h-5 text-purple-600" />
                  <h2 className="text-2xl font-semibold text-gray-900">{t("forgot.enterCodeTitle")}</h2>
                </div>
                <p className="text-gray-500 text-sm">{t("forgot.enterCodeDesc")} <strong>{email}</strong></p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t("forgot.code")}</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="ABC123"
                    maxLength={6}
                    className="w-full px-4 py-3 bg-gray-100 rounded-lg text-gray-900 font-mono text-center text-xl tracking-widest placeholder-gray-400 focus:outline-none focus:bg-gray-200 transition uppercase"
                  />
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t("forgot.newPassword")}</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={t("forgot.newPasswordPlaceholder")}
                    className="w-full px-4 py-3 bg-gray-100 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:bg-gray-200 transition pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-9 text-purple-600 hover:text-purple-700 transition"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-semibold py-3 rounded-lg transition"
                >
                  {loading ? t("forgot.resetting") : t("forgot.resetPassword")}
                </button>
              </form>

              <div className="mt-4 text-center">
                <button
                  onClick={() => { setStep("email"); setError(null); }}
                  className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t("forgot.changeEmail")}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
