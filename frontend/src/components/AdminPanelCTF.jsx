import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PlatformSettings from './PlatformSettings';
import { 
  Shield, 
  Users, 
  Trophy, 
  Settings, 
  FileText, 
  BarChart3, 
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Upload,
  Download,
  Search,
  Filter,
  RefreshCw,
  Save,
  X,
  Lock,
  Unlock,
  User,
  Mail,
  Key,
  Globe,
  File,
  Code,
  ExternalLink
} from 'lucide-react';

const AdminPanelCTF = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [adminData, setAdminData] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateChallenge, setShowCreateChallenge] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    checkAdminSession();
    loadDashboardData();
  }, []);

  const checkAdminSession = async () => {
    try {
      const response = await fetch('/api/admin_auth_simple.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'check_session' }),
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setAdminData(data.admin);
      } else {
        onClose();
      }
    } catch (error) {
      console.error('Session check failed:', error);
      onClose();
    }
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load challenges
      const challengesResponse = await fetch('/api/admin_challenges_simple.php', {
        credentials: 'include'
      });
      const challengesData = await challengesResponse.json();
      if (challengesData.success) {
        setChallenges(challengesData.challenges);
      }

      // Load categories (mock data for now)
      setCategories([
        { id: 1, title: 'Web Security', icon: '⚡', color: '#00ff88' },
        { id: 2, title: 'Cryptography', icon: '🌱', color: '#00cc66' },
        { id: 3, title: 'Forensics', icon: '♻️', color: '#00aa44' },
        { id: 4, title: 'Reverse Engineering', icon: '🌿', color: '#008833' },
        { id: 5, title: 'Static Analysis', icon: '🍃', color: '#006622' },
        { id: 6, title: 'Pwn', icon: '💥', color: '#ff6b35' },
        { id: 7, title: 'Misc', icon: '🔧', color: '#4ecdc4' }
      ]);

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin_auth.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logout' }),
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      onClose();
    }
  };

  const filteredChallenges = challenges.filter(challenge => {
    const matchesSearch = challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         challenge.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || challenge.category_id.toString() === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'challenges', label: 'Challenges', icon: Trophy },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex"
    >
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 border-r border-green-500/30">
        <div className="p-6 border-b border-green-500/30">
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-green-400" />
            <div>
              <h2 className="text-xl font-bold text-white">Admin Panel</h2>
              <p className="text-sm text-gray-400">{adminData?.username}</p>
            </div>
          </div>
        </div>

        <nav className="p-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                activeTab === tab.id
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={() => setShowCredentialsModal(true)}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg mb-2 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <User className="w-5 h-5" />
            <span>Account</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
          >
            <X className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-gray-900 border-b border-green-500/30 p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white capitalize">{activeTab}</h1>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'dashboard' && <DashboardContent challenges={challenges} />}
          {activeTab === 'challenges' && (
            <ChallengesContent
              challenges={filteredChallenges}
              categories={categories}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filterCategory={filterCategory}
              setFilterCategory={setFilterCategory}
              onCreateChallenge={() => setShowCreateChallenge(true)}
              onEditChallenge={setSelectedChallenge}
              onRefresh={loadDashboardData}
            />
          )}
          {activeTab === 'users' && <UsersContent users={users} />}
          {activeTab === 'settings' && <PlatformSettings onRefresh={loadDashboardData} />}
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showCreateChallenge && (
          <CreateChallengeModal
            categories={categories}
            onClose={() => setShowCreateChallenge(false)}
            onSuccess={loadDashboardData}
          />
        )}
        {selectedChallenge && (
          <EditChallengeModal
            challenge={selectedChallenge}
            categories={categories}
            onClose={() => setSelectedChallenge(null)}
            onSuccess={loadDashboardData}
          />
        )}
        {showCredentialsModal && (
          <CredentialsModal
            adminData={adminData}
            onClose={() => setShowCredentialsModal(false)}
            onSuccess={(newData) => setAdminData(newData)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const DashboardContent = ({ challenges }) => {
  const stats = {
    totalChallenges: challenges.length,
    enabledChallenges: challenges.filter(c => c.enabled).length,
    totalSolves: challenges.reduce((sum, c) => sum + (c.solve_count || 0), 0),
    avgSolveRate: challenges.length > 0 
      ? (challenges.reduce((sum, c) => sum + (c.solve_rate || 0), 0) / challenges.length).toFixed(1)
      : 0
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Challenges" value={stats.totalChallenges} icon={Trophy} color="blue" />
        <StatCard title="Enabled Challenges" value={stats.enabledChallenges} icon={Eye} color="green" />
        <StatCard title="Total Solves" value={stats.totalSolves} icon={Users} color="purple" />
        <StatCard title="Avg Solve Rate" value={`${stats.avgSolveRate}%`} icon={BarChart3} color="orange" />
      </div>

      {/* Recent Challenges */}
      <div className="bg-gray-900 rounded-lg border border-green-500/30 p-6">
        <h3 className="text-xl font-bold text-white mb-4">Recent Challenges</h3>
        <div className="space-y-3">
          {challenges.slice(0, 5).map((challenge) => (
            <div key={challenge.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
              <div>
                <h4 className="text-white font-medium">{challenge.title}</h4>
                <p className="text-sm text-gray-400">{challenge.category_name} • {challenge.points} points</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded text-xs ${
                  challenge.enabled ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {challenge.enabled ? 'Enabled' : 'Disabled'}
                </span>
                <span className="text-sm text-gray-400">{challenge.solve_count || 0} solves</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    green: 'bg-green-500/20 text-green-400 border-green-500/30',
    purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    orange: 'bg-orange-500/20 text-orange-400 border-orange-500/30'
  };

  return (
    <div className={`p-6 rounded-lg border ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
        <Icon className="w-8 h-8" />
      </div>
    </div>
  );
};

const ChallengesContent = ({ 
  challenges, 
  categories, 
  searchTerm, 
  setSearchTerm, 
  filterCategory, 
  setFilterCategory,
  onCreateChallenge,
  onEditChallenge,
  onRefresh
}) => {
  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search challenges..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-green-500 focus:outline-none"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-green-500 focus:outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id.toString()}>{cat.title}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onRefresh}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <button
            onClick={onCreateChallenge}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Challenge</span>
          </button>
        </div>
      </div>

      {/* Challenges Table */}
      <div className="bg-gray-900 rounded-lg border border-green-500/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800 border-b border-green-500/30">
              <tr>
                <th className="text-left p-4 text-gray-300 font-medium">Challenge</th>
                <th className="text-left p-4 text-gray-300 font-medium">Category</th>
                <th className="text-left p-4 text-gray-300 font-medium">Type</th>
                <th className="text-left p-4 text-gray-300 font-medium">Points</th>
                <th className="text-left p-4 text-gray-300 font-medium">Difficulty</th>
                <th className="text-left p-4 text-gray-300 font-medium">Solves</th>
                <th className="text-left p-4 text-gray-300 font-medium">Status</th>
                <th className="text-left p-4 text-gray-300 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {challenges.map((challenge) => (
                <ChallengeRow
                  key={challenge.id}
                  challenge={challenge}
                  onEdit={() => onEditChallenge(challenge)}
                  onRefresh={onRefresh}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const ChallengeRow = ({ challenge, onEdit, onRefresh }) => {
  const [isToggling, setIsToggling] = useState(false);

  const toggleVisibility = async () => {
    setIsToggling(true);
    try {
      const response = await fetch(`/api/admin_challenges_simple.php?id=${challenge.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visible: challenge.visible ? 0 : 1 }),
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        onRefresh();
      }
    } catch (error) {
      console.error('Failed to toggle visibility:', error);
    } finally {
      setIsToggling(false);
    }
  };

  const deleteChallenge = async () => {
    if (!confirm(`Are you sure you want to delete "${challenge.title}"?`)) return;
    
    try {
      const response = await fetch(`/api/admin_challenges_simple.php?id=${challenge.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        onRefresh();
      }
    } catch (error) {
      console.error('Failed to delete challenge:', error);
    }
  };

  const difficultyColors = {
    easy: 'bg-green-500/20 text-green-400',
    medium: 'bg-yellow-500/20 text-yellow-400',
    hard: 'bg-orange-500/20 text-orange-400',
    expert: 'bg-red-500/20 text-red-400'
  };

  const typeIcons = {
    static: FileText,
    file: File,
    web: Globe,
    docker: Code,
    dynamic: ExternalLink
  };

  const TypeIcon = typeIcons[challenge.challenge_type] || FileText;

  return (
    <tr className="border-b border-gray-800 hover:bg-gray-800/50">
      <td className="p-4">
        <div>
          <h4 className="text-white font-medium">{challenge.title}</h4>
          <p className="text-sm text-gray-400 truncate max-w-xs">{challenge.description}</p>
        </div>
      </td>
      <td className="p-4">
        <span className="text-gray-300">{challenge.category_name}</span>
      </td>
      <td className="p-4">
        <div className="flex items-center space-x-2">
          <TypeIcon className="w-4 h-4 text-gray-400" />
          <span className="text-gray-300 capitalize">{challenge.challenge_type}</span>
        </div>
      </td>
      <td className="p-4">
        <span className="text-white font-medium">{challenge.points}</span>
      </td>
      <td className="p-4">
        <span className={`px-2 py-1 rounded text-xs ${difficultyColors[challenge.difficulty]}`}>
          {challenge.difficulty}
        </span>
      </td>
      <td className="p-4">
        <span className="text-gray-300">{challenge.solve_count || 0}</span>
      </td>
      <td className="p-4">
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded text-xs ${
            challenge.enabled ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}>
            {challenge.enabled ? 'Enabled' : 'Disabled'}
          </span>
          <span className={`px-2 py-1 rounded text-xs ${
            challenge.visible ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'
          }`}>
            {challenge.visible ? 'Visible' : 'Hidden'}
          </span>
        </div>
      </td>
      <td className="p-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={onEdit}
            className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={toggleVisibility}
            disabled={isToggling}
            className="p-1 text-yellow-400 hover:text-yellow-300 transition-colors disabled:opacity-50"
            title={challenge.visible ? 'Hide' : 'Show'}
          >
            {challenge.visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <button
            onClick={deleteChallenge}
            className="p-1 text-red-400 hover:text-red-300 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

const CreateChallengeModal = ({ categories, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    flag: '',
    points: 100,
    category_id: categories[0]?.id || 1,
    challenge_type: 'static',
    difficulty: 'medium',
    author: 'Admin',
    tags: '',
    enabled: true,
    visible: true,
    target_url: '',
    files: []
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admin_challenges_simple.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include'
      });

      const data = await response.json();
      if (data.success) {
        onSuccess();
        onClose();
      } else {
        alert(data.message || 'Failed to create challenge');
      }
    } catch (error) {
      console.error('Failed to create challenge:', error);
      alert('Failed to create challenge');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const fileData = {
          name: file.name,
          type: file.type,
          content: event.target.result.split(',')[1] // Remove data:type;base64, prefix
        };
        setFormData(prev => ({
          ...prev,
          files: [...prev.files, fileData]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-900 rounded-lg border border-green-500/30 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Create New Challenge</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-green-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Points</label>
              <input
                type="number"
                required
                min="1"
                value={formData.points}
                onChange={(e) => setFormData(prev => ({ ...prev, points: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-green-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-green-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Flag</label>
            <input
              type="text"
              required
              value={formData.flag}
              onChange={(e) => setFormData(prev => ({ ...prev, flag: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-green-500 focus:outline-none"
              placeholder="flag{example_flag}"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData(prev => ({ ...prev, category_id: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-green-500 focus:outline-none"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
              <select
                value={formData.challenge_type}
                onChange={(e) => setFormData(prev => ({ ...prev, challenge_type: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-green-500 focus:outline-none"
              >
                <option value="static">Static</option>
                <option value="file">File</option>
                <option value="web">Web</option>
                <option value="docker">Docker</option>
                <option value="dynamic">Dynamic</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Difficulty</label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-green-500 focus:outline-none"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
                <option value="expert">Expert</option>
              </select>
            </div>
          </div>

          {formData.challenge_type === 'web' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Target URL</label>
              <input
                type="url"
                value={formData.target_url}
                onChange={(e) => setFormData(prev => ({ ...prev, target_url: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-green-500 focus:outline-none"
                placeholder="https://example.com"
              />
            </div>
          )}

          {(formData.challenge_type === 'file' || formData.challenge_type === 'docker') && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Files</label>
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-green-500 focus:outline-none"
              />
              {formData.files.length > 0 && (
                <div className="mt-2 space-y-1">
                  {formData.files.map((file, index) => (
                    <div key={index} className="text-sm text-gray-400">
                      📎 {file.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Author</label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-green-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Tags</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-green-500 focus:outline-none"
                placeholder="web,sql,injection"
              />
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.enabled}
                onChange={(e) => setFormData(prev => ({ ...prev, enabled: e.target.checked }))}
                className="rounded border-gray-700 bg-gray-800 text-green-500 focus:ring-green-500"
              />
              <span className="text-gray-300">Enabled</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.visible}
                onChange={(e) => setFormData(prev => ({ ...prev, visible: e.target.checked }))}
                className="rounded border-gray-700 bg-gray-800 text-green-500 focus:ring-green-500"
              />
              <span className="text-gray-300">Visible</span>
            </label>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Challenge'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

const EditChallengeModal = ({ challenge, categories, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: challenge.title || '',
    description: challenge.description || '',
    flag: challenge.flag || '',
    points: challenge.points || 100,
    category_id: challenge.category_id || categories[0]?.id || 1,
    challenge_type: challenge.challenge_type || 'static',
    difficulty: challenge.difficulty || 'medium',
    author: challenge.author || 'Admin',
    tags: challenge.tags || '',
    enabled: challenge.enabled || false,
    visible: challenge.visible || false,
    target_url: challenge.target_url || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/admin_challenges_simple.php?id=${challenge.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include'
      });

      const data = await response.json();
      if (data.success) {
        onSuccess();
        onClose();
      } else {
        alert(data.message || 'Failed to update challenge');
      }
    } catch (error) {
      console.error('Failed to update challenge:', error);
      alert('Failed to update challenge');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-900 rounded-lg border border-green-500/30 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Edit Challenge</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-green-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Points</label>
              <input
                type="number"
                required
                min="1"
                value={formData.points}
                onChange={(e) => setFormData(prev => ({ ...prev, points: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-green-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-green-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Flag</label>
            <input
              type="text"
              required
              value={formData.flag}
              onChange={(e) => setFormData(prev => ({ ...prev, flag: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-green-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData(prev => ({ ...prev, category_id: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-green-500 focus:outline-none"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
              <select
                value={formData.challenge_type}
                onChange={(e) => setFormData(prev => ({ ...prev, challenge_type: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-green-500 focus:outline-none"
              >
                <option value="static">Static</option>
                <option value="file">File</option>
                <option value="web">Web</option>
                <option value="docker">Docker</option>
                <option value="dynamic">Dynamic</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Difficulty</label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-green-500 focus:outline-none"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
                <option value="expert">Expert</option>
              </select>
            </div>
          </div>

          {formData.challenge_type === 'web' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Target URL</label>
              <input
                type="url"
                value={formData.target_url}
                onChange={(e) => setFormData(prev => ({ ...prev, target_url: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-green-500 focus:outline-none"
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Author</label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-green-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Tags</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-green-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.enabled}
                onChange={(e) => setFormData(prev => ({ ...prev, enabled: e.target.checked }))}
                className="rounded border-gray-700 bg-gray-800 text-green-500 focus:ring-green-500"
              />
              <span className="text-gray-300">Enabled</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.visible}
                onChange={(e) => setFormData(prev => ({ ...prev, visible: e.target.checked }))}
                className="rounded border-gray-700 bg-gray-800 text-green-500 focus:ring-green-500"
              />
              <span className="text-gray-300">Visible</span>
            </label>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Challenge'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

const CredentialsModal = ({ adminData, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    current_password: '',
    new_username: adminData?.username || '',
    new_email: adminData?.email || '',
    new_password: '',
    confirm_password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.new_password && formData.new_password !== formData.confirm_password) {
      alert('New passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/admin_auth_simple.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'change_credentials',
          ...formData
        }),
        credentials: 'include'
      });

      const data = await response.json();
      if (data.success) {
        onSuccess({ ...adminData, username: formData.new_username, email: formData.new_email });
        onClose();
        alert('Credentials updated successfully');
      } else {
        alert(data.message || 'Failed to update credentials');
      }
    } catch (error) {
      console.error('Failed to update credentials:', error);
      alert('Failed to update credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-900 rounded-lg border border-green-500/30 p-6 w-full max-w-md"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Update Credentials</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Current Password</label>
            <input
              type="password"
              required
              value={formData.current_password}
              onChange={(e) => setFormData(prev => ({ ...prev, current_password: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-green-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
            <input
              type="text"
              value={formData.new_username}
              onChange={(e) => setFormData(prev => ({ ...prev, new_username: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-green-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
            <input
              type="email"
              value={formData.new_email}
              onChange={(e) => setFormData(prev => ({ ...prev, new_email: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-green-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">New Password (optional)</label>
            <input
              type="password"
              value={formData.new_password}
              onChange={(e) => setFormData(prev => ({ ...prev, new_password: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-green-500 focus:outline-none"
            />
          </div>

          {formData.new_password && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Confirm New Password</label>
              <input
                type="password"
                value={formData.confirm_password}
                onChange={(e) => setFormData(prev => ({ ...prev, confirm_password: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-green-500 focus:outline-none"
              />
            </div>
          )}

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

const UsersContent = ({ users }) => {
  return (
    <div className="space-y-6">
      <div className="bg-gray-900 rounded-lg border border-green-500/30 p-6">
        <h3 className="text-xl font-bold text-white mb-4">User Management</h3>
        <p className="text-gray-400">User management features will be implemented here.</p>
      </div>
    </div>
  );
};

const SettingsContent = () => {
  return (
    <div className="space-y-6">
      <div className="bg-gray-900 rounded-lg border border-green-500/30 p-6">
        <h3 className="text-xl font-bold text-white mb-4">Platform Settings</h3>
        <p className="text-gray-400">Platform configuration settings will be implemented here.</p>
      </div>
    </div>
  );
};

export default AdminPanelCTF;

