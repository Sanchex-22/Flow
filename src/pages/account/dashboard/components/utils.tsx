export const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 60) return `Hace ${diffInSeconds} segundos`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} minutos`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Hace ${diffInHours} horas`;
    return `Hace ${Math.floor(diffInHours / 24)} días`;
};

export const insightConfig = {
    summary:        { border: "border-blue-500",   bg: "bg-blue-500/10",   text: "text-blue-400"   },
    alert:          { border: "border-red-500",    bg: "bg-red-500/10",    text: "text-red-400"    },
    recommendation: { border: "border-yellow-500", bg: "bg-yellow-500/10", text: "text-yellow-400" },
    optimization:   { border: "border-green-500",  bg: "bg-green-500/10",  text: "text-green-400"  },
};