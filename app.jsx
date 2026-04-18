import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, BookOpen, GraduationCap, LineChart, Info, 
  Moon, Sun, User, LogIn, Bot, Sparkles, Send, 
  CheckCircle, Clock, ChevronRight, LogOut, Activity
} from 'lucide-react';

const apiKey = "";

const callGeminiWithBackoff = async (prompt, systemPrompt) => {
  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    systemInstruction: { parts: [{ text: systemPrompt }] }
  };
  
  const maxRetries = 5;
  const delays = [1000, 2000, 4000, 8000, 16000];

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate a response.";
    } catch (error) {
      if (i === maxRetries - 1) {
        return "An error occurred while connecting to the AI. Please try again later.";
      }
      await new Promise(res => setTimeout(res, delays[i]));
    }
  }
};

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState({ name: '', targetGPA: '5.00', group: 'Science' });
  
  // Countdown State
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    // HSC 2026 Date: July 2, 2026
    const targetDate = new Date('2026-07-02T00:00:00').getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        clearInterval(interval);
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Theme Toggle Effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'hsc', label: 'HSC Analysis', icon: BookOpen },
    { id: 'ssc', label: 'SSC Base', icon: GraduationCap },
    { id: 'progress', label: 'Progress', icon: LineChart },
    { id: 'about', label: 'About', icon: Info },
  ];

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoggedIn(true);
    setCurrentPage('home');
    setUserProfile({ ...userProfile, name: e.target.name.value || 'Student' });
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentPage('login');
  };

  const renderContent = () => {
    if (!isLoggedIn && (currentPage === 'profile' || currentPage === 'progress')) {
      return <AuthPage onLogin={handleLogin} />;
    }

    switch (currentPage) {
      case 'home': return <HomePage timeLeft={timeLeft} userName={userProfile.name} />;
      case 'hsc': return <HSCPage />;
      case 'ssc': return <SSCPage />;
      case 'progress': return <ProgressPage userProfile={userProfile} />;
      case 'about': return <AboutPage />;
      case 'login': return <AuthPage onLogin={handleLogin} />;
      case 'profile': return <ProfilePage userProfile={userProfile} onLogout={handleLogout} />;
      default: return <HomePage timeLeft={timeLeft} userName={userProfile.name} />;
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 font-sans ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-gray-50 text-slate-900'}`}>
      
      {/* Desktop Top Navbar */}
      <nav className={`hidden md:flex fixed top-0 w-full z-50 transition-colors duration-300 backdrop-blur-md border-b ${isDarkMode ? 'bg-slate-900/80 border-slate-700' : 'bg-white/80 border-gray-200'} px-6 py-4 items-center justify-between`}>
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentPage('home')}>
          <div className="bg-blue-600 p-2 rounded-lg"><Bot className="w-6 h-6 text-white" /></div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
            Nexus AI 2026
          </span>
        </div>
        
        <div className="flex items-center gap-6">
          {navItems.map(item => (
            <button 
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`flex items-center gap-2 font-medium transition-colors ${currentPage === item.id ? 'text-blue-500' : isDarkMode ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-blue-600'}`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition">
            {isDarkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
          </button>
          {isLoggedIn ? (
            <button onClick={() => setCurrentPage('profile')} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full transition">
              <User className="w-4 h-4" /> {userProfile.name || 'Profile'}
            </button>
          ) : (
            <button onClick={() => setCurrentPage('login')} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full transition">
              <LogIn className="w-4 h-4" /> Sign In
            </button>
          )}
        </div>
      </nav>

      {/* Mobile Top Header */}
      <header className={`md:hidden fixed top-0 w-full z-50 flex items-center justify-between px-4 py-3 backdrop-blur-md border-b ${isDarkMode ? 'bg-slate-900/90 border-slate-700' : 'bg-white/90 border-gray-200'}`}>
        <div className="flex items-center gap-2" onClick={() => setCurrentPage('home')}>
          <div className="bg-blue-600 p-1.5 rounded-lg"><Bot className="w-5 h-5 text-white" /></div>
          <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">Nexus AI</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-full bg-slate-200 dark:bg-slate-800">
            {isDarkMode ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>
          <button onClick={() => setCurrentPage(isLoggedIn ? 'profile' : 'login')} className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
            {isLoggedIn ? <User className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="pt-20 pb-24 md:pb-10 px-4 md:px-8 max-w-7xl mx-auto min-h-[calc(100vh-80px)]">
        {renderContent()}
      </main>

      {/* Mobile Bottom Navigation (iPhone Friendly) */}
      <nav className={`md:hidden fixed bottom-0 w-full z-50 border-t pb-safe ${isDarkMode ? 'bg-slate-900/95 border-slate-800' : 'bg-white/95 border-gray-200'} backdrop-blur-xl`}>
        <div className="flex justify-between items-center px-6 py-3">
          {navItems.map(item => (
            <button 
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`flex flex-col items-center gap-1 transition-colors ${currentPage === item.id ? 'text-blue-500' : isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}
            >
              <item.icon className={`w-6 h-6 ${currentPage === item.id ? 'animate-bounce' : ''}`} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

    </div>
  );
}

// ==========================================
// P A G E   C O M P O N E N T S
// ==========================================

function HomePage({ timeLeft, userName }) {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Hero / Countdown Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 text-white p-8 md:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-20">
          <Activity className="w-48 h-48 animate-pulse" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
              Hello {userName ? userName : 'Warrior'}, <br/>
              <span className="text-yellow-400">HSC 2026</span> is coming.
            </h1>
            <p className="text-blue-100 text-lg">Your AI-powered full syllabus mastery hub. Let's make every second count. (তোমার প্রস্তুতি হোক ১০০%)</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 text-center shadow-[0_0_40px_rgba(0,0,0,0.3)] w-full md:w-auto">
            <h3 className="text-sm uppercase tracking-widest font-semibold text-blue-200 mb-4">Time Remaining (July 2, 2026)</h3>
            <div className="flex justify-center gap-4 text-center">
              {Object.entries(timeLeft).map(([unit, value]) => (
                <div key={unit} className="flex flex-col items-center">
                  <div className="bg-white/20 rounded-xl w-16 h-16 md:w-20 md:h-20 flex items-center justify-center text-2xl md:text-3xl font-bold shadow-inner">
                    {value.toString().padStart(2, '0')}
                  </div>
                  <span className="text-xs uppercase mt-2 text-blue-200">{unit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* AI Chat Interface */}
      <AIChat />
    </div>
  );
}

function AIChat() {
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hello! I am your HSC 2026 AI Assistant powered by Gemini. Do you need a study routine, suggestions on past questions, or help with a tough Physics concept? (আমি তোমাকে কীভাবে সাহায্য করতে পারি?)' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const endOfMessagesRef = useRef(null);

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input.trim();
    const newMessages = [...messages, { role: 'user', text: userMsg }];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);

    const systemPrompt = "You are an expert AI Study Consultant for Bangladesh HSC 2026 students. You fluently speak English and Bengali (Bangla). Keep your answers concise, practical, and heavily focused on the HSC Bangladesh curriculum (NCTB). Use Markdown for formatting.";
    
    // Build conversation history for context so the AI remembers previous questions
    const conversationHistory = newMessages.map(m => `${m.role === 'ai' ? 'Assistant' : 'Student'}: ${m.text}`).join('\n');
    const finalPrompt = `Here is the conversation so far:\n${conversationHistory}\n\nRespond to the Student's last message as the Assistant.`;

    const aiResponse = await callGeminiWithBackoff(finalPrompt, systemPrompt);

    setMessages(prev => [...prev, { role: 'ai', text: aiResponse }]);
    setIsTyping(false);
  };

  return (
    <section className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-gray-100 dark:border-slate-700 overflow-hidden flex flex-col h-[500px]">
      <div className="bg-slate-100 dark:bg-slate-900 p-4 border-b dark:border-slate-700 flex items-center gap-3">
        <Sparkles className="text-blue-500 w-6 h-6" />
        <h2 className="font-bold text-lg dark:text-white">AI Study Consultant</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-4 rounded-2xl whitespace-pre-wrap ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-br-none' 
                : 'bg-gray-100 dark:bg-slate-700 dark:text-gray-100 rounded-bl-none'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-slate-700 p-4 rounded-2xl rounded-bl-none flex gap-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}
        <div ref={endOfMessagesRef} />
      </div>

      <div className="p-4 bg-white dark:bg-slate-800 border-t dark:border-slate-700">
        <div className="flex gap-2 relative">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask for routine, subject suggestions, etc..."
            className="flex-1 bg-gray-100 dark:bg-slate-900 dark:text-white rounded-full px-6 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-transparent dark:border-slate-700 transition"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-full p-3 transition-transform active:scale-95"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}

function HSCPage() {
  const analysisData = [
    { subject: 'Physics 1st Paper', chapter: 'Vector', probability: 98, trend: 'High (Dhaka \'23, \'21)' },
    { subject: 'Physics 2nd Paper', chapter: 'Thermodynamics', probability: 95, trend: 'Guaranteed 1 CQ' },
    { subject: 'Chemistry 1st Paper', chapter: 'Chemical Changes (Chap 4)', probability: 90, trend: 'Kp/Kc Math is must' },
    { subject: 'Higher Math 1st', chapter: 'Calculus (Diff & Int)', probability: 99, trend: 'Covers 20+ marks' },
    { subject: 'Biology 1st Paper', chapter: 'Cell & Its Structure', probability: 85, trend: 'Moderate' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center md:text-left">
        <h1 className="text-3xl font-bold mb-2">HSC 2026 Deep Analysis</h1>
        <p className="text-gray-500 dark:text-gray-400">Based on past 10 years board question patterns and full syllabus requirements.</p>
      </div>

      {/* Probability Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b dark:border-slate-700 flex justify-between items-center">
          <h2 className="font-bold text-xl flex items-center gap-2"><LineChart className="text-purple-500" /> Topic Probability Predictor</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-900/50">
                <th className="p-4 font-semibold text-sm text-gray-600 dark:text-gray-300">Subject</th>
                <th className="p-4 font-semibold text-sm text-gray-600 dark:text-gray-300">Chapter / Topic</th>
                <th className="p-4 font-semibold text-sm text-gray-600 dark:text-gray-300">Past Trend</th>
                <th className="p-4 font-semibold text-sm text-gray-600 dark:text-gray-300">CQ Probability</th>
              </tr>
            </thead>
            <tbody>
              {analysisData.map((item, index) => (
                <tr key={index} className="border-t border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition">
                  <td className="p-4 font-medium dark:text-gray-200">{item.subject}</td>
                  <td className="p-4 text-gray-600 dark:text-gray-400">{item.chapter}</td>
                  <td className="p-4 text-sm text-gray-500 dark:text-gray-400">{item.trend}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2.5 max-w-[100px]">
                        <div 
                          className={`h-2.5 rounded-full ${item.probability > 90 ? 'bg-green-500' : 'bg-yellow-500'}`} 
                          style={{ width: `${item.probability}%` }}
                        ></div>
                      </div>
                      <span className="font-bold text-sm dark:text-gray-200">{item.probability}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Real-life interactive animation concept */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        <h3 className="text-xl font-bold mb-4 z-10 relative">Interactive Concept: The Simple Pendulum (Physics)</h3>
        <p className="text-gray-300 z-10 relative max-w-xl text-sm mb-8">
          Understanding periodic motion (Chapter 8) is crucial. A simple pendulum's time period depends only on its length and gravity. Notice the velocity is maximum at the lowest point!
        </p>
        
        {/* CSS Pendulum Animation */}
        <div className="flex justify-center h-48 relative z-10">
          <div className="relative w-1 h-32 bg-gray-400 origin-top animate-[swing_3s_ease-in-out_infinite_alternate]">
            <div className="absolute -bottom-4 -left-3.5 w-8 h-8 rounded-full bg-gradient-to-br from-yellow-300 to-orange-500 shadow-[0_0_15px_rgba(255,165,0,0.6)]"></div>
          </div>
          {/* Top hinge */}
          <div className="absolute top-0 w-4 h-4 bg-gray-500 rounded-full -ml-1.5 -mt-2"></div>
        </div>
        
        {/* Add custom keyframes for swing */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes swing {
            0% { transform: rotate(30deg); }
            100% { transform: rotate(-30deg); }
          }
        `}} />
      </div>
    </div>
  );
}

function SSCPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">SSC Foundation Bridge</h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
          You cannot build a strong HSC result on a weak SSC foundation. Revisit these crucial SSC concepts before diving deep into HSC syllabus.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {[
          { title: 'Algebraic Equations', desc: 'Crucial for HSC Higher Math Calculus & Algebra.', status: 'Review Needed' },
          { title: 'Basic Trigonometry', desc: 'SSC Chapter 9 is the heart of HSC Math & Physics.', status: 'Highly Recommended' },
          { title: 'Mole Concept', desc: 'Without SSC Chemistry Chap 6, HSC Quantitative Chemistry is impossible.', status: 'Critical' },
          { title: 'Motion Equations', desc: 'SSC Physics Chapter 2 equations ($v=u+at$, etc.) are heavily used in HSC Vector & Dynamics.', status: 'Critical' },
        ].map((item, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 hover:shadow-lg transition-shadow">
            <h3 className="font-bold text-lg mb-2 dark:text-white">{item.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{item.desc}</p>
            <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
              item.status === 'Critical' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 
              'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
            }`}>
              {item.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProgressPage({ userProfile }) {
  const [actionPlan, setActionPlan] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const subjects = [
    { name: 'Physics', progress: 45, totalChapters: 21 },
    { name: 'Chemistry', progress: 30, totalChapters: 10 },
    { name: 'Higher Math', progress: 60, totalChapters: 20 },
    { name: 'Biology', progress: 15, totalChapters: 24 },
    { name: 'Bangla', progress: 80, totalChapters: 'Prose/Poetry' },
    { name: 'English', progress: 50, totalChapters: 'Grammar/Text' }
  ];

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    const systemPrompt = "You are an expert HSC academic advisor.";
    const prompt = `Generate a very brief, punchy 3-step action plan for an HSC 2026 student aiming for GPA ${userProfile.targetGPA} in the ${userProfile.group} group. 
    Their current progress is: Physics 45%, Chemistry 30%, Higher Math 60%, Biology 15%, Bangla 80%, English 50%. 
    Focus strictly on how they can improve their weakest subjects quickly. Keep it under 100 words. Format with markdown bullet points.`;
    
    const response = await callGeminiWithBackoff(prompt, systemPrompt);
    setActionPlan(response);
    setIsGenerating(false);
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Progress</h1>
          <p className="text-gray-500 dark:text-gray-400">Target GPA: {userProfile.targetGPA} • Group: {userProfile.group}</p>
        </div>
        <div className="hidden md:block">
           <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${userProfile.name || 'Student'}`} alt="Avatar" className="w-16 h-16 rounded-xl bg-blue-100 dark:bg-slate-700" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {subjects.map((sub, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm hover:scale-[1.02] transition-transform">
            <div className="flex justify-between items-end mb-4">
              <h3 className="font-bold text-lg dark:text-white">{sub.name}</h3>
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">{sub.progress}%</span>
            </div>
            
            {/* Animated Progress Bar */}
            <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3 mb-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-1000 ease-out" 
                style={{ width: `${sub.progress}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 text-right mt-2">
               Chapters / Modules: {sub.totalChapters}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-10 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-800 dark:to-slate-900 border border-blue-100 dark:border-slate-700 p-6 rounded-2xl shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div>
            <h3 className="font-bold text-xl dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-500" /> AI Insights
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Get a personalized study strategy based on your current progress.</p>
          </div>
          <button 
            onClick={handleGeneratePlan}
            disabled={isGenerating}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded-xl transition flex items-center gap-2 shrink-0"
          >
            {isGenerating ? 'Analyzing...' : '✨ Generate AI Action Plan'}
          </button>
        </div>
        
        {actionPlan && (
          <div className="mt-4 p-5 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 prose dark:prose-invert max-w-none text-sm whitespace-pre-wrap shadow-inner">
            {actionPlan}
          </div>
        )}
      </div>
    </div>
  );
}

function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto text-center space-y-8 animate-in fade-in duration-500 pt-10">
      <div className="inline-block bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full mb-4">
        <Sparkles className="w-12 h-12 text-blue-600 dark:text-blue-400" />
      </div>
      <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">Nexus AI 2026</h1>
      <p className="text-lg text-gray-600 dark:text-gray-300">
        The ultimate AI-assisted study planner designed exclusively for the Bangladesh Higher Secondary Certificate (HSC) batch of 2026. 
      </p>
      
      <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-lg border border-gray-100 dark:border-slate-700 text-left mt-8">
        <h2 className="text-2xl font-bold mb-4 border-b dark:border-slate-700 pb-2">Features</h2>
        <ul className="space-y-4">
          <li className="flex items-start gap-3">
            <CheckCircle className="text-green-500 w-6 h-6 shrink-0" />
            <p><strong className="dark:text-white">Full Syllabus Coverage:</strong> Adapted specifically for the official 2026 full curriculum mandate.</p>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle className="text-green-500 w-6 h-6 shrink-0" />
            <p><strong className="dark:text-white">Predictive Analytics:</strong> Analyzes previous years' board questions (Dhaka, Rajshahi, Cumilla, etc.) to highlight CQ patterns.</p>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle className="text-green-500 w-6 h-6 shrink-0" />
            <p><strong className="dark:text-white">Bilingual AI Assistant:</strong> Ask questions in English or Bangla and get personalized study routines instantly.</p>
          </li>
        </ul>
      </div>

      <p className="text-sm text-gray-400 mt-12">Version 1.0.0 • Developed for Bangladeshi Students</p>
    </div>
  );
}

function AuthPage({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="max-w-md mx-auto pt-10 animate-in zoom-in-95 duration-300">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-slate-700">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">{isLogin ? 'Welcome Back' : 'Join Nexus 2026'}</h2>
          <p className="text-gray-500 dark:text-gray-400">{isLogin ? 'Sign in to access your study plans' : 'Create an account to start your journey'}</p>
        </div>

        <form onSubmit={onLogin} className="space-y-5">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">Full Name</label>
              <input 
                type="text" 
                name="name"
                required 
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition"
                placeholder="Rahim Uddin"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Email Address</label>
            <input 
              type="email" 
              required 
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition"
              placeholder="student@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Password</label>
            <input 
              type="password" 
              required 
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition"
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 rounded-xl hover:opacity-90 transition-opacity flex justify-center items-center gap-2">
            {isLogin ? 'Sign In' : 'Sign Up'} <ChevronRight className="w-5 h-5" />
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ProfilePage({ userProfile, onLogout }) {
  return (
    <div className="max-w-2xl mx-auto animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-slate-700">
        <div className="flex flex-col md:flex-row items-center gap-6 border-b dark:border-slate-700 pb-8">
          <img 
            src={`https://api.dicebear.com/7.x/notionists/svg?seed=${userProfile.name || 'Student'}`} 
            alt="Profile" 
            className="w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 dark:from-slate-700 dark:to-slate-600 p-2 shadow-inner" 
          />
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold dark:text-white">{userProfile.name || 'Student Name'}</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">HSC 2026 Candidate</p>
            <div className="flex gap-4 mt-4 justify-center md:justify-start">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-sm font-medium">Group: {userProfile.group}</span>
              <span className="px-3 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded-full text-sm font-medium">Target: {userProfile.targetGPA}</span>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="font-bold text-lg mb-4 dark:text-white">Settings & Account</h3>
          <ul className="space-y-3">
            <li className="flex justify-between p-4 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800 transition">
              <span>Edit Syllabus Priorities</span>
              <ChevronRight className="text-gray-400" />
            </li>
            <li className="flex justify-between p-4 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800 transition">
              <span>Update Mock Test Scores</span>
              <ChevronRight className="text-gray-400" />
            </li>
          </ul>

          <button 
            onClick={onLogout}
            className="w-full mt-8 py-3 rounded-xl text-red-600 bg-red-50 dark:bg-red-900/10 dark:text-red-400 font-bold hover:bg-red-100 dark:hover:bg-red-900/20 transition flex justify-center items-center gap-2"
          >
            <LogOut className="w-5 h-5" /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
