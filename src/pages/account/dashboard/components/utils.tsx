export type Kpi = { count: number; change: number };
export type InventoryCategory = { name: string; count: number };
export type RecentActivity = { type: string; description: string; date: string; icon: string };

export interface SoftwareExpense {
    name: string;
    category: string;
    annualCost: number;
    monthlyCost: number;
    numberOfUsers: number;
    costPerUser: number;
    status: string;
    renewalDate: string;
    assignedPersons: number;
}

export interface SoftwareExpensesData {
    totalAnnualCost: number;
    totalMonthlyCost: number;
    totalSoftware: number;
    activeSoftware: number;
    expiringSoon: number;
    topExpenses: SoftwareExpense[];
    byCategory: { name: string; cost: number }[];
}

export interface PersonsData {
    total: number;
    withEquipment: number;
    withoutEquipment: number;
}

export type DashboardData = {
    kpi: {
        totalEquipments: Kpi;
        pendingMaintenances: Kpi;
        activeEquipments: Kpi;
        activeUsers: Kpi;
    };
    persons: PersonsData;
    inventoryByCategory: InventoryCategory[];
    softwareExpenses: SoftwareExpensesData;
    recentActivity: RecentActivity[];
};

export interface Insight {
    type: 'summary' | 'alert' | 'recommendation' | 'optimization';
    title: string;
    content: string;
    priority: 'high' | 'medium' | 'low';
    icon: string;
}

export interface ChatMessage {
    role: "user" | "assistant";
    content: string;
}

// utils.ts
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

// utils.ts
export const insightConfig = {
    summary:        { border: "border-blue-500",   bg: "bg-blue-500/10",   text: "text-blue-400"   },
    alert:          { border: "border-red-500",    bg: "bg-red-500/10",    text: "text-red-400"    },
    recommendation: { border: "border-yellow-500", bg: "bg-yellow-500/10", text: "text-yellow-400" },
    optimization:   { border: "border-green-500",  bg: "bg-green-500/10",  text: "text-green-400"  },
};