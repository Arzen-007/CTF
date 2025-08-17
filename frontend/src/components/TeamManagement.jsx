import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Mail, Search, UserPlus } from 'lucide-react';

const TeamManagement = ({ user, onUpdateUser, onBack }) => {
  const [activeTab, setActiveTab] = useState('create'); // 'create', 'join', 'invite'
  const [formData, setFormData] = useState({
    teamName: '',
    teamCode: '',
    inviteEmail: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!formData.teamName.trim()) {
      setErrors({ teamName: 'Team name is required' });
      return;
    }

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const updatedUser = {
        ...user,
        team_name: formData.teamName,
        team_id: 'team_' + Date.now(),
        hasTeam: true,
        isTeamLeader: true
      };
      
      localStorage.setItem('ctf_user', JSON.stringify(updatedUser));
      onUpdateUser(updatedUser);
    } catch (error) {
      setErrors({ submit: 'Failed to create team. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinTeam = async (e) => {
    e.preventDefault();
    if (!formData.teamCode.trim()) {
      setErrors({ teamCode: 'Team code is required' });
      return;
    }

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const updatedUser = {
        ...user,
        team_name: 'Joined Team', // Mock team name
        team_id: 'team_joined_' + Date.now(),
        hasTeam: true,
        isTeamLeader: false
      };
      
      localStorage.setItem('ctf_user', JSON.stringify(updatedUser));
      onUpdateUser(updatedUser);
    } catch (error) {
      setErrors({ submit: 'Invalid team code. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const TabButton = ({ id, label, icon: Icon }) => (
    <motion.button
      onClick={() => setActiveTab(id)}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
        activeTab === id
          ? 'bg-green-600 text-white'
          : 'bg-green-900/30 text-green-300 hover:bg-green-900/50'
      }`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Icon size={18} />
      <span>{label}</span>
    </motion.button>
  );

  return (
    <div className="relative z-10 min-h-screen p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="mb-4 flex items-center text-green-400 hover:text-green-300 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Profile
          </button>
          
          <h1 className="text-3xl font-bold text-green-400 mb-2">Team Management</h1>
          <p className="text-gray-300">Create a new team or join an existing one</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-2 mb-8">
          <TabButton id="create" label="Create Team" icon={Plus} />
          <TabButton id="join" label="Join Team" icon={Search} />
        </div>

        {/* Content */}
        <div className="bg-green-900/20 backdrop-blur-sm border border-green-500/30 rounded-lg p-8">
          {activeTab === 'create' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-6">
                <Users className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-green-400 mb-2">Create Your Team</h2>
                <p className="text-gray-300">Start your own team and invite other eco-hackers</p>
              </div>

              <form onSubmit={handleCreateTeam} className="space-y-6">
                <div>
                  <label htmlFor="teamName" className="block text-sm font-medium text-green-300 mb-2">
                    Team Name
                  </label>
                  <input
                    type="text"
                    id="teamName"
                    name="teamName"
                    value={formData.teamName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-green-900/30 border border-green-500/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                    placeholder="Enter your team name"
                  />
                  {errors.teamName && (
                    <p className="mt-1 text-sm text-red-400">{errors.teamName}</p>
                  )}
                </div>

                {errors.submit && (
                  <p className="text-sm text-red-400 text-center">{errors.submit}</p>
                )}

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: isLoading ? 1 : 1.02 }}
                  whileTap={{ scale: isLoading ? 1 : 0.98 }}
                  className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Creating Team...
                    </div>
                  ) : (
                    'Create Team'
                  )}
                </motion.button>
              </form>
            </motion.div>
          )}

          {activeTab === 'join' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-6">
                <UserPlus className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-green-400 mb-2">Join a Team</h2>
                <p className="text-gray-300">Enter a team code to join an existing team</p>
              </div>

              <form onSubmit={handleJoinTeam} className="space-y-6">
                <div>
                  <label htmlFor="teamCode" className="block text-sm font-medium text-green-300 mb-2">
                    Team Code
                  </label>
                  <input
                    type="text"
                    id="teamCode"
                    name="teamCode"
                    value={formData.teamCode}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-green-900/30 border border-green-500/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                    placeholder="Enter team invitation code"
                  />
                  {errors.teamCode && (
                    <p className="mt-1 text-sm text-red-400">{errors.teamCode}</p>
                  )}
                </div>

                <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <svg className="w-5 h-5 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-blue-300 font-medium">Demo Team Code</span>
                  </div>
                  <p className="text-sm text-gray-300 mb-2">
                    Use code: <strong>DEMO2024</strong> to join a demo team
                  </p>
                </div>

                {errors.submit && (
                  <p className="text-sm text-red-400 text-center">{errors.submit}</p>
                )}

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: isLoading ? 1 : 1.02 }}
                  whileTap={{ scale: isLoading ? 1 : 0.98 }}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Joining Team...
                    </div>
                  ) : (
                    'Join Team'
                  )}
                </motion.button>
              </form>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamManagement;

