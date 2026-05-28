"use client";

import { useState } from 'react';
import { Send, Bot, User, Paperclip, Settings2, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

import { useChat } from 'ai/react';

export default function ChatPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    initialMessages: [
      { id: '1', role: 'assistant', content: 'Hello! I am protected by **TokenShield AI**. I can assist you with your tasks while ensuring security and compliance.\n\nHere is an example of a secure payload:\n```json\n{\n  "status": "secure",\n  "encryption": "AES-256",\n  "version": "1.0.0"\n}\n```\n\nHow can I help you today?' }
    ]
  });

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      // To submit via useChat when using a textarea without a form, you can create a synthetic event or just call handleSubmit
      const fakeEvent = { preventDefault: () => {} } as React.FormEvent<HTMLFormElement>;
      handleSubmit(fakeEvent);
    }
  };

  return (
    <main className="h-screen flex flex-col relative overflow-hidden bg-[#0f172a]">
      {/* Header */}
      <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-black/20 backdrop-blur-md relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-blue-500/10 border border-blue-500/20">
            <Sparkles className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h1 className="font-semibold text-white text-sm">Secure AI Assistant</h1>
            <p className="text-xs text-slate-400">Claude 3 Opus • 128k Context</p>
          </div>
        </div>
        <button className="p-2 rounded hover:bg-white/5 text-slate-400 transition">
          <Settings2 className="w-5 h-5" />
        </button>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth relative z-10">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-4 max-w-4xl mx-auto ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-indigo-600' : 'bg-slate-800 border border-white/10'}`}>
              {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-blue-400" />}
            </div>
            <div className={`px-5 py-3.5 rounded-2xl max-w-[80%] shadow-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-sm' : 'glass-card text-slate-200 rounded-tl-sm'} ${msg.role === 'assistant' ? 'w-full' : ''}`}>
              <div className="text-sm leading-relaxed whitespace-pre-wrap max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ node, inline, className, children, ...props }: any) {
                      const match = /language-(\w+)/.exec(className || '');
                      return !inline && match ? (
                        <div className="rounded-md overflow-hidden my-4 border border-white/10 bg-[#0f172a]">
                          <div className="bg-[#1e293b] px-4 py-1.5 text-xs text-slate-400 border-b border-white/5 font-mono flex justify-between items-center">
                            <span>{match[1]}</span>
                          </div>
                          <SyntaxHighlighter
                            {...props}
                            style={vscDarkPlus as any}
                            language={match[1]}
                            PreTag="div"
                            customStyle={{ margin: 0, background: 'transparent', padding: '1rem' }}
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        </div>
                      ) : (
                        <code {...props} className={`${className} bg-white/10 rounded px-1.5 py-0.5 text-[0.85em]`}>
                          {children}
                        </code>
                      );
                    },
                    p({ children }) {
                      return <p className="mb-2 last:mb-0">{children}</p>;
                    },
                    ul({ children }) {
                      return <ul className="list-disc pl-5 mb-2 space-y-1">{children}</ul>;
                    },
                    ol({ children }) {
                      return <ol className="list-decimal pl-5 mb-2 space-y-1">{children}</ol>;
                    },
                    li({ children }) {
                      return <li className="">{children}</li>;
                    },
                    a({ children, href }) {
                      return <a href={href} className="text-blue-400 hover:underline" target="_blank" rel="noreferrer">{children}</a>;
                    },
                    h1({ children }) {
                      return <h1 className="text-xl font-bold mt-4 mb-2">{children}</h1>;
                    },
                    h2({ children }) {
                      return <h2 className="text-lg font-bold mt-4 mb-2">{children}</h2>;
                    },
                    h3({ children }) {
                      return <h3 className="text-md font-bold mt-3 mb-2">{children}</h3>;
                    }
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-4 max-w-4xl mx-auto">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-blue-400" />
            </div>
            <div className="glass-card px-5 py-4 rounded-2xl rounded-tl-sm flex gap-1 items-center">
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-6 bg-gradient-to-t from-[#0f172a] to-transparent relative z-10">
        <div className="max-w-4xl mx-auto relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
          <form onSubmit={handleSubmit} className="relative flex items-end gap-2 bg-[#1e293b] border border-white/10 p-3 rounded-xl shadow-2xl">
            <button type="button" className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition mb-0.5">
              <Paperclip className="w-5 h-5" />
            </button>
            <textarea 
              value={input}
              onChange={handleInputChange}
              onKeyDown={onKeyDown}
              placeholder="Message Secure AI..."
              className="flex-1 bg-transparent text-white placeholder-slate-500 resize-none max-h-32 min-h-[40px] focus:outline-none py-2 text-sm"
              rows={1}
            />
            <button 
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white rounded-lg shadow-[0_0_15px_rgba(37,99,235,0.3)] transition mb-0.5"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="text-center mt-2">
            <p className="text-[10px] text-slate-500 font-medium tracking-wide">
              Protected by TokenShield Anomaly Detection Engine
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
