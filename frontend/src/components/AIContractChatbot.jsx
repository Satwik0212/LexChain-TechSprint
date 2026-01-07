import React, { useState, useRef, useEffect } from 'react';
import { api } from '../services/api';

const AIContractChatbot = ({ contractText }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', text: "Hi! I'm your Legal Assistant. Ask me anything about this contract." }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim() || !contractText) return;

        const question = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: question }]);
        setIsTyping(true);

        try {
            const data = await api.chatContract(contractText, question);
            setMessages(prev => [...prev, {
                role: 'assistant',
                text: data.answer,
                confidence: data.confidence
            }]);
        } catch (err) {
            setMessages(prev => [...prev, { role: 'assistant', text: "Sorry, I couldn't process that request right now.", error: true }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className={`fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4 font-display ${isOpen ? 'w-[350px]' : 'w-auto'}`}>

            {/* Chat Window */}
            {isOpen && (
                <div className="w-full bg-surface-dark border border-border-dark rounded-xl shadow-2xl flex flex-col h-[500px] animate-scale-in overflow-hidden">
                    {/* Header */}
                    <div className="bg-primary/10 p-4 border-b border-border-dark flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">smart_toy</span>
                            <h3 className="text-white font-bold text-sm">Contract Assistant</h3>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-[#0b0f17]">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex flex-col gap-1 max-w-[85%] ${msg.role === 'user' ? 'self-end items-end' : 'self-start items-start'}`}>
                                <div className={`p-3 rounded-lg text-sm leading-relaxed ${msg.role === 'user'
                                        ? 'bg-primary text-white rounded-tr-none'
                                        : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
                                    }`}>
                                    {msg.text}
                                </div>
                                {msg.confidence && (
                                    <span className="text-[10px] text-slate-500 flex items-center gap-1 px-1">
                                        <span className="material-symbols-outlined text-[10px]">verified</span>
                                        {msg.confidence} Confidence
                                    </span>
                                )}
                            </div>
                        ))}
                        {isTyping && (
                            <div className="self-start bg-slate-800 p-3 rounded-lg rounded-tl-none border border-slate-700 flex gap-1">
                                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></span>
                                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-100"></span>
                                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-200"></span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-3 bg-surface-dark border-t border-border-dark flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Ask about this contract..."
                            className="flex-1 bg-black/20 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || isTyping}
                            className="p-2 bg-primary text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <span className="material-symbols-outlined text-[20px]">send</span>
                        </button>
                    </div>

                    {/* Disclaimer */}
                    <div className="px-4 py-2 bg-black/40 text-[10px] text-slate-500 text-center">
                        AI can make mistakes. Check important info.
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="flex items-center gap-2 bg-primary hover:bg-blue-600 text-white px-4 py-3 rounded-full shadow-lg shadow-blue-500/20 transition-all hover:scale-105"
                >
                    <span className="material-symbols-outlined">chat_bubble</span>
                    <span className="font-bold text-sm">Ask AI</span>
                </button>
            )}
        </div>
    );
};

export default AIContractChatbot;
