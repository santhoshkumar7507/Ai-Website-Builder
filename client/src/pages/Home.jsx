import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Sparkles, Wand2, Zap, ArrowRight, Shield, Rocket, MousePointer2 } from 'lucide-react';

const Home = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#020617] text-white selection:bg-blue-500/30 overflow-x-hidden">
            {/* Mesh Gradient Background */}
            <div className="fixed inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse-slow" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/10 blur-[120px] rounded-full animate-pulse-slow" style={{ animationDelay: '2s' }} />
                <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-purple-600/5 blur-[100px] rounded-full" />
            </div>

            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-2xl font-black tracking-tighter hover:scale-105 transition-transform cursor-pointer">
                        <div className="bg-blue-600 p-1.5 rounded-lg shadow-lg shadow-blue-500/20">
                            <Wand2 className="w-6 h-6 text-white" />
                        </div>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Builder<span className="text-blue-500">AI</span></span>
                    </div>
                    
                    <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-400">
                        <a href="#features" className="hover:text-white transition-colors">Features</a>
                        <a href="#workflow" className="hover:text-white transition-colors">Workflow</a>
                        <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
                    </div>

                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => navigate('/login')} 
                            className="px-5 py-2.5 text-sm font-bold text-slate-300 hover:text-white transition-colors"
                        >
                            Sign In
                        </button>
                        <button 
                            onClick={() => navigate('/register')} 
                            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-500 hover:scale-105 transition-all shadow-xl shadow-blue-500/20 active:scale-95"
                        >
                            Get Started
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="relative z-10 pt-44 pb-32 px-6">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-black uppercase tracking-[0.2em] mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <Sparkles className="w-3.5 h-3.5 fill-blue-400" />
                        Next-Gen Website Engine
                    </div>

                    <h1 className="text-6xl md:text-[7.5rem] font-black tracking-tight leading-[0.8] mb-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        Design the <br />
                        <span className="text-gradient">Future.</span>
                    </h1>

                    <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-400 mb-12 leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-1000">
                        Stop dreaming about it. Type it. Our neural engine transforms your ideas into professional, high-converting landing pages in seconds.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-16 duration-1000">
                        <button
                            onClick={() => navigate('/register')}
                            className="group flex items-center gap-3 px-10 py-5 bg-white text-black font-black text-lg rounded-2xl hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.15)] active:scale-95"
                        >
                            Create Your Site
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button className="px-10 py-5 bg-white/5 border border-white/10 text-white font-black text-lg rounded-2xl hover:bg-white/10 transition-all flex items-center gap-3 active:scale-95">
                            Watch Demo <Zap className="w-5 h-5 text-blue-500 fill-blue-500" />
                        </button>
                    </div>

                    {/* Preview Image Placeholder / Mockup */}
                    <div className="mt-24 relative p-2 bg-white/5 border border-white/10 rounded-[2.5rem] shadow-2xl animate-in fade-in slide-in-from-bottom-24 duration-1000">
                        <div className="bg-[#020617] rounded-[2rem] overflow-hidden aspect-video border border-white/5">
                           <div className="w-full h-full bg-[radial-gradient(circle_at_top,_#1e293b_0%,_transparent_100%)] flex items-center justify-center">
                                <div className="text-center">
                                    <div className="flex justify-center gap-4 mb-8">
                                        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center animate-bounce" style={{ animationDuration: '3s' }}>
                                            <MousePointer2 className="w-6 h-6 text-blue-500" />
                                        </div>
                                    </div>
                                    <p className="text-slate-500 font-mono text-sm tracking-widest uppercase">Intelligent Editor Preview</p>
                                </div>
                           </div>
                        </div>
                        {/* Decorative elements */}
                        <div className="absolute -top-12 -left-12 w-64 h-64 bg-blue-600/20 blur-[100px] rounded-full -z-10" />
                        <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-indigo-600/20 blur-[100px] rounded-full -z-10" />
                    </div>
                </div>
            </main>

            {/* Features Section */}
            <section id="features" className="relative z-10 py-32 border-t border-white/5 bg-slate-950/50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { 
                                icon: Sparkles, 
                                title: 'AI-Powered Copy', 
                                desc: 'Dynamic sales copy that resonates with your audience, generated instantly from your business goals.',
                                color: 'blue'
                            },
                            { 
                                icon: Shield, 
                                title: 'Clean Architecture', 
                                desc: 'Generated code follows best practices, using pure Tailwind CSS for lightweight, lightning-fast performance.',
                                color: 'indigo'
                            },
                            { 
                                icon: Rocket, 
                                title: 'Instant Deployment', 
                                desc: 'One-click export. Download your ready-to-use HTML and launch your business empire in minutes.',
                                color: 'purple'
                            }
                        ].map((f, i) => (
                            <div key={i} className="group p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:border-blue-500/30 transition-all duration-500">
                                <div className={`w-14 h-14 rounded-2xl bg-${f.color}-600/10 border border-${f.color}-500/20 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-${f.color}-600 transition-all duration-500`}>
                                    <f.icon className="w-6 h-6 group-hover:text-white transition-colors" />
                                </div>
                                <h3 className="text-2xl font-black mb-4 tracking-tight">{f.title}</h3>
                                <p className="text-slate-400 leading-relaxed font-medium">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 py-20 border-t border-white/5 glass">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-10">
                    <div className="flex items-center gap-2 text-xl font-black tracking-tighter">
                        <div className="bg-blue-600 p-1 rounded-lg">
                            <Wand2 className="w-4 h-4 text-white" />
                        </div>
                        <span>Builder<span className="text-blue-500">AI</span></span>
                    </div>
                    <p className="text-slate-500 text-sm font-medium">© 2026 BuilderAI. All rights reserved. Powered by Advanced Agentic Intelligence.</p>
                </div>
            </footer>
        </div>
    );
};

export default Home;
