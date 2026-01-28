import React, { useState } from 'react';
import { User, Exam } from '../types';
import { Button, Input, Select, Card, Badge } from '../components/UI';
import { generateQuestionsAI } from '../services/geminiService';
import { Plus, Users, BookOpen, BrainCircuit, LogOut, BarChart3, MonitorPlay, Activity } from 'lucide-react';

interface ProfessorViewProps {
  user: User;
  onLogout: () => void;
}

type Tab = 'dashboard' | 'results' | 'monitor';

export const ProfessorView: React.FC<ProfessorViewProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [exams, setExams] = useState<Exam[]>([
    {
      id: 'ex-001',
      title: 'Data Structures Mid-Term',
      subject: 'Computer Science',
      durationMinutes: 60,
      totalMarks: 50,
      questions: [],
      status: 'PUBLISHED',
      createdBy: user.id,
      negativeMarking: true,
      calculatorAllowed: false
    },
    {
      id: 'ex-002',
      title: 'Operating Systems Quiz',
      subject: 'Computer Science',
      durationMinutes: 30,
      totalMarks: 20,
      questions: [],
      status: 'COMPLETED',
      createdBy: user.id,
      negativeMarking: false,
      calculatorAllowed: true
    }
  ]);

  const [isCreating, setIsCreating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Form State
  const [newExam, setNewExam] = useState<Partial<Exam>>({
    title: '',
    subject: '',
    durationMinutes: 60,
    status: 'DRAFT',
    negativeMarking: false,
    calculatorAllowed: false
  });
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');

  const handleCreateExam = async () => {
    if (!newExam.title || !newExam.subject || !topic) return;

    setIsGenerating(true);
    
    // AI Question Generation
    const generatedQuestions = await generateQuestionsAI(
      newExam.subject,
      topic,
      difficulty,
      5 // Generate 5 questions for demo
    );

    const fullExam: Exam = {
      id: `ex-${Date.now()}`,
      title: newExam.title,
      subject: newExam.subject,
      durationMinutes: newExam.durationMinutes || 60,
      totalMarks: generatedQuestions.reduce((acc, q) => acc + q.marks, 0),
      questions: generatedQuestions,
      status: 'PUBLISHED',
      createdBy: user.id,
      negativeMarking: newExam.negativeMarking || false,
      calculatorAllowed: newExam.calculatorAllowed || false
    };

    setExams([fullExam, ...exams]);
    setIsCreating(false);
    setIsGenerating(false);
  };

  const renderDashboard = () => (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Exam Management</h2>
        <Button onClick={() => setIsCreating(true)} icon={Plus}>Create New Exam</Button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Stats Cards */}
        <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white border-none shadow-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-blue-100 text-sm font-medium uppercase tracking-wider">Active Students</p>
              <p className="text-4xl font-bold mt-1">24</p>
            </div>
            <div className="bg-white/20 p-3 rounded-full">
               <Users className="text-white" size={24} />
            </div>
          </div>
          <div className="mt-6 flex items-center gap-2 text-xs text-blue-100 bg-blue-800/40 w-max px-2 py-1 rounded">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            Live Monitoring Active
          </div>
        </Card>

        {exams.map(exam => (
          <Card key={exam.id} className="hover:shadow-md transition-shadow relative">
            <div className="absolute top-0 left-0 w-1 h-full bg-brand-500"></div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-lg text-gray-900 line-clamp-1">{exam.title}</h3>
                <p className="text-sm text-gray-500">{exam.subject}</p>
              </div>
              <Badge color={exam.status === 'PUBLISHED' ? 'green' : 'gray'}>{exam.status}</Badge>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600 mb-6">
              <div className="flex justify-between border-b border-gray-100 pb-1">
                <span>Questions</span>
                <span className="font-medium text-gray-900">{exam.questions.length}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-1">
                <span>Duration</span>
                <span className="font-medium text-gray-900">{exam.durationMinutes} min</span>
              </div>
              <div className="flex justify-between pt-1">
                <span>Negative Marking</span>
                <span className={`font-medium ${exam.negativeMarking ? 'text-red-600' : 'text-green-600'}`}>{exam.negativeMarking ? 'Yes' : 'No'}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button size="sm" variant="secondary" className="flex-1" onClick={() => setActiveTab('results')}>Results</Button>
              <Button size="sm" variant="secondary" className="flex-1" onClick={() => setActiveTab('monitor')} icon={MonitorPlay}>Monitor</Button>
            </div>
          </Card>
        ))}
      </div>
    </>
  );

  const renderResults = () => (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Exam Results</h2>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exam</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Malpractice</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[
                { name: 'Alex Johnson', exam: 'Data Structures', score: '45/50', status: 'Passed', risk: 'Low' },
                { name: 'Sam Smith', exam: 'Data Structures', score: '38/50', status: 'Passed', risk: 'Medium' },
                { name: 'Jordan Lee', exam: 'Operating Systems', score: '12/20', status: 'Passed', risk: 'Low' },
                { name: 'Casey West', exam: 'Data Structures', score: '0/50', status: 'Disqualified', risk: 'High' },
              ].map((row, i) => (
                <tr key={i}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.exam}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{row.score}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge color={row.status === 'Passed' ? 'green' : 'red'}>{row.status}</Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge color={row.risk === 'Low' ? 'green' : (row.risk === 'Medium' ? 'yellow' : 'red')}>{row.risk} Risk</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  const renderMonitor = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Activity className="text-red-500"/> Live Proctoring</h2>
        <div className="flex gap-2">
            <Badge color="red">4 High Alert</Badge>
            <Badge color="yellow">2 Suspicious</Badge>
            <Badge color="green">18 Normal</Badge>
        </div>
      </div>
      
      {/* Simulation Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {Array.from({length: 8}).map((_, i) => (
            <div key={i} className="bg-black rounded-lg overflow-hidden relative group aspect-video border border-gray-800">
                <div className="absolute top-2 left-2 z-10 bg-black/50 text-white text-[10px] px-1 rounded">ID: 2024-{100+i}</div>
                <div className="absolute inset-0 flex items-center justify-center text-gray-700 bg-gray-900">
                    <Users size={32} />
                </div>
                {/* Simulated Feed Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-2">
                    <div className="w-full">
                        <div className="flex justify-between items-center text-xs text-white">
                            <span>Student {i+1}</span>
                            {i === 2 ? <Badge color="red">Away</Badge> : <Badge color="green">Live</Badge>}
                        </div>
                    </div>
                </div>
                {i === 2 && (
                    <div className="absolute inset-0 border-4 border-red-500 animate-pulse pointer-events-none"></div>
                )}
            </div>
        ))}
      </div>

      <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Alerts</h3>
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alert Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {[1, 2, 3].map((i) => (
              <tr key={i}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">10:4{i} AM</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Student {100+i}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">Tab Switch Detected</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button className="text-brand-600 hover:text-brand-800 font-medium">Warn</button>
                    <span className="mx-2">|</span>
                    <button className="text-red-600 hover:text-red-800 font-medium">Terminate</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-brand-600 p-1.5 rounded-lg">
                <BrainCircuit className="text-white" size={24} />
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">ProctorAI <span className="text-gray-400 font-normal">| Professor</span></h1>
          </div>
          
          <nav className="hidden md:flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {(['dashboard', 'results', 'monitor'] as Tab[]).map((tab) => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                        activeTab === tab 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-900'
                    } capitalize`}
                >
                    {tab}
                </button>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-700 hidden sm:inline">Dr. {user.name.split(' ')[0]}</span>
            <Button variant="secondary" size="sm" onClick={onLogout} icon={LogOut}>Logout</Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {isCreating ? (
          <div className="max-w-3xl mx-auto">
            <Card title="Create New Exam with AI">
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <Input 
                    label="Exam Title" 
                    placeholder="e.g. Finals 2024"
                    value={newExam.title}
                    onChange={e => setNewExam({...newExam, title: e.target.value})}
                  />
                  <Input 
                    label="Subject" 
                    placeholder="e.g. Physics"
                    value={newExam.subject}
                    onChange={e => setNewExam({...newExam, subject: e.target.value})}
                  />
                  <Input 
                    label="Topic for AI Generation" 
                    placeholder="e.g. Thermodynamics"
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                  />
                  <Select 
                    label="Difficulty"
                    value={difficulty}
                    onChange={e => setDifficulty(e.target.value)}
                    options={[
                      { label: "Easy", value: "Easy" },
                      { label: "Medium", value: "Medium" },
                      { label: "Hard", value: "Hard" }
                    ]}
                  />
                  <Input 
                    label="Duration (Minutes)" 
                    type="number"
                    value={newExam.durationMinutes}
                    onChange={e => setNewExam({...newExam, durationMinutes: parseInt(e.target.value)})}
                  />
                </div>

                <div className="flex items-center gap-6">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="rounded text-brand-600 focus:ring-brand-500 h-4 w-4"
                      checked={newExam.negativeMarking}
                      onChange={e => setNewExam({...newExam, negativeMarking: e.target.checked})}
                    />
                    <span className="text-sm text-gray-700">Negative Marking</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="rounded text-brand-600 focus:ring-brand-500 h-4 w-4"
                      checked={newExam.calculatorAllowed}
                      onChange={e => setNewExam({...newExam, calculatorAllowed: e.target.checked})}
                    />
                    <span className="text-sm text-gray-700">Allow Calculator</span>
                  </label>
                </div>

                <div className="bg-indigo-50 p-4 rounded-md flex items-start border border-indigo-100">
                  <BrainCircuit className="text-indigo-600 mt-1 mr-3 flex-shrink-0" size={20} />
                  <p className="text-sm text-indigo-900">
                    <strong>AI Generation:</strong> ProctorAI will use Gemini to automatically generate questions based on the subject and topic. 
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <Button variant="secondary" onClick={() => setIsCreating(false)}>Cancel</Button>
                  <Button onClick={handleCreateExam} isLoading={isGenerating}>Generate & Publish</Button>
                </div>
              </div>
            </Card>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'results' && renderResults()}
            {activeTab === 'monitor' && renderMonitor()}
          </>
        )}
      </main>
    </div>
  );
};