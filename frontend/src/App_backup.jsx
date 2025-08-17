import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
import ChatSystem from './components/ChatSystem';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('scoreboard');
  const [scoreboardView, setScoreboardView] = useState('main'); // main, full, stats, live
  const [comparisonMode, setComparisonMode] = useState(false);
  const [selectedTeamsForComparison, setSelectedTeamsForComparison] = useState([]);
  const [scoreboardFilter, setScoreboardFilter] = useState('all'); // 'all' or 'active'
  const [challengeStatsView, setChallengeStatsView] = useState(false);
  const [liveGraphView, setLiveGraphView] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  // Mock user data
  const user = {
    id: 'user_1',
    username: 'EcoNinja',
    team_id: 'team_1',
    team_name: 'EcoNinjas',
    is_admin: false,
    points: 2850
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
  const handleViewAllTeams = () => {
    setScoreboardView('full');
    setScoreboardFilter('all');
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

  const renderContent = () => {
    if (currentPage === 'challenges') {
      return <Challenges />;
    } else if (currentPage === 'team') {
      return <TeamDetails onBack={() => setCurrentPage('scoreboard')} />;
    } else if (currentPage === 'profile') {
      return <UserProfile onBack={() => setCurrentPage('scoreboard')} />;
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
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Matrix Rain Background */}
      <MatrixRain />
      
      {/* Hero Background Image */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{ backgroundImage: 'url(/heromap.jpg)' }}
      />
      
      {/* Dark overlay for better text readability */}
      <div className="fixed inset-0 bg-black/60" />
      
      {/* Main Content */}
      <div className="relative z-10">
        <Navigation 
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          user={user}
          onTeamClick={handleTeamClick}
          onProfileClick={handleProfileClick}
        />
        
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          {renderContent()}
        </motion.main>
      </div>

      {/* Chat System */}
      <ChatSystem 
        user={user}
        isOpen={chatOpen}
        onToggle={() => setChatOpen(!chatOpen)}
      />
    </div>
  );
}

export default App;

