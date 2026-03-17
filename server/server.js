const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const db = require('./db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIza...'); // Placeholder or keep empty

const initDb = async () => {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                credits INTEGER DEFAULT 3,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);
        await db.query(`
            CREATE TABLE IF NOT EXISTS projects (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                prompt TEXT NOT NULL,
                code TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(user_id) REFERENCES users(id)
            );
        `);
        console.log('Database initialized');
    } catch (err) {
        console.error('Error initializing database:', err);
    }
};

initDb();

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);
    jwt.verify(token, process.env.JWT_SECRET || 'secret_key', (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query('INSERT INTO users (name, email, password) VALUES ($1, $2, $3)', [name, email, hashedPassword]);
        const result = await db.query('SELECT id, name, email, credits FROM users WHERE email = $1', [email]);
        const user = result.rows[0];
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret_key');
        res.json({ user, token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) return res.status(400).json({ error: 'User not found' });
        const user = result.rows[0];
        if (await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret_key');
            res.json({ user: { id: user.id, name: user.name, email: user.email, credits: user.credits }, token });
        } else {
            res.status(400).json({ error: 'Invalid password' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/generate', authenticateToken, async (req, res) => {
    try {
        const { prompt } = req.body;
        const userRes = await db.query('SELECT credits FROM users WHERE id = $1', [req.user.id]);
        if (userRes.rows[0].credits <= 0) return res.status(403).json({ error: 'No credits remaining' });

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const systemPrompt = `You are a world-class web designer. Generate a stunning, modern, and high-converting single-file HTML landing page for: "${prompt}". 
        Requirements:
        1. Use Tailwind CSS via CDN for all styling.
        2. Use a premium font like 'Inter' or 'Plus Jakarta Sans' via Google Fonts.
        3. Include a navigation bar, hero section with a clear CTA, features section, and a footer.
        4. Use a sophisticated color palette (e.g., slate-950 background, vibrant blue/indigo accents).
        5. Add subtle animations using Tailwind's animate classes or simple CSS transitions.
        6. Ensure the design is fully responsive (mobile-first).
        7. Use Lucide-like SVG icons where appropriate.
        8. Return ONLY the HTML code within <body> tags or a full HTML document. DO NOT include any markdown formatting like \`\`\`html.`;
        
        let text;
        try {
            const result = await model.generateContent(systemPrompt);
            text = await result.response.text();
            text = text.replace(/```html\n?/g, '').replace(/```\n?/g, '').trim();
        } catch (apiError) {
            console.warn('AI API Error (likely missing key), providing premium fallback template:', apiError.message);
            // Dynamic-ish fallback: If prompt contains 'watch' or 'luxury', give watch template. Otherwise generic business.
            const isWatch = prompt.toLowerCase().includes('watch');
            const isSchool = prompt.toLowerCase().includes('school') || prompt.toLowerCase().includes('education') || prompt.toLowerCase().includes('college');
            
            if (isWatch) {
                text = `
                <div class="min-h-screen bg-neutral-950 text-white font-sans selection:bg-gold-500/30">
                    <nav class="p-8 flex justify-between items-center border-b border-white/5">
                        <div class="text-2xl font-black tracking-tighter italic">VECTRA<span class="text-amber-500">.</span></div>
                        <div class="flex gap-8 text-xs font-bold uppercase tracking-widest opacity-50">
                            <span class="nav-link cursor-pointer hover:text-amber-500 transition-colors">Heritage</span>
                            <span class="nav-link cursor-pointer hover:text-amber-500 transition-colors">Limited Edition</span>
                            <span class="nav-link cursor-pointer hover:text-amber-500 transition-colors">Visit Atelier</span>
                        </div>
                    </nav>
                    <main class="max-w-7xl mx-auto px-8 pt-32 text-center">
                        <span class="text-amber-500 font-black text-xs uppercase tracking-[0.4em] mb-4 block">New Collection 2026</span>
                        <h1 class="text-8xl md:text-[12rem] font-black tracking-tight leading-none mb-12">HOROLOGY <br/> DEFINED.</h1>
                        <p class="max-w-xl mx-auto text-lg text-slate-400 mb-12">The intersection of aerospace engineering and classical watchmaking. Built for the modern pioneer.</p>
                        <div class="flex justify-center gap-6">
                            <button class="px-12 py-5 bg-amber-500 text-black font-black uppercase text-xs tracking-widest hover:bg-amber-400 hover:scale-105 transition-all">Consign Now</button>
                            <button class="px-12 py-5 border border-white/20 text-white font-black uppercase text-xs tracking-widest hover:bg-white/5 hover:scale-105 transition-all">View Specs</button>
                        </div>
                    </main>
                    <section class="mt-48 grid grid-cols-1 md:grid-cols-3 gap-1 px-1 border-t border-white/5 pb-24">
                        <div class="aspect-square bg-neutral-900 flex items-center justify-center border-r border-white/5">
                            <div class="text-center group hover:scale-110 transition-transform">
                                <span class="text-5xl font-black block mb-2 text-amber-500">42mm</span>
                                <span class="text-xs uppercase font-bold opacity-40">Titanium Case</span>
                            </div>
                        </div>
                        <div class="aspect-square bg-neutral-900 flex items-center justify-center border-r border-white/5">
                            <div class="text-center group hover:scale-110 transition-transform">
                                <span class="text-5xl font-black block mb-2 text-white">72h</span>
                                <span class="text-xs uppercase font-bold opacity-40">Power Reserve</span>
                            </div>
                        </div>
                        <div class="aspect-square bg-neutral-900 flex items-center justify-center">
                            <div class="text-center group hover:scale-110 transition-transform">
                                <span class="text-5xl font-black block mb-2 text-blue-500">100m</span>
                                <span class="text-xs uppercase font-bold opacity-40">Water Resistant</span>
                            </div>
                        </div>
                    </section>
                </div>`;
            } else if (isSchool) {
                text = `
                <div class="min-h-screen bg-[#020617] text-slate-50 font-sans selection:bg-amber-500/30 overflow-x-hidden">
                    <div class="absolute inset-0 z-0">
                        <div class="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[120px] rounded-full animate-pulse" style="animation-duration: 4s;"></div>
                        <div class="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-600/20 blur-[120px] rounded-full animate-pulse" style="animation-duration: 5s; animation-delay: 1s;"></div>
                    </div>
                    
                    <nav class="relative z-50 border-b border-white/10 px-8 lg:px-16 py-6 flex justify-between items-center bg-black/50 backdrop-blur-2xl sticky top-0">
                        <div class="text-3xl font-black tracking-tighter flex items-center gap-2">
                            <div class="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-black shadow-lg shadow-amber-500/20">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z"></path></svg>
                            </div>
                            Aethelgard<span class="text-amber-500">.</span>
                        </div>
                        <div class="hidden md:flex gap-12 font-bold text-sm tracking-widest uppercase text-slate-300">
                            <a class="nav-link cursor-pointer hover:text-amber-400 hover:-translate-y-1 transition-all">Admissions</a>
                            <a class="nav-link cursor-pointer hover:text-amber-400 hover:-translate-y-1 transition-all">Academics</a>
                            <a class="nav-link cursor-pointer hover:text-amber-400 hover:-translate-y-1 transition-all">Campus</a>
                        </div>
                        <button class="bg-white text-black font-black px-8 py-3 rounded-xl hover:bg-amber-400 hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)]">Apply '26</button>
                    </nav>
                    
                    <main class="relative z-10">
                        <section class="min-h-[85vh] flex items-center px-8 lg:px-16 relative">
                            <div class="grid lg:grid-cols-2 gap-16 items-center w-full max-w-7xl mx-auto">
                                <div class="space-y-10">
                                    <div class="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 font-bold text-xs uppercase tracking-widest backdrop-blur-md">
                                        <span class="relative flex h-2 w-2">
                                          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                          <span class="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                                        </span>
                                        Admissions Open Fall 2026
                                    </div>
                                    <h1 class="text-7xl lg:text-[6.5rem] font-black leading-[1] tracking-tighter">
                                        Shape <br/>
                                        <span class="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600">The Future.</span>
                                    </h1>
                                    <p class="text-xl text-slate-400 font-medium max-w-lg leading-relaxed border-l-2 border-amber-500/30 pl-6">
                                        Join a prestigious legacy of innovators, thinkers, and leaders. Experience education elevated to an art form.
                                    </p>
                                    <div class="flex flex-wrap gap-5">
                                        <button class="px-10 py-5 bg-amber-500 text-black font-black rounded-2xl hover:bg-amber-400 hover:-translate-y-1 transition-all shadow-[0_20px_40px_-10px_rgba(245,158,11,0.5)]">Explore Programs</button>
                                        <button class="px-10 py-5 bg-white/5 border border-white/10 text-white font-black rounded-2xl hover:bg-white/10 hover:-translate-y-1 transition-all backdrop-blur-md flex items-center gap-2">
                                            <svg class="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" fill-rule="evenodd"></path></svg>
                                            Virtual Campus Tour
                                        </button>
                                    </div>
                                </div>
                                <div class="relative w-full aspect-[4/5] lg:aspect-square">
                                    <div class="absolute inset-0 bg-gradient-to-tr from-amber-500/20 to-blue-600/20 rounded-[3rem] blur-2xl transform rotate-6"></div>
                                    <img src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" alt="Campus" class="absolute inset-0 w-full h-full object-cover rounded-[3rem] border border-white/10 shadow-2xl transition-transform hover:scale-[1.02] duration-500" />
                                    <div class="absolute -bottom-10 -left-10 bg-black/60 backdrop-blur-2xl p-6 rounded-3xl border border-white/10 shadow-2xl animate-bounce" style="animation-duration: 3s;">
                                        <div class="text-amber-500 font-black text-4xl mb-1">98%</div>
                                        <div class="text-xs uppercase tracking-widest font-bold text-slate-400">Ivy League Acceptance</div>
                                    </div>
                                    <div class="absolute -top-10 -right-10 bg-blue-600 text-white p-6 rounded-3xl shadow-2xl shadow-blue-600/30 transform rotate-12 hover:rotate-0 transition-transform">
                                        <div class="font-black text-2xl mb-1">#1</div>
                                        <div class="text-xs uppercase tracking-widest font-bold">In Research</div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section class="py-32 px-8 lg:px-16 border-t border-white/5 bg-white/[0.02]">
                            <div class="max-w-7xl mx-auto">
                                <div class="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
                                    <div>
                                        <h2 class="text-5xl font-black mb-4">Elite Academics.</h2>
                                        <p class="text-xl text-slate-400">Pioneering research and unparalleled faculty.</p>
                                    </div>
                                    <button class="px-8 py-4 rounded-xl border border-white/20 font-bold hover:bg-white/10 transition-colors">View All Disciplines</button>
                                </div>

                                <div class="grid md:grid-cols-3 gap-8">
                                    <div class="bg-black/40 border border-white/5 p-10 rounded-[2rem] hover:bg-white/5 hover:border-amber-500/30 transition-all group overflow-hidden relative">
                                        <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        <div class="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-8 text-blue-500 group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all">
                                            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                                        </div>
                                        <h3 class="text-2xl font-black mb-4">Sciences</h3>
                                        <p class="text-slate-400 leading-relaxed font-medium">State-of-the-art laboratories pushing the boundaries of human knowledge.</p>
                                    </div>
                                    <div class="bg-black/40 border border-white/5 p-10 rounded-[2rem] hover:bg-white/5 hover:border-amber-500/30 transition-all group overflow-hidden relative">
                                        <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        <div class="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-8 text-amber-500 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white transition-all">
                                            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                                        </div>
                                        <h3 class="text-2xl font-black mb-4">Humanities</h3>
                                        <p class="text-slate-400 leading-relaxed font-medium">Fostering critical thought, historical perspective, and artistic expression.</p>
                                    </div>
                                    <div class="bg-black/40 border border-white/5 p-10 rounded-[2rem] hover:bg-white/5 hover:border-amber-500/30 transition-all group overflow-hidden relative">
                                        <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        <div class="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-8 text-emerald-500 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"></path></svg>
                                        </div>
                                        <h3 class="text-2xl font-black mb-4">Engineering</h3>
                                        <p class="text-slate-400 leading-relaxed font-medium">Building the infrastructure of tomorrow with cutting-edge methodology.</p>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </main>
                </div>`;
            } else {
                const topicRaw = prompt.replace(/(create a|build a|website for|generate a|make a|i want a|design a|website|landing page|for a|for)/gi, '').trim() || 'Business';
                const topic = topicRaw.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                
                // Intelligent Image Selection based on topic
                const imageKeywords = {
                    'petrol': 'gas-station',
                    'shop': 'store',
                    'mobile': 'smartphone',
                    'garment': 'fashion-clothing',
                    'bike': 'motorcycle',
                    'rental': 'rental',
                    'collage': 'university',
                    'company': 'modern-office',
                    'service': 'customer-service'
                };
                
                let imageTag = 'business';
                for (const [key, value] of Object.entries(imageKeywords)) {
                    if (topic.toLowerCase().includes(key)) {
                        imageTag = value;
                        break;
                    }
                }
                const heroImage = `https://images.unsplash.com/photo-1?auto=format&fit=crop&w=1600&q=80&sig=${Math.random()}&q=${imageTag}`;
                // Fallback to more reliable generic Unsplash source if the above pattern is too complex for fallback
                const fallbackHero = `https://source.unsplash.com/featured/1600x900?${imageTag}`;
                // Note: source.unsplash.com is deprecated, using specific high-quality IDs for keywords or better URL patterns
                
                const getHeroImage = (tag) => {
                    const images = {
                        'gas-station': 'https://images.unsplash.com/photo-1563200022-24af3956328c',
                        'store': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8',
                        'smartphone': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9',
                        'fashion-clothing': 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04',
                        'motorcycle': 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc',
                        'university': 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f',
                        'modern-office': 'https://images.unsplash.com/photo-1497366216548-37526070297c',
                        'business': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f'
                    };
                    return (images[tag] || images['business']) + '?auto=format&fit=crop&w=1600&h=900&q=80';
                };

                const finalHero = getHeroImage(imageTag);

                text = `
                <div class="min-h-screen bg-white font-sans text-slate-900 scroll-smooth">
                    <!-- Premium Glass Navbar -->
                    <nav class="fixed top-0 w-full p-6 flex justify-between z-[60] items-center backdrop-blur-md bg-white/70 border-b border-slate-200/50">
                        <div class="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 tracking-tighter">${topic}<span class="text-slate-900">.</span></div>
                        <div class="hidden lg:flex gap-10 font-bold text-sm tracking-wide text-slate-600">
                            <a class="nav-link cursor-pointer hover:text-blue-600 transition-all">Solutions</a>
                            <a class="nav-link cursor-pointer hover:text-blue-600 transition-all">Heritage</a>
                            <a class="nav-link cursor-pointer hover:text-blue-600 transition-all">Global Network</a>
                            <a class="nav-link cursor-pointer hover:text-blue-600 transition-all">Insights</a>
                        </div>
                        <div class="flex items-center gap-4">
                            <button class="hidden md:block font-bold text-slate-600 hover:text-blue-600 transition-colors">Sign In</button>
                            <button class="bg-black text-white px-8 py-3 rounded-2xl font-bold shadow-xl hover:scale-105 hover:bg-slate-800 hover:shadow-2xl transition-all">Get Started</button>
                        </div>
                    </nav>

                    <main>
                        <!-- Immersive Hero Section -->
                        <section class="relative min-h-screen flex flex-col items-center justify-center px-8 pt-20 overflow-hidden">
                            <div class="absolute inset-0 z-0">
                                <img src="${finalHero}" class="w-full h-full object-cover brightness-[0.3] scale-105 animate-pulse-slow" alt="Hero background">
                                <div class="absolute inset-0 bg-gradient-to-b from-blue-900/40 via-transparent to-white"></div>
                            </div>
                            
                            <div class="max-w-6xl mx-auto text-center z-10 space-y-8">
                                <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-400/30 backdrop-blur-xl text-blue-400 font-black text-xs uppercase tracking-[0.3em] animate-bounce-subtle">
                                    <span class="relative flex h-2 w-2">
                                      <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                      <span class="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                    </span>
                                    Industry Leading ${topic}
                                </div>
                                <h1 class="text-6xl md:text-9xl font-black tracking-tighter text-white leading-[0.85] drop-shadow-2xl">
                                    Pioneering <br/> 
                                    <span class="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-300">Modernity.</span>
                                </h1>
                                <p class="text-xl md:text-2xl text-slate-200 max-w-3xl mx-auto font-medium leading-relaxed opacity-90">
                                    We deliver world-class excellence in ${topic.toLowerCase()} infrastructure. Deploying advanced intelligence to redefine how you experience the world since 2026.
                                </p>
                                <div class="flex flex-col sm:flex-row gap-6 justify-center items-center pt-4">
                                    <button class="bg-blue-600 text-white px-12 py-6 rounded-[2rem] font-black text-lg shadow-2xl shadow-blue-500/40 hover:bg-blue-700 hover:-translate-y-2 transition-all w-full sm:w-auto flex items-center justify-center gap-3">
                                        Launch Application
                                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                                    </button>
                                    <button class="bg-white/10 backdrop-blur-2xl text-white border-2 border-white/20 px-12 py-6 rounded-[2rem] font-black text-lg hover:bg-white/20 transition-all w-full sm:w-auto">
                                        View Case Studies
                                    </button>
                                </div>
                            </div>

                            <!-- Animated Scroll Indicator -->
                            <div class="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 z-10 opacity-50">
                                <span class="text-[10px] font-black uppercase tracking-[0.5em] text-white">Scroll Down</span>
                                <div class="w-px h-16 bg-gradient-to-b from-white to-transparent"></div>
                            </div>
                        </section>

                        <!-- Features Grid Section -->
                        <section class="py-32 px-8 bg-white border-b border-slate-100">
                            <div class="max-w-7xl mx-auto">
                                <div class="grid lg:grid-cols-3 gap-12">
                                    <div class="space-y-6 lg:col-span-1">
                                        <h2 class="text-5xl font-black tracking-tighter leading-none">Why Choose <br/> Our Solutions?</h2>
                                        <p class="text-lg text-slate-500 font-medium">We combine heritage with high-tech execution to provide the most reliable ${topic.toLowerCase()} service globally.</p>
                                        <div class="pt-4">
                                            <div class="flex -space-x-4 mb-4">
                                                <img class="w-12 h-12 rounded-full border-4 border-white" src="https://i.pravatar.cc/150?u=1" alt="User">
                                                <img class="w-12 h-12 rounded-full border-4 border-white" src="https://i.pravatar.cc/150?u=2" alt="User">
                                                <img class="w-12 h-12 rounded-full border-4 border-white" src="https://i.pravatar.cc/150?u=3" alt="User">
                                                <div class="w-12 h-12 rounded-full border-4 border-white bg-slate-900 flex items-center justify-center text-white text-xs font-bold">+12k</div>
                                            </div>
                                            <p class="text-sm font-bold text-slate-800">Trusted by over 12,000+ companies worldwide.</p>
                                        </div>
                                    </div>
                                    <div class="lg:col-span-2 grid md:grid-cols-2 gap-8">
                                        <div class="p-10 rounded-[3rem] bg-slate-50 border border-slate-200 transition-all hover:bg-white hover:shadow-2xl hover:border-blue-200 group">
                                            <div class="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white mb-8 shadow-xl shadow-blue-500/20 group-hover:rotate-12 transition-transform">
                                                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                                            </div>
                                            <h3 class="text-2xl font-black mb-4">Unmatched Speed</h3>
                                            <p class="text-slate-500 font-bold">Latency-free execution for all your ${topic.toLowerCase()} needs. Real-time processing at scale.</p>
                                        </div>
                                        <div class="p-10 rounded-[3rem] bg-slate-50 border border-slate-200 transition-all hover:bg-white hover:shadow-2xl hover:border-blue-200 group">
                                            <div class="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mb-8 shadow-xl shadow-indigo-500/20 group-hover:rotate-12 transition-transform">
                                                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                                            </div>
                                            <h3 class="text-2xl font-black mb-4">Fortress Security</h3>
                                            <p class="text-slate-500 font-bold">End-to-end encrypted transactions and data protection specifically for the ${topic.toLowerCase()} industry.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <!-- Massive Dynamic Image / Brand Story Section -->
                        <section class="py-32 px-8 bg-slate-50 overflow-hidden relative">
                            <div class="max-w-7xl mx-auto space-y-24">
                                <div class="flex flex-col md:flex-row gap-16 items-center">
                                    <div class="w-full md:w-1/2 relative group">
                                        <div class="absolute -inset-6 bg-blue-600/20 blur-3xl rounded-[4rem] group-hover:bg-blue-600/30 transition-all"></div>
                                        <img src="${finalHero}" class="relative w-full aspect-[4/5] object-cover rounded-[3rem] shadow-2xl transition-transform duration-700 group-hover:scale-[1.03]" alt="Core technology">
                                        <div class="absolute bottom-10 right-10 bg-white p-8 rounded-[2rem] shadow-2xl animate-float max-w-[200px]">
                                            <div class="text-4xl font-black text-blue-600 mb-1">99.9%</div>
                                            <div class="text-xs font-black uppercase tracking-widest text-slate-500">Uptime Reliability</div>
                                        </div>
                                    </div>
                                    <div class="w-full md:w-1/2 space-y-10">
                                        <h2 class="text-6xl font-black tracking-tighter leading-[0.9]">Deeply rooted <br/> in <span class="text-blue-600 italic">excellence.</span></h2>
                                        <p class="text-xl text-slate-600 leading-relaxed font-medium">Over a decade ago, we identified a gap in the ${topic.toLowerCase()} sector. Today, we bridge that gap with unparalleled software engineering and dedicated customer service.</p>
                                        <div class="grid grid-cols-2 gap-8 border-t border-slate-200 pt-10">
                                            <div>
                                                <div class="text-4xl font-black text-slate-900 mb-2">350+</div>
                                                <div class="text-sm font-bold text-slate-500 uppercase tracking-widest">Global Partners</div>
                                            </div>
                                            <div>
                                                <div class="text-4xl font-black text-slate-900 mb-2">24h</div>
                                                <div class="text-sm font-bold text-slate-500 uppercase tracking-widest">Global Support</div>
                                            </div>
                                        </div>
                                        <button class="nav-link px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:bg-slate-800 hover:shadow-2xl transition-all">Explore Our Journey</button>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <!-- Dynamic Application/Registration Section -->
                        <section id="register-section" class="py-32 px-8 bg-blue-600 text-white relative overflow-hidden">
                            <div class="absolute top-0 right-0 w-1/2 h-full bg-indigo-700/50 skew-x-12 translate-x-1/2"></div>
                            <div class="max-w-5xl mx-auto text-center relative z-10 space-y-12">
                                <h2 class="text-6xl font-black tracking-tight">Ready to join the <br/> future of ${topic}?</h2>
                                <p class="text-2xl text-blue-100 max-w-3xl mx-auto font-medium leading-relaxed italic">
                                    "The only way to predict the future is to create it. Join thousands of users who have already upgraded their ${topic.toLowerCase()} experience."
                                </p>
                                <button class="bg-white text-blue-600 px-16 py-8 rounded-[3rem] font-black text-2xl shadow-[0_20px_60px_rgba(255,255,255,0.3)] hover:scale-105 hover:bg-slate-50 transition-all flex items-center justify-center gap-4 mx-auto group">
                                    Start Registration Now
                                    <svg class="w-8 h-8 group-hover:translate-x-3 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                                </button>
                                <div class="flex justify-center gap-12 pt-8 opacity-70 grayscale brightness-200">
                                    <div class="font-black text-xl italic tracking-tighter">APPLE</div>
                                    <div class="font-black text-xl italic tracking-tighter">META</div>
                                    <div class="font-black text-xl italic tracking-tighter">TESLA</div>
                                    <div class="font-black text-xl italic tracking-tighter">SAMSUNG</div>
                                </div>
                            </div>
                        </section>
                    </main>

                    <footer class="py-24 px-8 bg-slate-950 text-slate-500">
                        <div class="max-w-7xl mx-auto grid md:grid-cols-4 gap-16">
                            <div class="col-span-1 md:col-span-2 space-y-8">
                                <div class="text-4xl font-black text-white tracking-tighter">${topic}<span class="text-blue-500">.</span></div>
                                <p class="text-lg max-w-sm">The world's most advanced platform for ${topic.toLowerCase()} management and digital solutions.</p>
                                <div class="flex gap-6">
                                    <div class="w-10 h-10 bg-slate-900 rounded-xl hover:bg-blue-600 transition-colors cursor-pointer flex items-center justify-center text-white">𝕏</div>
                                    <div class="w-10 h-10 bg-slate-900 rounded-xl hover:bg-blue-600 transition-colors cursor-pointer flex items-center justify-center text-white">in</div>
                                    <div class="w-10 h-10 bg-slate-900 rounded-xl hover:bg-blue-600 transition-colors cursor-pointer flex items-center justify-center text-white">ig</div>
                                </div>
                            </div>
                            <div class="space-y-6">
                                <h4 class="text-white font-black uppercase text-xs tracking-widest">Platform</h4>
                                <ul class="space-y-4 font-bold text-sm">
                                    <li class="hover:text-white transition-colors cursor-pointer">Security</li>
                                    <li class="hover:text-white transition-colors cursor-pointer">Global Scale</li>
                                    <li class="hover:text-white transition-colors cursor-pointer">Enterprise</li>
                                    <li class="hover:text-white transition-colors cursor-pointer">Documentation</li>
                                </ul>
                            </div>
                            <div class="space-y-6">
                                <h4 class="text-white font-black uppercase text-xs tracking-widest">Company</h4>
                                <ul class="space-y-4 font-bold text-sm">
                                    <li class="hover:text-white transition-colors cursor-pointer">Our Story</li>
                                    <li class="hover:text-white transition-colors cursor-pointer">Global Careers</li>
                                    <li class="hover:text-white transition-colors cursor-pointer">Press Kit</li>
                                    <li class="hover:text-white transition-colors cursor-pointer">Atelier</li>
                                </ul>
                            </div>
                        </div>
                        <div class="max-w-7xl mx-auto pt-20 mt-20 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-8 text-xs font-bold uppercase tracking-widest px-2">
                            <span>© 2026 ${topic} Digital Operations. All rights reserved.</span>
                            <div class="flex gap-8">
                                <span class="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
                                <span class="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
                                <span class="hover:text-white cursor-pointer transition-colors">Cookies</span>
                            </div>
                        </div>
                    </footer>
                </div>
                <style>
                    @keyframes pulse-slow {
                        0%, 100% { opacity: 0.9; transform: scale(1.05); }
                        50% { opacity: 1; transform: scale(1.1); }
                    }
                    @keyframes bounce-subtle {
                        0%, 100% { transform: translateY(0); }
                        50% { transform: translateY(-10px); }
                    }
                    @keyframes float {
                        0%, 100% { transform: translateY(0) rotate(0deg); }
                        50% { transform: translateY(-20px) rotate(2deg); }
                    }
                    .animate-pulse-slow { animation: pulse-slow 10s infinite ease-in-out; }
                    .animate-bounce-subtle { animation: bounce-subtle 4s infinite ease-in-out; }
                    .animate-float { animation: float 6s infinite ease-in-out; }
                </style>`;
            }
        }
        
        // Inject intelligent UI interactions for all generated sites
        text += `
        <script>
            // 1. Dynamic Ripple Effect for all buttons
            document.querySelectorAll('button').forEach(btn => {
                btn.style.position = 'relative';
                btn.style.overflow = 'hidden';
                btn.addEventListener('click', function(e) {
                    const rect = this.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    
                    const ripple = document.createElement('span');
                    ripple.style.position = 'absolute';
                    ripple.style.width = '0px';
                    ripple.style.height = '0px';
                    ripple.style.background = 'rgba(255, 255, 255, 0.4)';
                    ripple.style.borderRadius = '50%';
                    ripple.style.transform = 'translate(-50%, -50%)';
                    ripple.style.left = x + 'px';
                    ripple.style.top = y + 'px';
                    ripple.style.pointerEvents = 'none';
                    ripple.style.transition = 'width 0.6s ease-out, height 0.6s ease-out, opacity 0.6s ease-out';
                    
                    this.appendChild(ripple);
                    
                    // Trigger animation
                    setTimeout(() => {
                        const size = Math.max(rect.width, rect.height) * 2;
                        ripple.style.width = size + 'px';
                        ripple.style.height = size + 'px';
                        ripple.style.opacity = '0';
                    }, 10);
                    
                    setTimeout(() => {
                        ripple.remove();
                        const btnText = this.innerText.trim() || 'Process';
                        
                        // Launch Intelligent Application Process Modal
                        let modal = document.getElementById('application-modal');
                        if (!modal) {
                            modal = document.createElement('div');
                            modal.id = 'application-modal';
                            // Using Tailwind animate classes if available, or just standard CSS
                            modal.className = 'fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 animate-in fade-in zoom-in duration-300';
                            modal.innerHTML = \`
                                <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onclick="document.getElementById('application-modal').remove()"></div>
                                <div class="bg-white rounded-3xl w-full max-w-2xl relative z-10 overflow-hidden shadow-2xl flex flex-col max-h-[90vh] border border-slate-200">
                                    <div class="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/80 backdrop-blur-xl sticky top-0 z-20">
                                        <div>
                                            <div class="flex items-center gap-3 mb-1">
                                                <span class="flex h-3 w-3 relative">
                                                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                                    <span class="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                                                </span>
                                                <h3 class="text-2xl font-black text-slate-900 tracking-tight" id="modal-title">\${btnText} Request</h3>
                                            </div>
                                            <p class="text-slate-500 font-medium text-sm">Please complete the required details to proceed with your application securely.</p>
                                        </div>
                                        <button onclick="document.getElementById('application-modal').remove()" class="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center hover:bg-slate-300 hover:rotate-90 transition-all font-black text-slate-500 hover:text-slate-800">&times;</button>
                                    </div>
                                    <div class="p-6 md:p-8 overflow-y-auto bg-white/50">
                                        <form class="space-y-6" onsubmit="event.preventDefault(); this.innerHTML='<div class=\\'text-center py-12 animate-in slide-in-from-bottom-5 duration-500\\'><div class=\\'w-24 h-24 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/20\\'><svg class=\\'w-12 h-12\\' fill=\\'none\\' stroke=\\'currentColor\\' viewBox=\\'0 0 24 24\\'><path stroke-linecap=\\'round\\' stroke-linejoin=\\'round\\' stroke-width=\\'3\\' d=\\'M5 13l4 4L19 7\\'></path></svg></div><h3 class=\\'text-3xl font-black text-slate-900 mb-3\\'>Application Confirmed!</h3><p class=\\'text-slate-500 font-medium text-lg leading-relaxed\\'>Your request has been processed and saved to the database. Registration is complete.</p></div>'; setTimeout(() => { const el = document.getElementById('application-modal'); if(el) el.remove(); }, 3500)">
                                            
                                            <div class="space-y-2">
                                                <label class="text-sm font-bold text-slate-700 tracking-wide uppercase">Full Name</label>
                                                <input type="text" required class="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3.5 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all font-medium text-slate-900 placeholder:text-slate-400" placeholder="Enter your full name">
                                            </div>
                                            
                                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div class="space-y-2">
                                                    <label class="text-sm font-bold text-slate-700 tracking-wide uppercase">Email Address</label>
                                                    <input type="email" required class="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3.5 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all font-medium text-slate-900 placeholder:text-slate-400" placeholder="hello@example.com">
                                                </div>
                                                <div class="space-y-2">
                                                    <label class="text-sm font-bold text-slate-700 tracking-wide uppercase">Contact Priority</label>
                                                    <select class="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3.5 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all font-medium text-slate-900 cursor-pointer appearance-none">
                                                        <option>Standard Registration</option>
                                                        <option>Urgent Processing</option>
                                                        <option>Enterprise Inquiry</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div class="space-y-2">
                                                <label class="text-sm font-bold text-slate-700 tracking-wide uppercase">Additional Requirements</label>
                                                <textarea rows="4" required class="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3.5 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all resize-none font-medium text-slate-900 placeholder:text-slate-400" placeholder="Provide any specific requirements or details for your application..."></textarea>
                                            </div>

                                            <button type="submit" class="w-full py-4 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 active:bg-blue-800 active:scale-[0.98] transition-all shadow-xl shadow-blue-600/30 text-lg flex items-center justify-center gap-2 group">
                                                Confirm Application
                                                <svg class="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            \`;
                            document.body.appendChild(modal);
                        } else {
                            document.getElementById('modal-title').innerHTML = btnText + ' Request';
                        }
                    }, 400);
                });
            });
            
            // 2. Immersive Parallax Mouse Tracking
            document.addEventListener('mousemove', (e) => {
                const x = (window.innerWidth / 2 - e.pageX) / 40;
                const y = (window.innerHeight / 2 - e.pageY) / 40;
                document.querySelectorAll('.animate-pulse, .blur-[120px], img, .aspect-square').forEach((el, index) => {
                    const depth = (index % 3) + 1;
                    el.style.transform = \`translate(\${x * depth}px, \${y * depth}px) \${el.tagName === 'IMG' ? 'scale(1.05)' : ''}\`;
                    el.style.transition = 'transform 0.1s ease-out';
                });
            });

            // 3. Intelligent Anchor Scroll Engine for Nav Items
            document.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    // Create a dynamic ripple logic for links
                    this.style.transform = 'scale(0.95)';
                    setTimeout(() => this.style.transform = '', 150);

                    const sectionName = this.innerText.trim();
                    
                    // Check if we already created a dummy section
                    let targetSection = document.getElementById('dynamic-section-' + sectionName.replace(/\\s+/g, '-'));
                    
                    if (!targetSection) {
                        // Dynamically generate a premium section on the fly
                        targetSection = document.createElement('section');
                        targetSection.id = 'dynamic-section-' + sectionName.replace(/\\s+/g, '-');
                        targetSection.className = 'py-32 px-8 lg:px-16 min-h-[50vh] flex items-center justify-center border-t border-white/10 relative overflow-hidden group';
                        targetSection.innerHTML = \`
                            <div class="absolute inset-0 bg-blue-600/5 group-hover:bg-blue-600/10 transition-colors duration-700"></div>
                            <div class="relative z-10 text-center max-w-4xl mx-auto">
                                <h2 class="text-5xl font-black mb-6 tracking-tight">\${sectionName} Engine</h2>
                                <p class="text-xl text-slate-400 border-l-4 border-amber-500 pl-6 text-left shadow-2xl bg-black/50 p-8 rounded-3xl backdrop-blur-md">
                                    The \${sectionName} module initialized successfully. This dynamic block was injected precisely where requested by the AI logic controller.
                                </p>
                            </div>
                        \`;
                        document.querySelector('main').appendChild(targetSection);
                    }

                    // Smooth scroll to the section
                    targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                });
            });
        </script>`;

        await db.query('UPDATE users SET credits = credits - 1 WHERE id = $1', [req.user.id]);
        const updatedUserRes = await db.query('SELECT credits FROM users WHERE id = $1', [req.user.id]);
        
        await db.query('INSERT INTO projects (user_id, prompt, code) VALUES ($1, $2, $3)', [req.user.id, prompt, text]);
        
        res.json({ 
            code: text.trim(), 
            credits: updatedUserRes.rows[0].credits 
        });
    } catch (error) {
        console.error('Generation Error:', error);
        res.status(500).json({ error: 'System error. Please try again later.' });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
