import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { usePlatformConfig } from './hooks/usePlatformConfig';
import DynamicHead from './components/DynamicHead';
import MatrixRain from './components/MatrixRain';
import Navigation from './components/Navigation';
import Scoreboard from './components/Scoreboard';
import ScoreboardFull from './components/ScoreboardFull';
import ChallengeStats from './components/ChallengeStats';
import LiveScoreboardGraphSimple from './components/LiveScoreboardGraphSimple';
import EmbeddedLiveGraph from './components/EmbeddedLiveGraph';
import ComparisonMode from './components/ComparisonMode';
import Challenges from './components/Challenges';
import TeamDetails from './components/TeamDetails';
import UserProfile from './components/UserProfile';
import EnhancedChatSystem from './components/EnhancedChatSystem';
import AdminPanel from './components/AdminPanel';
import AdminPanelCTF from './components/AdminPanelCTF';
import AdminLogin from './components/AdminLogin';
import EcoCounter from './components/EcoCounter';
import MusicPlayer from './components/MusicPlayer';
import LandingPage from './components/LandingPage';
import SignUp from './components/SignUp';
import SignIn from './components/SignIn';
import TeamManagement from './components/TeamManagement';
import './App.css';

function App() {
  const { config: platformConfig, loading: configLoading, refreshConfig } = usePlatformConfig();
  const [currentPage, setCurrentPage] = useState('landing');
  const [authPage, setAuthPage] = useState('landing'); // 'landing', 'signin', 'signup'
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [scoreboardView, setScoreboardView] = useState('main'); // main, full, stats, live
  const [comparisonMode, setComparisonMode] = useState(false);
  const [selectedTeamsForComparison, setSelectedTeamsForComparison] = useState([]);
  const [scoreboardFilter, setScoreboardFilter] = useState('all'); // 'all' or 'active'
  const [challengeStatsView, setChallengeStatsView] = useState(false);
  const [liveGraphView, setLiveGraphView] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [adminPanelOpen, setAdminPanelOpen] = useState(false);
  const [ctfAdminPanelOpen, setCtfAdminPanelOpen] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  // Check for existing authentication on app load
  useEffect(() => {
    const token = localStorage.getItem('ctf_token');
    const userData = localStorage.getItem('ctf_user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
        setCurrentPage('home');
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('ctf_token');
        localStorage.removeItem('ctf_user');
      }
    }
  }, []);

  // Authentication handlers
  const handleSignUp = (userData) => {
    const mockUser = {
      id: 'user_' + Date.now(),
      username: userData.username,
      email: userData.email,
      team_name: userData.teamName || null,
      team_id: userData.teamName ? 'team_' + Date.now() : null,
      is_admin: false,
      points: 0,
      hasTeam: !!userData.teamName
    };
    
    // Store mock token and user data
    localStorage.setItem('ctf_token', 'mock_token_' + Date.now());
    localStorage.setItem('ctf_user', JSON.stringify(mockUser));
    
    setUser(mockUser);
    setIsAuthenticated(true);
    setCurrentPage('home');
  };

  const handleSignIn = (userData) => {
    const mockUser = {
      id: 'user_1',
      username: userData.username,
      email: userData.email,
      team_name: userData.teamName,
      is_admin: true, // Set to true for demo
      points: userData.points || 2850
    };
    
    // Store mock token and user data
    localStorage.setItem('ctf_token', 'mock_token_signin');
    localStorage.setItem('ctf_user', JSON.stringify(mockUser));
    
    setUser(mockUser);
    setIsAuthenticated(true);
    setCurrentPage('home');
  };

  const handleLogout = () => {
    localStorage.removeItem('ctf_token');
    localStorage.removeItem('ctf_user');
    setUser(null);
    setIsAuthenticated(false);
    setCurrentPage('landing');
    setAuthPage('landing');
  };

  const handleUpdateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('ctf_user', JSON.stringify(updatedUser));
  };

  // Comparison mode handlers
  const handleViewComparison = (selectedTeams = []) => {
    setSelectedTeamsForComparison(selectedTeams);
    setComparisonMode(true);
  };

  const handleBackFromComparison = () => {
    setComparisonMode(false);
    setSelectedTeamsForComparison([]);
  };

  // Scoreboard navigation handlers
  const handleViewAllTeams = (filter = 'all') => {
    setScoreboardView('full');
    setScoreboardFilter(filter);
  };

  const handleViewActiveTeams = () => {
    setScoreboardView('full');
    setScoreboardFilter('active');
  };

  const handleViewChallengeStats = () => {
    setChallengeStatsView(true);
  };

  const handleViewLiveGraph = () => {
    setLiveGraphView(true);
  };

  const handleBackToScoreboard = () => {
    setScoreboardView('main');
    setChallengeStatsView(false);
    setLiveGraphView(false);
    setComparisonMode(false);
  };

  const handleTeamClick = (teamName) => {
    setCurrentPage('team');
    // You can add team-specific logic here
  };

  const handleProfileClick = () => {
    setCurrentPage('profile');
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Reset all sub-views when changing main pages
    if (page !== 'scoreboard') {
      setScoreboardView('main');
      setChallengeStatsView(false);
      setLiveGraphView(false);
      setComparisonMode(false);
    }
  };

  const renderContent = () => {
    // If not authenticated, show authentication pages
    if (!isAuthenticated) {
      if (authPage === 'signup') {
        return (
          <SignUp 
            onSignUp={handleSignUp}
            onBackToLanding={() => setAuthPage('landing')}
            onSwitchToSignIn={() => setAuthPage('signin')}
          />
        );
      } else if (authPage === 'signin') {
        return (
          <SignIn 
            onSignIn={handleSignIn}
            onBackToLanding={() => setAuthPage('landing')}
            onSwitchToSignUp={() => setAuthPage('signup')}
          />
        );
      } else {
        return (
          <LandingPage 
            onSignIn={() => setAuthPage('signin')}
            onSignUp={() => setAuthPage('signup')}
          />
        );
      }
    }

    // Authenticated user pages
    if (currentPage === 'home') {
      return (
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <h1 
              className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r bg-clip-text text-transparent"
              style={{ 
                backgroundImage: `linear-gradient(to right, ${platformConfig.primary_color}, ${platformConfig.secondary_color})` 
              }}
            >
              {platformConfig.platform_name}
            </h1>
            <p 
              className="text-2xl md:text-3xl mb-8"
              style={{ color: platformConfig.primary_color }}
            >
              {platformConfig.platform_subtitle}
            </p>
            <p className="text-lg md:text-xl mb-12 text-gray-300 max-w-2xl mx-auto">
              Join the ultimate cybersecurity challenge where every solved problem contributes to environmental awareness. 
              Compete with teams worldwide while making a positive impact on our planet.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentPage('challenges')}
                  className="px-8 py-4 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                  style={{ 
                    background: `linear-gradient(to right, ${platformConfig.primary_color}, ${platformConfig.secondary_color})` 
                  }}
                >
                  Start Challenges
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentPage('scoreboard')}
                  className="px-8 py-4 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                  style={{ 
                    background: `linear-gradient(to right, ${platformConfig.secondary_color}, ${platformConfig.primary_color})` 
                  }}
                >
                  View Scoreboard
                </motion.button>
            </div>
          </motion.div>
        </div>
      );
    } else if (currentPage === 'challenges') {
      return <Challenges />;
    } else if (currentPage === 'team') {
      return <TeamDetails user={user} onBack={() => setCurrentPage('scoreboard')} />;
    } else if (currentPage === 'profile') {
      return <UserProfile user={user} onBack={() => setCurrentPage('home')} />;
    } else if (currentPage === 'team-management') {
      return (
        <TeamManagement 
          user={user} 
          onUpdateUser={handleUpdateUser}
          onBack={() => setCurrentPage('profile')} 
        />
      );
    } else if (currentPage === 'scoreboard') {
      if (comparisonMode) {
        return (
          <ComparisonMode 
            onBack={handleBackFromComparison}
            selectedTeams={selectedTeamsForComparison}
          />
        );
      } else if (liveGraphView) {
        return (
          <LiveScoreboardGraphSimple 
            onBack={handleBackToScoreboard}
            onViewComparison={handleViewComparison}
          />
        );
      } else if (scoreboardView === 'full') {
        return (
          <ScoreboardFull 
            onBack={handleBackToScoreboard}
            filter={scoreboardFilter}
          />
        );
      } else if (challengeStatsView) {
        return (
          <ChallengeStats 
            onBack={handleBackToScoreboard}
          />
        );
      } else {
        return (
          <Scoreboard 
            onViewAllTeams={handleViewAllTeams}
            onViewActiveTeams={handleViewActiveTeams}
            onViewChallengeStats={handleViewChallengeStats}
            onViewLiveGraph={handleViewLiveGraph}
            onTeamClick={handleTeamClick}
          />
        );
      }
    }
    
    return <Scoreboard />;
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Dynamic Head Updates */}
      <DynamicHead platformConfig={platformConfig} />
      
      {/* Matrix Rain Background */}
      <MatrixRain />
      
      {/* Hero Background Image */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url(${platformConfig.background_image || '/heromap.jpg'})`,
          opacity: platformConfig.background_opacity || 0.2
        }}
      />
      
      {/* Dark overlay for better text readability */}
      <div 
        className="fixed inset-0 bg-black"
        style={{ opacity: platformConfig.background_overlay || 0.6 }}
      />
      
      {/* Main Content */}
      <div className="relative z-10">
        {isAuthenticated && (
          <Navigation 
            currentPage={currentPage}
            onPageChange={handlePageChange}
            user={user}
            onTeamClick={handleTeamClick}
            onProfileClick={handleProfileClick}
            onLogout={handleLogout}
            onOpenCtfAdmin={() => setShowAdminLogin(true)}
            platformConfig={platformConfig}
          />
        )}
        
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          {renderContent()}
        </motion.main>
      </div>

      {/* Enhanced Chat System */}
      {isAuthenticated && platformConfig.chat_enabled && (
        <EnhancedChatSystem 
          user={user}
          isOpen={isChatOpen}
          onToggle={() => setIsChatOpen(!isChatOpen)}
          isAdmin={user?.is_admin || false}
        />
      )}

      {/* Admin Panel */}
      {isAuthenticated && user?.is_admin && (
        <AdminPanel 
          user={user}
          isOpen={adminPanelOpen}
          onToggle={() => setAdminPanelOpen(!adminPanelOpen)}
        />
      )}

      {/* Environmental Impact Counter - Only show when authenticated and enabled */}
      {isAuthenticated && platformConfig.environment_globe_enabled && <EcoCounter />}

      {/* Music Player - Only show when enabled */}
      {platformConfig.music_enabled && <MusicPlayer />}

      {/* CTF Admin Panel */}
      {ctfAdminPanelOpen && (
        <AdminPanelCTF onClose={() => setCtfAdminPanelOpen(false)} />
      )}

      {/* Admin Login Modal */}
      {showAdminLogin && (
        <AdminLogin
          onLoginSuccess={() => {
            setShowAdminLogin(false);
            setCtfAdminPanelOpen(true);
          }}
          onClose={() => setShowAdminLogin(false)}
        />
      )}
    </div>
  );
}

export default App;

