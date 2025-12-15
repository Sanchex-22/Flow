"use client"
import { Building2, LogOut, Mail, ChevronRight } from "lucide-react"
import React from "react"
import useUser from "../../../hook/useUser"
import { useCompany } from "../../../context/routerContext"
import { UserProfile } from "../../../context/userProfileContext"
import Images from "../../../assets"

type Props = {
  profile: UserProfile | null;
};

const CompanySelector: React.FC<Props> = ({profile}) => {
    const { selectedCompany, handleCompanyChange, companies } = useCompany();
    const { logout } = useUser();

    const handleSelectCompany = (companyCode: string) => {
        handleCompanyChange({ target: { value: companyCode } } as any);
        window.location.href = `/${companyCode}/dashboard/all`;
    };

    if (companies.length === 0) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <div className="w-full max-w-md space-y-6">
                    <div className="text-center">
                        <div className="flex justify-center mb-4">
                            <div className="bg-muted rounded-full p-4">
                                <Building2 className="h-12 w-12 text-muted-foreground" />
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold text-foreground">Sin Acceso a Empresas</h1>
                        <p className="text-muted-foreground mt-2">
                            Hola <span className="font-medium">{profile?.username}</span>, actualmente no tienes acceso a ninguna empresa.
                        </p>
                    </div>

                    <div className="bg-card border border-border rounded-lg shadow-sm">
                        <div className="p-6 text-center">
                            <h2 className="text-xl font-semibold text-card-foreground mb-2">Contactar Soporte</h2>
                            <p className="text-muted-foreground mb-4">
                                Para obtener acceso a una empresa, por favor contacta a nuestro equipo de soporte.
                            </p>
                        </div>
                        <div className="p-6 pt-0 space-y-4">
                            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                                <Mail className="h-5 w-5 text-primary" />
                                <div>
                                    <p className="font-medium text-card-foreground">Email de Soporte</p>
                                    <p className="text-sm text-muted-foreground">soporte@empresa.com</p>
                                </div>
                            </div>

                            <button
                                onClick={logout}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-border bg-transparent rounded-md text-foreground hover:bg-muted transition-colors"
                            >
                                <LogOut className="h-4 w-4" />
                                Cerrar Sesión
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-md space-y-6">
                {/* Header */}
                <div className="text-center space-y-2 justify-center items-center flex flex-col">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center">
                        <img src={Images.logo || "/placeholder.svg"} alt="logo" width={100} height={100} className="rounded-lg" />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">Seleccionar Empresa</h1>
                    <p className="text-muted-foreground">
                        Hola <span className="font-medium">{profile?.username}</span>, elige tu empresa
                    </p>
                    <button
                        onClick={() => { logout() }}
                        className="inline-flex items-center gap-2 px-3 py-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <LogOut className="h-4 w-4" />
                        Cerrar Sesión
                    </button>
                </div>

                {/* Companies List estilo WhatsApp */}
                <div className="bg-card border border-border rounded-lg shadow-sm">
                    {companies.map((company) => (
                        <button
                            key={company.id}
                            onClick={() => handleSelectCompany(company.code)}
                            className={`w-full flex items-center justify-between px-4 py-3 hover:bg-muted transition-colors text-left 
                                ${selectedCompany?.code === company.code ? "bg-muted" : ""}`}
                        >
                            <div className="flex items-center gap-3">
                                <Building2 className="h-6 w-6 text-primary" />
                                <div>
                                    <p className="font-medium text-card-foreground">{company.name}</p>
                                    <p className="text-sm text-muted-foreground">{company.code}</p>
                                </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </button>
                    ))}
                </div>

                {/* Footer Info */}
                <div className="text-center text-sm text-muted-foreground">
                    <p>
                        ¿No ves tu empresa?{" "}
                        <a href="#" className="text-primary hover:text-primary/80 underline">
                            Contactar soporte
                        </a>
                    </p>
                </div>
            </div>
        </div>
    )
}

export { CompanySelector };
