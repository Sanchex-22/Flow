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