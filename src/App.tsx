import React, { useState, useRef, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, Code, Target, GraduationCap, Briefcase, TrendingUp, 
  Github, Sparkles, Zap, CheckCircle2, Award, Cpu, Terminal, Database,
  ArrowRight, Upload, AlertTriangle, ShieldAlert, Lightbulb, Star, LogOut,
  Printer, FileText, LayoutTemplate, PenTool
} from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import LoadingSpinner from './components/LoadingSpinner';
import { analyzeCode, AnalysisResult } from './services/gemini';
import { fetchGithubRepo } from './services/github';
import ArchitectureGraph from './components/ArchitectureGraph';
import { cn } from './lib/utils';
import { ResumeData, initialResumeData, TemplateType } from './resumeTypes';
import ResumeForm from './components/ResumeForm';
import ResumePreview from './components/ResumePreview';
import TemplateSelector from './components/TemplateSelector';

type Tab = 'dashboard' | 'analyzer' | 'radar' | 'learning' | 'resume' | 'growth' | 'architecture';

const formatText = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <span key={i} className="font-semibold text-white">{part.slice(2, -2)}</span>;
    }
    return part;
  });
};

const navItems: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'analyzer', label: 'Code Analyzer', icon: Code },
  { id: 'architecture', label: 'Architecture', icon: Cpu },
  { id: 'radar', label: 'Skill Radar', icon: Target },
  { id: 'learning', label: 'Learning Path', icon: GraduationCap },
  { id: 'resume', label: 'Resume Generator', icon: FileText },
  { id: 'growth', label: 'Growth', icon: TrendingUp },
];

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [reportData, setReportData] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [repoUrl, setRepoUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<any>(null);
  const [repositories, setRepositories] = useState<any[]>([]);
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);
  const [growthData, setGrowthData] = useState<any[]>([]);
  const [radarData, setRadarData] = useState<any>(null);

  // Resume Generator State
  const [resumeData, setResumeData] = useState<ResumeData>(initialResumeData);
  const [template, setTemplate] = useState<TemplateType>('professional');
  const [resumeActiveTab, setResumeActiveTab] = useState<'edit' | 'preview'>('edit');
  const printRef = useRef<HTMLDivElement>(null);

  const handleAutoFill = () => {
    const newSkills = new Set(resumeData.skills);

    // Add from repositories
    if (repositories.length > 0) {
      repositories.forEach(repo => {
        if (repo.language) newSkills.add(repo.language);
      });
    }

    // Add from current analysis
    if (reportData?.tech_stack?.language) {
      newSkills.add(reportData.tech_stack.language);
    }

    // Add from radar
    const radar = radarData || reportData?.skill_radar;
    if (radar) {
      if (radar.frontend > 60) newSkills.add('Frontend Development');
      if (radar.backend > 60) newSkills.add('Backend Development');
      if (radar.devops > 60) newSkills.add('DevOps');
      if (radar.security > 60) newSkills.add('Security');
      if (radar.design > 60) newSkills.add('UI/UX Design');
      if (radar.architecture > 60) newSkills.add('System Architecture');
    }

    setResumeData({
      ...resumeData,
      skills: Array.from(newSkills)
    });
  };

  const handlePrint = () => {
    // Create a temporary iframe to print
    const content = printRef.current;
    if (!content) return;

    const printWindow = window.open('', '', 'height=800,width=800');
    if (!printWindow) return;

    printWindow.document.write('<html><head><title>Resume</title>');
    // Include Tailwind via CDN for the print window since we can't easily grab the compiled CSS styles in this environment
    printWindow.document.write('<script src="https://cdn.tailwindcss.com"></script>');
    printWindow.document.write('</head><body class="bg-white">');
    printWindow.document.write(content.innerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();

    // Wait for resources to load
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userRes = await fetch('/api/github/user');
        if (userRes.ok) {
          const userData = await userRes.json();
          
          if (userData) {
            setUser(userData);
            
            setIsLoadingRepos(true);
            const reposRes = await fetch('/api/github/repositories');
            if (reposRes.ok) {
              const reposData = await reposRes.json();
              setRepositories(reposData);
            }
            
            const dataRes = await fetch('/api/user/data');
            if (dataRes.ok) {
              const data = await dataRes.json();
              setGrowthData(Array.isArray(data.growthData) ? data.growthData : []);
              setRadarData(data.radarData || null);
            }
            
            setIsLoadingRepos(false);
          } else {
            // Not logged in
            setUser(null);
            setRepositories([]);
            setGrowthData([]);
            setRadarData(null);
          }
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };

    fetchUserData();

    const handleMessage = async (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost')) {
        return;
      }
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        await fetchUserData();
        navigate('/dashboard');
      }
    };
    
    const handleStorage = async (event: StorageEvent) => {
      if (event.key === 'oauth_success') {
        await fetchUserData();
        navigate('/dashboard');
      }
    };

    window.addEventListener('message', handleMessage);
    window.addEventListener('storage', handleStorage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('storage', handleStorage);
    };
  }, [navigate]);

  useEffect(() => {
    if (user && location.pathname === '/') {
      navigate('/dashboard');
    }
  }, [user, location.pathname, navigate]);

  const handleLogin = async () => {
    try {
      const response = await fetch('/api/auth/url');
      if (!response.ok) {
        throw new Error('Failed to get auth URL');
      }
      const { url } = await response.json();
      
      const authWindow = window.open(
        url,
        'oauth_popup',
        'width=600,height=700'
      );

      if (!authWindow) {
        alert('Please allow popups for this site to connect your account.');
      }
    } catch (error) {
      console.error('OAuth error:', error);
      setError('Failed to initiate login.');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      localStorage.removeItem('oauth_success'); // Clear the storage event trigger
      setUser(null);
      setRepositories([]);
      setGrowthData([]);
      setRadarData(null);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleAnalyze = async (code: string, source: string) => {
    setIsAnalyzing(true);
    setError(null);
    navigate('/dashboard'); // Switch to dashboard view to show loading spinner
    
    try {
      const result = await analyzeCode(code);
      setReportData(result);
      setActiveTab('dashboard'); // Switch to dashboard on success
      
      if (user) {
        const newGrowthEntry = {
          date: new Date().toISOString(),
          score: result.code_review.score,
          source: source
        };
        const newGrowthData = [...growthData, newGrowthEntry];
        
        // Average the new skill radar with the existing one, or just use the new one if none exists
        const newRadarData = (radarData && Object.keys(radarData).length > 0 && typeof radarData.frontend === 'number' && !isNaN(radarData.frontend)) ? {
          frontend: Math.round(((radarData.frontend || 0) + result.skill_radar.frontend) / 2),
          backend: Math.round(((radarData.backend || 0) + result.skill_radar.backend) / 2),
          devops: Math.round(((radarData.devops || 0) + result.skill_radar.devops) / 2),
          security: Math.round(((radarData.security || 0) + result.skill_radar.security) / 2),
          design: Math.round(((radarData.design || 0) + result.skill_radar.design) / 2),
          architecture: Math.round(((radarData.architecture || 0) + result.skill_radar.architecture) / 2),
        } : result.skill_radar;
        
        setGrowthData(newGrowthData);
        setRadarData(newRadarData);
        
        await fetch('/api/user/data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            growthData: newGrowthData,
            radarData: newRadarData
          })
        });
      }
    } catch (err) {
      console.error(err);
      setError("Failed to analyze code. Please try again.");
      navigate('/'); // Go back to home on error
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGithubAudit = async (url: string) => {
    if (!url) return;
    setIsAnalyzing(true);
    setError(null);
    navigate('/dashboard'); // Switch to dashboard view to show loading spinner
    
    try {
      const code = await fetchGithubRepo(url);
      await handleAnalyze(code, url);
    } catch (err: any) {
      setError(err.message || "Failed to fetch GitHub repository.");
      setIsAnalyzing(false);
      navigate('/'); // Go back to home on error
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        handleAnalyze(e.target.result as string, file.name);
      }
    };
    reader.readAsText(file);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-400";
    if (score >= 70) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return "bg-emerald-400/10 border-emerald-400/20";
    if (score >= 70) return "bg-yellow-400/10 border-yellow-400/20";
    return "bg-red-400/10 border-red-400/20";
  };

  // Render functions for different tabs
  const renderContent = () => {
    if (isAnalyzing) {
      return (
        <div className="flex-1 flex items-center justify-center h-full">
          <LoadingSpinner />
        </div>
      );
    }

    if (!reportData && activeTab !== 'dashboard') {
      const hasRadarData = activeTab === 'radar' && radarData && Object.keys(radarData).length > 0;
      const hasGrowthData = activeTab === 'growth' && growthData && growthData.length > 0;
      
      if (!hasRadarData && !hasGrowthData) {
        return (
          <div className="flex-1 flex flex-col items-center justify-center h-full text-slate-500 space-y-4">
            <Code className="w-16 h-16 opacity-20" />
            <p className="text-lg">No data available. Please analyze a repository first.</p>
            <button 
              onClick={() => setActiveTab('dashboard')}
              className="px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-lg hover:bg-emerald-500/20 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        );
      }
    }

    if (activeTab === 'analyzer') {
      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl mx-auto w-full space-y-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Code Analyzer</h1>
              <p className="text-slate-400 mt-1">Detailed code review and architectural feedback.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={cn("backdrop-blur-md border rounded-2xl p-6 flex flex-col justify-center items-center gap-4 text-center", getScoreBg(reportData.code_review.score))}>
              <Award className={cn("w-12 h-12", getScoreColor(reportData.code_review.score))} />
              <div>
                <p className="text-slate-400 text-sm font-mono uppercase tracking-wider mb-1">Quality Score</p>
                <h3 className={cn("text-5xl font-bold", getScoreColor(reportData.code_review.score))}>
                  {reportData.code_review.score}/100
                </h3>
              </div>
            </div>
            <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6 flex flex-col justify-center items-center gap-4 text-center">
              <Terminal className="w-12 h-12 text-blue-400" />
              <div>
                <p className="text-slate-400 text-sm font-mono uppercase tracking-wider mb-1">Primary Tech Stack</p>
                <h3 className="text-3xl font-bold text-white">{reportData.tech_stack.language}</h3>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Strengths Card */}
            <div className="bg-[#131825] rounded-2xl p-8 border border-emerald-500/20 relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
              <div className="absolute -top-6 -right-6 p-8 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                <CheckCircle2 className="w-40 h-40 text-emerald-500" />
              </div>
              <div className="flex items-center gap-3 mb-8 relative z-10">
                <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </div>
                <h2 className="text-lg font-bold text-white tracking-wide">Strengths</h2>
              </div>
              <ul className="space-y-5 relative z-10">
                {reportData.code_review.positive_observations.map((item, i) => (
                  <li key={i} className="flex items-start gap-4 text-slate-300 text-[14px] leading-relaxed">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                    <span>{formatText(item)}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses Card */}
            <div className="bg-[#131825] rounded-2xl p-8 border border-red-500/20 relative overflow-hidden group hover:border-red-500/40 transition-colors">
              <div className="absolute -top-6 -right-6 p-8 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                <AlertTriangle className="w-40 h-40 text-red-500" />
              </div>
              <div className="flex items-center gap-3 mb-8 relative z-10">
                <div className="p-2.5 bg-red-500/10 rounded-xl border border-red-500/20">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <h2 className="text-lg font-bold text-white tracking-wide">Areas for Improvement</h2>
              </div>
              <ul className="space-y-5 relative z-10">
                {reportData.code_review.weaknesses?.length ? (
                  reportData.code_review.weaknesses.map((item, i) => (
                    <li key={i} className="flex items-start gap-4 text-slate-300 text-[14px] leading-relaxed">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-400 shrink-0 shadow-[0_0_8px_rgba(248,113,113,0.8)]" />
                      <span>{formatText(item)}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-slate-500 italic text-sm">No major weaknesses identified.</li>
                )}
              </ul>
            </div>
          </div>

          {/* Refactoring Suggestions Card */}
          <div className="bg-[#131825] rounded-2xl p-8 border border-amber-500/20 relative overflow-hidden group hover:border-amber-500/40 transition-colors">
            <div className="absolute -top-10 -right-10 p-8 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
              <Lightbulb className="w-64 h-64 text-amber-500" />
            </div>
            <div className="flex items-center gap-3 mb-8 relative z-10">
              <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20">
                <Lightbulb className="w-5 h-5 text-amber-400" />
              </div>
              <h2 className="text-lg font-bold text-white tracking-wide">Refactoring Suggestions</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
              {reportData.code_review.refactoring_suggestions.map((item, i) => (
                <div key={i} className="flex items-start gap-4 text-slate-300 text-[14px] leading-relaxed p-5 bg-slate-900/50 rounded-xl border border-slate-800 hover:border-amber-500/30 transition-colors">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                  <span>{formatText(item)}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      );
    }



    switch (activeTab) {
      case 'dashboard':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl mx-auto w-full space-y-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
              <p className="text-slate-400">
                {reportData ? "Overview of your latest code audit." : "Select a repository to analyze or view your stats."}
              </p>
            </div>

            {user && (
              <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-8 mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Github className="w-5 h-5 text-slate-400" />
                    Your Repositories
                  </h3>
                </div>
                {isLoadingRepos ? (
                  <div className="flex justify-center py-12">
                    <LoadingSpinner />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {repositories.map((repo) => (
                      <button
                        key={repo.id}
                        onClick={() => handleGithubAudit(repo.html_url)}
                        disabled={isAnalyzing}
                        className="flex flex-col items-start p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 hover:border-emerald-500/50 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed group"
                      >
                        <div className="flex items-center gap-2 mb-2 w-full">
                          <Github className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                          <span className="font-bold text-slate-200 truncate">{repo.name}</span>
                        </div>
                        {repo.description && (
                          <p className="text-sm text-slate-400 line-clamp-2 mb-3">{repo.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-auto text-xs text-slate-500">
                          {repo.language && (
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                              {repo.language}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            {repo.stargazers_count}
                          </span>
                        </div>
                      </button>
                    ))}
                    {repositories.length === 0 && (
                      <div className="col-span-full text-center py-8 text-slate-500">
                        No repositories found.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        );
      case 'radar': {
        // Use radarData from state if available, otherwise reportData, otherwise fallback
        const radarScores = (radarData && Object.keys(radarData).length > 0 && typeof radarData.frontend === 'number' && !isNaN(radarData.frontend)) ? radarData : (reportData?.skill_radar || {
          frontend: 45,
          backend: 85,
          devops: 30,
          security: 50,
          design: 25,
          architecture: 70
        });

        const chartData = [
          { subject: 'Frontend', A: Number(radarScores.frontend) || 0, fullMark: 100 },
          { subject: 'Backend', A: Number(radarScores.backend) || 0, fullMark: 100 },
          { subject: 'DevOps', A: Number(radarScores.devops) || 0, fullMark: 100 },
          { subject: 'Security', A: Number(radarScores.security) || 0, fullMark: 100 },
          { subject: 'Design', A: Number(radarScores.design) || 0, fullMark: 100 },
          { subject: 'Architecture', A: Number(radarScores.architecture) || 0, fullMark: 100 },
        ];

        // Sort skills to separate Top Strengths from Areas for Growth
        const sortedSkills = [...chartData].sort((a, b) => b.A - a.A);
        const topStrengths = sortedSkills.filter(s => s.A >= 70);
        // If none are >= 70, just take the top 1
        if (topStrengths.length === 0) topStrengths.push(sortedSkills[0]);
        
        const areasForGrowth = sortedSkills.filter(s => !topStrengths.includes(s));

        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto w-full space-y-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white tracking-tight">Skill Radar</h1>
              <p className="text-slate-400">Visualizing your technical strengths based on your latest analysis.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Radar Chart Card */}
              <div className="lg:col-span-2 bg-[#131825] rounded-2xl p-6 border border-slate-800/50 min-h-[400px] w-full min-w-0">
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                      itemStyle={{ color: '#10b981' }}
                    />
                    <Radar
                      name="Skills"
                      dataKey="A"
                      stroke="#10b981"
                      strokeWidth={2}
                      fill="#10b981"
                      fillOpacity={0.3}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Strengths & Growth Cards */}
              <div className="space-y-6">
                {/* Top Strengths */}
                <div className="bg-[#131825] rounded-2xl p-6 border border-slate-800/50">
                  <h3 className="text-emerald-400 font-bold mb-6">Top Strengths</h3>
                  <div className="space-y-4">
                    {topStrengths.map((skill) => (
                      <div key={skill.subject} className="flex items-center justify-between gap-4">
                        <span className="text-white font-medium text-sm w-24">{skill.subject}</span>
                        <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-400 rounded-full" 
                            style={{ width: `${skill.A}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Areas for Growth */}
                <div className="bg-[#131825] rounded-2xl p-6 border border-slate-800/50">
                  <h3 className="text-yellow-400 font-bold mb-6">Areas for Growth</h3>
                  <div className="space-y-4">
                    {areasForGrowth.map((skill) => (
                      <div key={skill.subject} className="flex items-center justify-between gap-4">
                        <span className="text-white font-medium text-sm w-24">{skill.subject}</span>
                        <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-yellow-400 rounded-full" 
                            style={{ width: `${skill.A}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );
      }
      case 'learning': {
        // Fallback data in case the user hasn't re-analyzed since the schema update
        const learningPath = reportData.learning_path || {
          focus_area: "Full-Stack Development",
          reasoning: "Based on your code, you have a good foundation but could benefit from understanding the full request lifecycle.",
          roadmap: [
            {
              step: 1,
              title: "Master Frontend Fundamentals",
              description: "Ensure a deep understanding of React, state management, and component architecture.",
              resources: ["React Official Docs", "Advanced State Management"]
            },
            {
              step: 2,
              title: "Explore Backend Basics",
              description: "Learn how to build simple REST APIs using Node.js and Express.",
              resources: ["Node.js Crash Course", "Express.js Routing"]
            },
            {
              step: 3,
              title: "Database Integration",
              description: "Connect your backend to a database (SQL or NoSQL) to persist data.",
              resources: ["PostgreSQL Basics", "MongoDB for Beginners"]
            }
          ]
        };

        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl mx-auto w-full space-y-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white tracking-tight">Learning Path</h1>
              <p className="text-slate-400">Your personalized roadmap based on industry trends and your code analysis.</p>
            </div>

            {/* Focus Area Card */}
            <div className="bg-gradient-to-br from-emerald-900/40 to-slate-900 border border-emerald-500/20 rounded-2xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Target className="w-32 h-32 text-emerald-400" />
              </div>
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-sm font-bold tracking-wide uppercase mb-4">
                  Primary Focus
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">{learningPath.focus_area}</h2>
                <p className="text-slate-300 leading-relaxed max-w-3xl text-lg">
                  {learningPath.reasoning}
                </p>
              </div>
            </div>

            {/* Roadmap Timeline */}
            <div className="mt-12">
              <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-2">
                <GraduationCap className="w-6 h-6 text-blue-400" />
                Recommended Roadmap
              </h3>
              
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-emerald-500 before:via-blue-500 before:to-slate-800">
                {learningPath.roadmap.map((step, index) => (
                  <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    {/* Icon */}
                    <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-[#0A0A0B] bg-slate-800 text-slate-400 group-[.is-active]:bg-emerald-500 group-[.is-active]:text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                      <span className="font-bold">{step.step}</span>
                    </div>
                    
                    {/* Card */}
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-6 rounded-2xl bg-[#131825] border border-slate-800/50 shadow-xl transition-all hover:border-slate-700">
                      <h4 className="text-xl font-bold text-white mb-2">{step.title}</h4>
                      <p className="text-slate-400 mb-6 leading-relaxed">
                        {step.description}
                      </p>
                      
                      {step.resources && step.resources.length > 0 && (
                        <div>
                          <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Recommended Topics</h5>
                          <div className="flex flex-wrap gap-2">
                            {step.resources.map((resource, i) => (
                              <span key={i} className="px-3 py-1.5 bg-slate-800/80 text-slate-300 text-sm rounded-lg border border-slate-700/50 flex items-center gap-2">
                                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                                {resource}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        );
      }
      case 'resume':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto w-full space-y-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Resume Generator</h1>
                <p className="text-slate-400">Create professional resumes with AI-generated content.</p>
              </div>
              <button
                onClick={handlePrint}
                className="hidden md:flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm shadow-lg shadow-emerald-900/20"
              >
                <Printer size={16} />
                Export PDF
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column: Controls (Mobile Tabs + Desktop Sidebar) */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Mobile Tab Switcher */}
                <div className="lg:hidden flex bg-[#131825] p-1 rounded-xl shadow-sm border border-slate-800 mb-6">
                  <button
                    onClick={() => setResumeActiveTab('edit')}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                      resumeActiveTab === 'edit' ? 'bg-slate-800 text-emerald-400 shadow-sm' : 'text-slate-400 hover:bg-slate-800/50'
                    }`}
                  >
                    <PenTool size={16} /> Edit
                  </button>
                  <button
                    onClick={() => setResumeActiveTab('preview')}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                      resumeActiveTab === 'preview' ? 'bg-slate-800 text-emerald-400 shadow-sm' : 'text-slate-400 hover:bg-slate-800/50'
                    }`}
                  >
                    <LayoutTemplate size={16} /> Preview
                  </button>
                </div>

                {/* Editor Section */}
                <div className={`${resumeActiveTab === 'edit' ? 'block' : 'hidden'} lg:block space-y-6`}>
                  <div className="bg-[#131825] p-6 rounded-xl shadow-sm border border-slate-800">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
                      <LayoutTemplate size={18} className="text-emerald-400" />
                      Choose Template
                    </h2>
                    <TemplateSelector currentTemplate={template} onSelect={setTemplate} />
                  </div>

                  <ResumeForm 
                    data={resumeData} 
                    updateData={setResumeData} 
                    onAutoFill={handleAutoFill}
                  />
                </div>
              </div>

              {/* Right Column: Preview */}
              <div className={`lg:col-span-7 ${resumeActiveTab === 'preview' ? 'block' : 'hidden'} lg:block`}>
                <div className="sticky top-24">
                  <div className="bg-slate-900 rounded-xl shadow-2xl overflow-hidden border border-slate-800">
                    <div className="bg-[#0A0A0B] px-4 py-3 border-b border-slate-800 flex justify-between items-center">
                      <span className="text-slate-400 text-xs font-mono">Live Preview</span>
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                      </div>
                    </div>
                    
                    {/* A4 Aspect Ratio Container */}
                    <div className="relative w-full bg-slate-800/50 overflow-auto max-h-[calc(100vh-12rem)] p-4 md:p-8 flex justify-center">
                      <motion.div
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="bg-white shadow-lg w-full max-w-[210mm] min-h-[297mm] origin-top transform transition-transform"
                        style={{ aspectRatio: '210/297' }}
                      >
                        <div ref={printRef} className="h-full w-full">
                          <ResumePreview data={resumeData} template={template} />
                        </div>
                      </motion.div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-center lg:hidden">
                     <button
                      onClick={handlePrint}
                      className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-emerald-700 transition-colors font-medium"
                    >
                      <Printer size={18} />
                      Export PDF
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        );
      case 'architecture':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto w-full space-y-8 h-full flex flex-col items-center">
            <div className="mb-8 shrink-0 w-full">
              <h1 className="text-3xl font-bold text-white tracking-tight">Architecture Graph</h1>
              <p className="text-slate-400">Visual representation of your project's components and their relationships.</p>
            </div>
            
            <div className="w-full max-w-[900px] aspect-square">
              {reportData.architecture_graph ? (
                <ArchitectureGraph data={reportData.architecture_graph} />
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-16 border border-dashed border-slate-700 rounded-2xl bg-slate-900/30 text-center">
                  <Cpu className="w-16 h-16 text-slate-600 mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">No Architecture Data</h3>
                  <p className="text-slate-400 max-w-md">
                    The analysis did not generate an architecture graph for this project. Try analyzing a different repository.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        );
      case 'growth':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl mx-auto w-full space-y-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white tracking-tight">Growth</h1>
              <p className="text-slate-400">Track your progress over time.</p>
            </div>
            
            {growthData && growthData.length > 0 ? (
              <div className="space-y-8">
                {/* Chart Section */}
                <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-8">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                    Score Progression
                  </h3>
                  <div className="h-[300px] w-full min-w-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={growthData.map(d => ({ ...d, displayDate: new Date(d.date).toLocaleDateString() }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                        <XAxis dataKey="displayDate" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                        <YAxis domain={[0, 100]} stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                          itemStyle={{ color: '#10b981' }}
                        />
                        <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', strokeWidth: 2 }} activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* History List */}
                <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-8">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                    Analysis History
                  </h3>
                  <div className="space-y-4">
                    {growthData.slice().reverse().map((entry: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                        <div>
                          <p className="font-medium text-white">{entry.source}</p>
                          <p className="text-sm text-slate-400">{new Date(entry.date).toLocaleDateString()}</p>
                        </div>
                        <div className={cn("px-4 py-2 rounded-lg font-bold text-lg", getScoreBg(entry.score), getScoreColor(entry.score))}>
                          {entry.score}/100
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-16 border border-dashed border-slate-700 rounded-2xl bg-slate-900/30 text-center">
                <TrendingUp className="w-16 h-16 text-slate-600 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No Data Yet</h3>
                <p className="text-slate-400 max-w-md">
                  Analyze a repository to start tracking your code quality improvements over time.
                </p>
              </div>
            )}
          </motion.div>
        );
      default:
        return null;
    }
  };

  const renderHome = () => (
    <div className="min-h-screen bg-[#0A0A0B] flex flex-col relative overflow-hidden selection:bg-emerald-500/30">
      {/* Background Gradients */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[120px]" />
      </div>

      {/* Header */}
      <div className="relative z-10 border-b border-slate-800/50">
        <header className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10">
              <LayoutDashboard className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">
              Portfolio<span className="text-emerald-400">Path</span>
            </span>
          </div>
          <div className="flex items-center gap-6">
            <a 
              href="https://github.com/AlbertCJC/PortfolioPath" 
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              <Github className="w-4 h-4" />
              View Source
            </a>
            <div className="w-px h-4 bg-slate-800"></div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              AI Powered
            </div>
          </div>
        </header>
      </div>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center max-w-4xl mx-auto w-full mt-[-8vh]">
        <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-6 leading-tight">
          Turn Your Code Into<br />
          <span className="text-emerald-400">
            Career Gold
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl leading-relaxed">
          Upload your project code. Our AI auditor evaluates quality, performance, and generates resume-ready bullet points instantly.
        </p>

        <div className="w-full max-w-2xl flex flex-col items-center gap-6">
          {!user && (
            <button
              onClick={handleLogin}
              className="px-8 py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-3 text-lg shadow-lg"
            >
              <Github className="w-6 h-6" />
              Login with GitHub
            </button>
          )}

          {/* OR divider removed */}

{/* Inputs removed as per request */}

          {error && (
            <div className="mt-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm w-full">
              {error}
            </div>
          )}
        </div>
      </main>
    </div>
  );

  const renderDashboardLayout = () => (
    <div className="flex h-screen bg-[#0A0A0B] text-slate-200 overflow-hidden selection:bg-emerald-500/30">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800/50 bg-[#0A0A0B] flex flex-col z-20">
        <div className="h-16 flex items-center px-6 border-b border-slate-800/50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10">
              <LayoutDashboard className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="font-bold text-lg tracking-tight text-white">
              Portfolio<span className="text-emerald-400">Path</span>
            </span>
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-sm" 
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent"
                )}
              >
                <Icon className={cn("w-4 h-4", isActive ? "text-emerald-400" : "text-slate-500")} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800/50 space-y-2">
          {user && (
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-400 hover:text-red-300 transition-colors rounded-lg hover:bg-red-500/10"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          )}
          <a 
            href="https://github.com/AlbertCJC/PortfolioPath" 
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800/50"
          >
            <Github className="w-4 h-4" />
            View Source
          </a>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative">
        {/* Background Gradients */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/5 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[120px]" />
        </div>

        {/* Analyze New Code Button removed */}

        <div className="relative z-10 p-8 md:p-12 min-h-full flex flex-col pt-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab + (isAnalyzing ? '-loading' : '')}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );

  return (
    <Routes>
      <Route path="/" element={renderHome()} />
      <Route path="/dashboard" element={renderDashboardLayout()} />
    </Routes>
  );
}

export default App;
