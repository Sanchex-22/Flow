import React from "react";

const ActivityIcon: React.FC<{ icon: string }> = ({ icon }) => {
    const base = "w-6 h-6 rounded-full flex items-center justify-center mt-0.5";
    switch (icon) {
        case "plus":
            return (
                <div className={`${base} bg-blue-500`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                </div>
            );
        case "user":
            return (
                <div className={`${base} bg-purple-500`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                    </svg>
                </div>
            );
        default:
            return (
                <div className={`${base} bg-gray-500`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
                        <circle cx="12" cy="12" r="10" />
                    </svg>
                </div>
            );
    }
};

export default ActivityIcon;