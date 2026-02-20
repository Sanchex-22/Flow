export type Kpi = { count: number; change: number };
export type InventoryCategory = { name: string; count: number };
export type RecentActivity = { type: string; description: string; date: string; icon: string };

export type DashboardData = {
    kpi: {
        totalEquipments: Kpi;
        pendingMaintenances: Kpi;
        activeEquipments: Kpi;
        activeUsers: Kpi;
    };
    inventoryByCategory: InventoryCategory[];
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