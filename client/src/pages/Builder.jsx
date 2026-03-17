import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Monitor, Smartphone, Code as CodeIcon, Download, Loader2, Play, Sparkles, Layout, Zap, History, ExternalLink } from 'lucide-react';

const Builder = () => {
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [view, setView] = useState('desktop');
    const [generatedCode, setGeneratedCode] = useState(null);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        if (!token) {
            navigate('/login');
        } else if (userData) {
            setUser(JSON.parse(userData));
        }
    }, [navigate]);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setLoading(true);
        setGeneratedCode(null);

        const token = localStorage.getItem('token');

        try {
            const response = await fetch('http://localhost:5000/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ prompt }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to generate');
            }

            const data = await response.json();
            setGeneratedCode(data.code);
            
            // Update credits if returned
            if (data.credits !== undefined) {
                const updatedUser = { ...user, credits: data.credits };
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));
            }
        } catch (error) {
            console.error(error);
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        if (!generatedCode) {
            alert("No code to export yet!");
            return;
        }
        
        const fullHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated Website</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
    </style>
</head>
<body>
    ${generatedCode}
</body>
</html>`;
        const blob = new Blob([fullHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'website.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleOpenTab = () => {
        if (!generatedCode) {
            alert("No code to open yet!");
            return;
        }
        const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${prompt || 'Generated Website'}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@200;300;400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
    </style>
</head>
<body class="bg-white">
    ${generatedCode}
</body>
</html>`;
        const newWindow = window.open('', '_blank');
        if (newWindow) {
            newWindow.document.write(fullHtml);
            newWindow.document.close();
        } else {
            alert('Please allow popups to view the generated site in full screen.');
        }
    };

    return (
        <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
            {/* Sidebar */}
            <aside className="w-[400px] border-r border-white/5 flex flex-col glass-dark relative z-10">
                <div className="p-8 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/20">
                            <Zap className="w-5 h-5 text-white fill-white" />
                        </div>
                        <span className="font-black text-xl tracking-tight uppercase">AI Engine</span>
                    </div>
                    {user && (
                        <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
                            <span className="text-xs font-bold text-blue-400">{user.credits} Credits</span>
                        </div>
                    )}
                </div>

                <div className="flex-1 p-6 overflow-y-auto space-y-6">
                    <div className="bg-white/5 p-5 rounded-3xl border border-white/10 space-y-3">
                        <div className="flex items-center gap-2 text-blue-400">
                            <Sparkles className="w-4 h-4" />
                            <p className="text-xs font-black uppercase tracking-widest">Inspiration</p>
                        </div>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            Try: "A luxury watch brand landing page with dark aesthetics and gold accents."
                        </p>
                    </div>

                    <div className="space-y-4">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest px-2">Workspace</p>
                        <button onClick={() => { setPrompt(''); setGeneratedCode(null); setView('desktop'); }} className="w-full flex items-center gap-3 p-3 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 hover:bg-blue-600/20 active:scale-95 transition-all">
                            <Layout className="w-5 h-5" />
                            <span className="font-semibold">New Project</span>
                        </button>
                        <button onClick={() => alert('Recent Versions history is coming soon!')} className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 text-slate-400 active:scale-95 transition-all border border-transparent">
                            <History className="w-5 h-5" />
                            <span className="font-semibold">Recent Versions</span>
                        </button>
                    </div>
                </div>

                <div className="p-6 border-t border-white/5 bg-black/20">
                    <div className="relative group">
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Describe your vision..."
                            className="w-full bg-slate-900/50 border border-white/10 rounded-3xl p-5 h-40 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm leading-relaxed placeholder:text-slate-600 group-hover:border-white/20"
                        />
                        <button
                            onClick={handleGenerate}
                            disabled={loading || !prompt}
                            className="absolute bottom-4 right-4 p-4 bg-blue-600 rounded-2xl hover:bg-blue-500 disabled:opacity-50 transition-all shadow-xl shadow-blue-500/20 group/btn"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin w-5 h-5" />
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Send className="w-5 h-5 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                                </div>
                            )}
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Preview Area */}
            <main className="flex-1 flex flex-col bg-[#050505]">
                <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 glass-dark">
                    <div className="flex items-center gap-2 p-1 bg-white/5 rounded-2xl border border-white/10">
                        {[
                            { id: 'desktop', icon: Monitor, label: 'Desktop' },
                            { id: 'mobile', icon: Smartphone, label: 'Mobile' },
                            { id: 'code', icon: CodeIcon, label: 'Code' }
                        ].map((v) => (
                            <button
                                key={v.id}
                                onClick={() => setView(v.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${view === v.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                                title={v.label}
                            >
                                <v.icon className="w-4 h-4" />
                                <span className="text-xs font-bold">{v.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-4">
                        <button onClick={handleOpenTab} className="flex items-center gap-2 px-5 py-2.5 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 active:scale-95 transition-all border border-white/10">
                            <ExternalLink className="w-4 h-4" />
                            <span className="text-sm">Open in Tab</span>
                        </button>
                        <button onClick={handleExport} className="flex items-center gap-2 px-5 py-2.5 bg-white text-black font-bold rounded-xl hover:scale-105 active:scale-95 transition-all shadow-xl">
                            <Download className="w-4 h-4" />
                            <span className="text-sm">Export</span>
                        </button>
                    </div>
                </header>

                <div className="flex-1 p-8 relative overflow-hidden flex items-center justify-center bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat">
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_#3b82f6_1px,_transparent_1px)] [background-size:32px_32px]" />
                    
                    {generatedCode ? (
                        view === 'code' ? (
                            <div className="w-full h-full bg-slate-900 border border-white/10 rounded-3xl p-8 overflow-auto font-mono text-sm text-blue-300 shadow-2xl animate-in fade-in zoom-in duration-500">
                                <pre className="leading-relaxed"><code>{generatedCode}</code></pre>
                            </div>
                        ) : (
                            <div className={`mx-auto bg-white rounded-3xl shadow-[0_0_80px_rgba(59,130,246,0.15)] overflow-hidden transition-all duration-700 border border-white/10 animate-in fade-in slide-in-from-bottom-10 duration-700 ${view === 'mobile' ? 'w-[375px] h-[667px]' : 'w-full h-full'}`}>
                                <iframe
                                    srcDoc={`
                                        <!DOCTYPE html>
                                        <html>
                                            <head>
                                                <script src="https://cdn.tailwindcss.com"></script>
                                                <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
                                                <style>
                                                    body { font-family: 'Plus Jakarta Sans', sans-serif; }
                                                </style>
                                            </head>
                                            <body>
                                                ${generatedCode}
                                            </body>
                                        </html>
                                    `}
                                    title="Site Preview"
                                    className="w-full h-full border-none"
                                />
                            </div>
                        )
                    ) : (
                        <div className="text-center group animate-in fade-in zoom-in duration-1000">
                            <div className="w-24 h-24 mx-auto mb-8 bg-white/5 rounded-full flex items-center justify-center border border-white/10 group-hover:border-blue-500/30 transition-all duration-500 group-hover:scale-110">
                                <Monitor className="w-10 h-10 text-slate-700 group-hover:text-blue-500 transition-colors" />
                            </div>
                            <h2 className="text-3xl font-black text-white tracking-tighter mb-3">Ready to Build?</h2>
                            <p className="text-lg font-medium text-slate-500 max-w-md mx-auto">
                                Type your prompt in the sidebar and watch the magic happen.
                            </p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Builder;
