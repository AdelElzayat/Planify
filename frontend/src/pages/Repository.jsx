import { useState, useEffect } from 'react';
import { FiFolder, FiFile, FiGitCommit, FiExternalLink, FiBookOpen, FiPlus, FiChevronRight, FiClock, FiUser, FiCode, FiFileText, FiArchive, FiDownload, FiEye, FiEdit3, FiSave } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import useTeamStore from '../stores/useTeamStore';
import useAuthStore from '../stores/useAuthStore';
import api from '../services/api';

export default function Repository() {
  const { team, fetchMyTeam } = useTeamStore();
  const user = useAuthStore((s) => s.user);
  const [repo, setRepo] = useState(null);
  const [activeTab, setActiveTab] = useState('files');
  const [commitMessage, setCommitMessage] = useState('');
  const [readme, setReadme] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMyTeam();
  }, []);

  useEffect(() => {
    if (team?._id) {
      loadRepo();
    }
  }, [team?._id]);

  const loadRepo = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get(`/repositories/${team._id}`);
      setRepo(data);
      setReadme(data.readme || '');
    } catch (error) {
      console.error('Failed to load repository:', error);
    }
    setIsLoading(false);
  };

  const handleCommit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/repositories/${team._id}/commits`, { message: commitMessage });
      setCommitMessage('');
      loadRepo();
    } catch (error) {
      console.error('Failed to create commit:', error);
    }
  };

  const handleSaveReadme = async () => {
    try {
      await api.put(`/repositories/${team._id}/readme`, { content: readme });
      loadRepo();
    } catch (error) {
      console.error('Failed to save readme:', error);
    }
  };

  const tabs = [
    { id: 'files', label: 'Files', icon: FiFileText },
    { id: 'commits', label: 'Commits', icon: FiGitCommit },
    { id: 'readme', label: 'README', icon: FiBookOpen },
    { id: 'docs', label: 'Docs', icon: FiCode },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex gap-2 border-b border-dark-100 dark:border-dark-800/60 pb-3">
          {[1,2,3,4].map(i => <div key={i} className="skeleton w-24 h-8 rounded-lg" />)}
        </div>
        <div className="card p-6">
          <div className="skeleton w-32 h-4 mb-4" />
          {[1,2,3,4,5].map(i => <div key={i} className="skeleton w-full h-10 mb-2 rounded-lg" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 dark:text-dark-100">Repository</h1>
          <p className="text-dark-500 dark:text-dark-400 mt-1">
            {team?.name || 'Team'}'s project files
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-dark-100 dark:border-dark-800/60">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all duration-200 ${
              activeTab === tab.id
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-dark-500 dark:text-dark-400 hover:text-dark-700 dark:hover:text-dark-300 hover:border-dark-200 dark:hover:border-dark-700'
            }`}
          >
            <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-primary-500' : ''}`} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Files Tab */}
      {activeTab === 'files' && (
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-dark-100 dark:border-dark-800/60 flex items-center justify-between">
            <h3 className="section-title">
              <FiFolder className="w-4 h-4 text-primary-500" />
              Project Files
            </h3>
            <button className="btn-secondary btn-sm">
              <FiPlus className="w-3.5 h-3.5" /> Upload
            </button>
          </div>
          {repo?.files?.length > 0 ? (
            <div className="divide-y divide-dark-100 dark:divide-dark-800/60">
              {repo.files.map((file, idx) => (
                <div
                  key={file._id}
                  className="group flex items-center gap-4 px-6 py-3.5 hover:bg-dark-50 dark:hover:bg-dark-800/30 transition-colors"
                >
                  <FiFile className="w-4 h-4 text-dark-400 group-hover:text-primary-500 transition-colors" />
                  <span className="text-sm font-medium text-dark-700 dark:text-dark-300 flex-1">{file.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-dark-400">{(file.size / 1024).toFixed(1)} KB</span>
                    <button className="p-1.5 rounded-lg text-dark-400 hover:text-primary-500 hover:bg-dark-100 dark:hover:bg-dark-800 opacity-0 group-hover:opacity-100 transition-all">
                      <FiDownload className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1.5 rounded-lg text-dark-400 hover:text-primary-500 hover:bg-dark-100 dark:hover:bg-dark-800 opacity-0 group-hover:opacity-100 transition-all">
                      <FiExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-14 text-dark-400">
              <div className="w-16 h-16 rounded-2xl bg-dark-50 dark:bg-dark-800/50 flex items-center justify-center mb-4">
                <FiFolder className="w-7 h-7" />
              </div>
              <p className="text-sm font-medium">No files uploaded yet</p>
              <p className="text-xs mt-1">Upload your project files to get started</p>
            </div>
          )}
        </div>
      )}

      {/* Commits Tab */}
      {activeTab === 'commits' && (
        <div className="space-y-4">
          {/* Create Commit */}
          <div className="card p-6">
            <h3 className="section-title mb-4">
              <FiGitCommit className="w-4 h-4 text-primary-500" />
              Create Commit
            </h3>
            <form onSubmit={handleCommit} className="flex gap-3">
              <div className="flex-1 relative">
                <FiGitCommit className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                <input
                  type="text"
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                  placeholder="Describe your changes..."
                  className="input pl-10"
                  required
                />
              </div>
              <button
                type="submit"
                className="btn-primary"
              >
                <FiGitCommit className="w-4 h-4" /> Commit
              </button>
            </form>
          </div>

          {/* Commit History */}
          <div className="card overflow-hidden">
            <div className="px-6 py-4 border-b border-dark-100 dark:border-dark-800/60">
              <h3 className="section-title">
                <FiClock className="w-4 h-4 text-primary-500" />
                Commit History
              </h3>
            </div>
            {repo?.commits?.length > 0 ? (
              <div className="divide-y divide-dark-100 dark:divide-dark-800/60">
                {[...repo.commits].reverse().map((commit, idx) => (
                  <div
                    key={commit._id}
                    className="group flex items-start gap-4 px-6 py-4 hover:bg-dark-50 dark:hover:bg-dark-800/30 transition-colors"
                  >
                    <div className="relative">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white text-xs font-bold">
                        {commit.author?.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-dark-100 dark:bg-dark-800 flex items-center justify-center border-2 border-white dark:border-surface-dark">
                        <FiGitCommit className="w-2 h-2 text-primary-500" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-dark-900 dark:text-dark-100">{commit.message}</p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="text-xs text-dark-500 flex items-center gap-1">
                          <FiUser className="w-3 h-3" /> {commit.author?.name}
                        </span>
                        <span className="text-dark-300 dark:text-dark-600">•</span>
                        <span className="text-xs text-dark-400">
                          {new Date(commit.createdAt).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </span>
                        <span className="text-dark-300 dark:text-dark-600">•</span>
                        <code className="text-xs font-mono px-1.5 py-0.5 rounded bg-primary-50 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400">
                          {commit.hash?.slice(0, 8)}
                        </code>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-14 text-dark-400">
                <FiGitCommit className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-sm font-medium">No commits yet</p>
                <p className="text-xs mt-1">Create your first commit above</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* README Tab */}
      {activeTab === 'readme' && (
        <div>
          <div className="card overflow-hidden">
            <div className="px-6 py-4 border-b border-dark-100 dark:border-dark-800/60 flex items-center justify-between">
              <h3 className="section-title">
                <FiBookOpen className="w-4 h-4 text-primary-500" />
                README
              </h3>
              <button onClick={handleSaveReadme} className="btn-primary btn-sm">
                <FiSave className="w-3.5 h-3.5" /> Save
              </button>
            </div>
            <div className="p-6">
              <textarea
                value={readme}
                onChange={(e) => setReadme(e.target.value)}
                className="w-full bg-dark-50 dark:bg-dark-800/30 border border-dark-100 dark:border-dark-800/60 rounded-xl p-4 font-mono text-sm text-dark-900 dark:text-dark-100 placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 resize-none min-h-[300px]"
                rows={15}
                placeholder="Write your README content here..."
              />
            </div>
          </div>
          <div className="card p-6 mt-4">
            <h4 className="text-sm font-medium text-dark-900 dark:text-dark-100 mb-3 flex items-center gap-2">
              <FiEye className="w-4 h-4 text-dark-400" />
              Preview
            </h4>
            <div className="p-4 rounded-xl bg-dark-50 dark:bg-dark-800/30 min-h-[200px]">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                {readme ? (
                  <ReactMarkdown>{readme}</ReactMarkdown>
                ) : (
                  <p className="text-dark-400 italic">Nothing to preview yet...</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Docs Tab */}
      {activeTab === 'docs' && (
        <div className="card p-6">
          <h3 className="section-title mb-4">
            <FiCode className="w-4 h-4 text-primary-500" />
            Documentation
          </h3>
          <p className="text-sm text-dark-500 dark:text-dark-400 mb-6">
            Project documentation, notes, and meeting summaries
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-xl bg-dark-50 dark:bg-dark-800/30 border border-dark-100 dark:border-dark-800/60">
              <h4 className="font-medium text-dark-900 dark:text-dark-100 mb-3 flex items-center gap-2">
                <FiEdit3 className="w-4 h-4 text-primary-500" />
                Notes
              </h4>
              <textarea
                className="w-full bg-transparent border-0 outline-none text-sm text-dark-700 dark:text-dark-300 placeholder-dark-400 resize-none"
                rows={8}
                placeholder="Add project notes..."
                defaultValue={repo?.documentation?.notes}
              />
            </div>
            <div className="p-5 rounded-xl bg-dark-50 dark:bg-dark-800/30 border border-dark-100 dark:border-dark-800/60">
              <h4 className="font-medium text-dark-900 dark:text-dark-100 mb-3 flex items-center gap-2">
                <FiClock className="w-4 h-4 text-primary-500" />
                Progress Updates
              </h4>
              <textarea
                className="w-full bg-transparent border-0 outline-none text-sm text-dark-700 dark:text-dark-300 placeholder-dark-400 resize-none"
                rows={8}
                placeholder="Add progress updates..."
                defaultValue={repo?.documentation?.progressUpdates}
              />
            </div>
          </div>
          <div className="flex justify-end mt-6">
            <button className="btn-primary">
              <FiSave className="w-4 h-4" /> Save Documentation
            </button>
          </div>
        </div>
      )}
    </div>
  );
}