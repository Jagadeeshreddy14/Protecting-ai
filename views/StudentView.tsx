import React, { useState } from 'react';
import { User, Exam, ProctorLog } from '../types';
import { Button, Card, Badge } from '../components/UI';
import { ExamRunner } from '../components/ExamRunner';
import { LogOut, Play, FileText, History, Clock, CheckCircle } from 'lucide-react';

interface StudentViewProps {
  user: User;
  onLogout: () => void;
}

type Tab = 'exams' | 'history';

export const StudentView: React.FC<StudentViewProps> = ({ user, onLogout }) => {
  const [activeExam, setActiveExam] = useState<Exam | null>(null);
  const [completed, setCompleted] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('exams');

  // Mock Exams
  const availableExams: Exam[] = [
    {
      id: 'mock-exam-1',
      title: 'Artificial Intelligence Finals',
      subject: 'Computer Science',
      durationMinutes: 30,
      totalMarks: 20,
      status: 'PUBLISHED',
      createdBy: 'prof-1',
      negativeMarking: false,
      calculatorAllowed: true,
      questions: [
        { id: 'q1', text: 'Which algorithm is used for face detection?', type: 'MCQ', options: ['Viola-Jones', 'Dijkstra', 'AES', 'RSA'], marks: 1 },
        { id: 'q2', text: 'Explain the concept of Neural Networks.', type: 'SUBJECTIVE', marks: 5 },
        { id: 'q3', text: 'Write a Python function to reverse a string.', type: 'PRACTICAL', marks: 5 },
        { id: 'q1a', text: 'Which AI field studies language?', type: 'MCQ', options: ['NLP', 'CV', 'Robotics', 'IoT'], marks: 1 },
        { id: 'q1b', text: 'What is A* algorithm used for?', type: 'MCQ', options: ['Pathfinding', 'Sorting', 'Encryption', 'Compression'], marks: 1 },
      ] as any
    },
    {
      id: 'mock-exam-2',
      title: 'General Knowledge Quiz',
      subject: 'General',
      durationMinutes: 10,
      totalMarks: 10,
      status: 'PUBLISHED',
      createdBy: 'prof-2',
      negativeMarking: true,
      calculatorAllowed: false,
      questions: [
        { id: 'q4', text: 'What is the capital of France?', type: 'MCQ', options: ['Paris', 'London', 'Berlin', 'Madrid'], marks: 1 },
        { id: 'q5', text: 'Which planet is known as the Red Planet?', type: 'MCQ', options: ['Mars', 'Venus', 'Jupiter', 'Saturn'], marks: 1 },
      ] as any
    }
  ];

  // Mock History
  const examHistory = [
    { id: 'hist-1', title: 'Data Structures Mid-Term', date: '2024-03-10', score: '42/50', status: 'Passed' },
    { id: 'hist-2', title: 'Calculus I Quiz', date: '2024-02-15', score: '18/20', status: 'Passed' },
  ];

  const handleExamSubmit = (answers: Record<string, string>, logs: ProctorLog[]) => {
    console.log("Exam Submitted", { answers, logs });
    setActiveExam(null);
    setCompleted(true);
    setActiveTab('history');
  };

  if (activeExam) {
    return (
      <ExamRunner 
        exam={activeExam} 
        studentId={user.id} 
        onSubmit={handleExamSubmit} 
        onExit={() => setActiveExam(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
           <h1 className="text-xl font-bold text-gray-900">ProctorAI <span className="text-gray-500 font-normal">| Student Portal</span></h1>
           
           <nav className="hidden sm:flex space-x-4">
              <button 
                onClick={() => setActiveTab('exams')}
                className={`text-sm font-medium px-3 py-2 rounded-md transition-colors ${activeTab === 'exams' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
              >
                Available Exams
              </button>
              <button 
                onClick={() => setActiveTab('history')}
                className={`text-sm font-medium px-3 py-2 rounded-md transition-colors ${activeTab === 'history' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
              >
                History & Results
              </button>
           </nav>

           <div className="flex items-center gap-4">
             <div className="text-right hidden sm:block">
               <div className="text-sm font-medium text-gray-900">{user.name}</div>
               <div className="text-xs text-gray-500">{user.email}</div>
             </div>
             {user.photoUrl && <img src={user.photoUrl} alt="Profile" className="w-8 h-8 rounded-full border border-gray-200 object-cover" />}
             <Button variant="ghost" size="sm" onClick={onLogout} icon={LogOut}>Logout</Button>
           </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        
        {completed && (
          <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex gap-3">
               <div className="bg-green-100 p-2 rounded-full h-fit">
                 <CheckCircle className="text-green-600" size={24} />
               </div>
               <div>
                  <h3 className="text-green-900 font-bold">Exam Submitted Successfully!</h3>
                  <p className="text-green-700 text-sm mt-1">Your responses have been recorded. Results will be published by your professor.</p>
               </div>
            </div>
            <Button variant="secondary" size="sm" onClick={() => setCompleted(false)}>Dismiss</Button>
          </div>
        )}

        {activeTab === 'exams' ? (
            <>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Exams</h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {availableExams.map(exam => (
                    <Card key={exam.id} className="flex flex-col h-full hover:shadow-lg transition-shadow border-t-4 border-t-brand-500">
                    <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                        <Badge color="blue">{exam.subject}</Badge>
                        <span className="text-xs text-gray-500 flex items-center gap-1"><Clock size={12}/> {exam.durationMinutes} mins</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-3">{exam.title}</h3>
                        <div className="space-y-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                            <p className="flex items-center gap-2"><FileText size={14}/> {exam.questions.length} Questions</p>
                            <p className="flex items-center gap-2 text-brand-700 font-medium"><Play size={14}/> AI Proctoring Enabled</p>
                        </div>
                    </div>
                    <div className="mt-6 pt-4 border-t border-gray-100">
                        <Button className="w-full" onClick={() => {
                        if (confirm(`Start Exam: ${exam.title}? \n\nEnsure you have a working camera and microphone. Fullscreen mode will be enabled.`)) {
                            setActiveExam(exam);
                        }
                        }}>Start Exam</Button>
                    </div>
                    </Card>
                ))}
                </div>
            </>
        ) : (
            <>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Exam History</h2>
                <Card className="overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exam Title</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {examHistory.map((hist) => (
                                <tr key={hist.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{hist.title}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{hist.date}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{hist.score}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Badge color="green">{hist.status}</Badge>
                                    </td>
                                </tr>
                            ))}
                            {completed && (
                                <tr className="bg-green-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Artificial Intelligence Finals</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Just Now</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-500">Pending</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Badge color="yellow">Processing</Badge>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </Card>
            </>
        )}
      </main>
    </div>
  );
};