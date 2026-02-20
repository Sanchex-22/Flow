import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Send, X, Bot } from "lucide-react";
import { DashboardData } from "./allDashboard";
import { ChatMessage } from "./types";

const { VITE_API_URL } = import.meta.env;

interface Props {
    dashboardData: DashboardData;
    companyName: string;
    isDarkMode: boolean;
}

const AiChatAssistant: React.FC<Props> = ({ dashboardData, companyName, isDarkMode }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const systemPrompt = `Eres un asistente experto en TI para ${companyName}. Datos actuales:
📊 KPIs:
- Total Equipos: ${dashboardData.kpi.totalEquipments.count} (${dashboardData.kpi.totalEquipments.change}%)
- Mantenimientos Pendientes: ${dashboardData.kpi.pendingMaintenances.count}
- Equipos Activos: ${dashboardData.kpi.activeEquipments.count}
- Usuarios Activos: ${dashboardData.kpi.activeUsers.count}
📦 Inventario: ${dashboardData.inventoryByCategory.map((c) => `${c.name}: ${c.count}`).join(", ")}
Responde en español, conciso, usa emojis cuando ayude.`;

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;
        const userMsg: ChatMessage = { role: "user", content: input.trim() };
        const updatedMessages = [...messages, userMsg];
        setMessages(updatedMessages);
        setInput("");
        setIsLoading(true);

        try {
            const response = await fetch(`${VITE_API_URL}/api/ai/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: updatedMessages, systemPrompt }),
            });
            if (!response.ok) throw new Error(`Error ${response.status}`);
            const data = await response.json();
            const content = data.choices?.[0]?.message?.content || "No pude generar respuesta.";
            setMessages((prev) => [...prev, { role: "assistant", content }]);
        } catch (error: any) {
            setMessages((prev) => [...prev, { role: "assistant", content: `❌ Error: ${error.message}` }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    };

    const quickPrompts = [
        "¿Qué equipos requieren atención urgente?",
        "Resume el estado del inventario",
        "¿Cómo mejorar el rendimiento?",
    ];

    const aiBubble = isDarkMode ? "bg-gray-700 text-gray-100" : "bg-gray-100 text-gray-800";
    const subText  = isDarkMode ? "text-gray-400" : "text-gray-500";

    return (
        <>
            {/* Botón flotante — se oculta si el panel está abierto */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full shadow-xl transition-all hover:scale-105"
                >
                    <Sparkles size={16} />
                    <span className="text-sm font-medium">Chat AI</span>
                </button>
            )}

            {/* Panel */}
            {isOpen && (
                <div
                    className="fixed bottom-6 right-6 z-50 w-[420px] flex flex-col rounded-2xl shadow-2xl border overflow-hidden"
                    style={{
                        maxHeight: "600px",
                        boxShadow: isDarkMode
                            ? "0 25px 50px rgba(0,0,0,0.6)"
                            : "0 25px 50px rgba(0,0,0,0.15)",
                    }}
                >
                    {/* Header */}
                    <div className={`flex items-center justify-between px-4 py-3 border-b ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                <Sparkles size={13} className="text-white" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold">Asistente AI</p>
                                <p className={`text-xs ${subText}`}>Gemini Flash · Respuesta rápida</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {messages.length > 0 && (
                                <button
                                    onClick={() => setMessages([])}
                                    className={`text-xs px-2 py-1 rounded transition-colors ${isDarkMode ? "text-gray-400 hover:bg-gray-700" : "text-gray-500 hover:bg-gray-100"}`}
                                >
                                    Limpiar
                                </button>
                            )}
                            <button
                                onClick={() => setIsOpen(false)}
                                className={`p-1 rounded transition-colors ${isDarkMode ? "text-gray-400 hover:bg-gray-700" : "text-gray-500 hover:bg-gray-100"}`}
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Mensajes */}
                    <div
                        className={`flex-1 overflow-y-auto p-4 space-y-3 ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}
                        style={{ minHeight: 280, maxHeight: 380 }}
                    >
                        {messages.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full gap-4 py-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                    <Bot size={22} className="text-white" />
                                </div>
                                <p className={`text-sm text-center ${subText}`}>
                                    Consulta cualquier cosa sobre los datos de tu dashboard
                                </p>
                                <div className="flex flex-col gap-2 w-full">
                                    {quickPrompts.map((p, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => { setInput(p); inputRef.current?.focus(); }}
                                            className={`text-left text-xs px-3 py-2 rounded-xl border transition-colors ${isDarkMode ? "border-gray-700 hover:bg-gray-700 text-gray-300" : "border-gray-200 hover:bg-gray-100 text-gray-600"}`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                {msg.role === "assistant" && (
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                                        <Sparkles size={10} className="text-white" />
                                    </div>
                                )}
                                <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${msg.role === "user" ? "bg-blue-600 text-white rounded-br-sm" : `${aiBubble} rounded-bl-sm`}`}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                                    <Sparkles size={10} className="text-white" />
                                </div>
                                <div className={`px-4 py-3 rounded-2xl rounded-bl-sm ${aiBubble}`}>
                                    <div className="flex space-x-1">
                                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className={`p-3 border-t ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                        <div className={`flex items-end gap-2 rounded-xl border px-3 py-2 ${isDarkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-300"}`}>
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Pregunta sobre tus datos..."
                                rows={1}
                                className={`flex-1 resize-none bg-transparent text-sm outline-none max-h-20 ${isDarkMode ? "text-white placeholder-gray-400" : "text-gray-900 placeholder-gray-400"}`}
                            />
                            <button
                                onClick={sendMessage}
                                disabled={!input.trim() || isLoading}
                                className="p-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white disabled:opacity-40 transition-all flex-shrink-0"
                            >
                                <Send size={13} />
                            </button>
                        </div>
                        <p className={`text-center text-xs mt-1.5 ${subText}`}>
                            Enter para enviar · Shift+Enter nueva línea
                        </p>
                    </div>
                </div>
            )}
        </>
    );
};

export default AiChatAssistant;