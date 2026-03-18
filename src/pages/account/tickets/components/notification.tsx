// Notification.tsx
"use client";

import { useEffect, useState } from "react";
import { X, CheckCircle, AlertTriangle, Info } from "lucide-react";

interface NotificationProps {
  message: string;
  type: "success" | "error" | "info";
  onClose: () => void;
  duration?: number;
}

export function Notification({ message, type, onClose, duration = 4000 }: NotificationProps) {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    // Slide in
    const show = setTimeout(() => setVisible(true), 10);

    // Progress bar countdown
    const step = 50;
    const decrement = (step / duration) * 100;
    let current = 100;
    const interval = setInterval(() => {
      current -= decrement;
      setProgress(Math.max(current, 0));
    }, step);

    // Auto dismiss
    const hide = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, duration);

    return () => {
      clearTimeout(show);
      clearTimeout(hide);
      clearInterval(interval);
    };
  }, [duration, onClose]);

  const config = {
    success: {
      icon: CheckCircle,
      bg: "bg-[#1c1c1e] border-green-500/40",
      iconColor: "text-green-400",
      progressColor: "bg-green-500",
      title: "Éxito",
    },
    error: {
      icon: AlertTriangle,
      bg: "bg-[#1c1c1e] border-red-500/40",
      iconColor: "text-red-400",
      progressColor: "bg-red-500",
      title: "Error",
    },
    info: {
      icon: Info,
      bg: "bg-[#1c1c1e] border-blue-500/40",
      iconColor: "text-blue-400",
      progressColor: "bg-blue-500",
      title: "Info",
    },
  };

  const { icon: Icon, bg, iconColor, progressColor, title } = config[type];

  return (
    <div
      className={`
        fixed bottom-4 right-4 z-[9999] w-[calc(100vw-2rem)] max-w-sm
        border rounded-xl shadow-2xl overflow-hidden
        transition-all duration-300 ease-out
        ${bg}
        ${visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}
      `}
    >
      {/* Content */}
      <div className="flex items-start gap-3 p-4">
        <div className={`mt-0.5 flex-shrink-0 ${iconColor}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white">{title}</p>
          <p className="text-sm text-white/70 mt-0.5 leading-relaxed">{message}</p>
        </div>
        <button
          onClick={() => {
            setVisible(false);
            setTimeout(onClose, 300);
          }}
          className="flex-shrink-0 p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 bg-white/10">
        <div
          className={`h-full ${progressColor} transition-none`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
