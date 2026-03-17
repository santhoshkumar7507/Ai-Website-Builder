import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, Loader2, Sparkles, Wand2 } from 'lucide-react';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });
            const data = await res.json();
            if (res.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                navigate('/builder');
            } else {
                alert(data.error);
            }
        } catch (err) {
            alert('Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[150px] rounded-full" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[150px] rounded-full" />

            <div className="w-full max-w-lg bg-white/[0.02] backdrop-blur-3xl p-12 rounded-[3rem] border border-white/5 shadow-2xl relative z-10 animate-in fade-in zoom-in duration-700">
                <div className="flex justify-center mb-8">
                    <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-3 rounded-2xl shadow-lg shadow-purple-500/20">
                        <Wand2 className="w-8 h-8 text-white" />
                    </div>
                </div>
                
                <h1 className="text-4xl font-black mb-2 tracking-tighter text-center">Join the Fleet</h1>
                <p className="text-slate-500 mb-10 text-center font-medium">Start building your digital empire today.</p>

                <form onSubmit={handleRegister} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] pl-2">Full Identity</label>
                        <div className="relative group">
                            <UserIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-purple-500 transition-colors" />
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-slate-950/50 border border-white/5 rounded-[1.5rem] py-5 pl-16 pr-8 focus:outline-none focus:ring-2 focus:ring-purple-500/50 font-medium transition-all group-hover:border-white/10"
                                placeholder="Alex Sterling"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] pl-2">Communication Channel</label>
                        <div className="relative group">
                            <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-slate-950/50 border border-white/5 rounded-[1.5rem] py-5 pl-16 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-medium transition-all group-hover:border-white/10"
                                placeholder="name@domain.com"
                                required
                            />
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] pl-2">Security Key</label>
                        <div className="relative group">
                            <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-950/50 border border-white/5 rounded-[1.5rem] py-5 pl-16 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-medium transition-all group-hover:border-white/10"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-black text-lg rounded-[1.5rem] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-purple-500/20 flex items-center justify-center gap-3 mt-4"
                    >
                        {loading ? <Loader2 className="animate-spin w-6 h-6" /> : <>Initialize Account <Sparkles className="w-5 h-5" /></>}
                    </button>
                </form>

                <div className="mt-10 text-center">
                    <p className="text-slate-500 font-medium">
                        Already registered? <Link to="/login" className="text-blue-400 hover:text-blue-300 font-bold underline transition-colors underline-offset-4">Log In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
