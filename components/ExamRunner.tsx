import React, { useState, useEffect, useMemo } from 'react';
import { Exam, Question, ProctorLog } from '../types';
import { Button, Card, Badge, Modal } from './UI';
import { ProctoringWidget } from './Proctoring';
import { Clock, Calculator, Code, Flag, CheckCircle, ChevronLeft, ChevronRight, AlertTriangle, X, Terminal } from 'lucide-react';

interface ExamRunnerProps {
  exam: Exam;
  studentId: string;
  onSubmit: (answers: Record<string, string>, logs: ProctorLog[]) => void;
  onExit: () => void;
}

// Fisher-Yates Shuffle Algorithm
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export const ExamRunner: React.FC<ExamRunnerProps> = ({ exam, studentId, onSubmit, onExit }) => {
  // Randomize questions once on mount
  const shuffledQuestions = useMemo(() => shuffleArray(exam.questions), [exam.questions]);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState(exam.durationMinutes * 60);
  const [showCalculator, setShowCalculator] = useState(false);
  const [logs, setLogs] = useState<ProctorLog[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<{id: string, text: string}[]>([]);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  
  // Code Editor & Output State
  const [code, setCode] = useState("// Write your solution here\n");
  const [consoleOutput, setConsoleOutput] = useState<string>("");
  const [isRunningCode, setIsRunningCode] = useState(false);

  // Timer Effect
  useEffect(() => {
    // Restore timer from local storage if exists (Simulation of persistence)
    const savedTime = localStorage.getItem(`exam_timer_${exam.id}_${studentId}`);
    if (savedTime) {
      setTimeLeft(parseInt(savedTime));
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const next = prev - 1;
        localStorage.setItem(`exam_timer_${exam.id}_${studentId}`, next.toString());
        if (next <= 0) {
          clearInterval(timer);
          finalSubmit();
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLog = (log: ProctorLog) => {
    setLogs(prev => [...prev, log]);
    
    // Trigger visual alert
    const alertId = Math.random().toString(36).substring(2, 9);
    const newAlert = { id: alertId, text: log.message };
    setActiveAlerts(prev => [...prev, newAlert]);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        setActiveAlerts(prev => prev.filter(a => a.id !== alertId));
    }, 5000);
  };

  const handleTerminate = () => {
    alert("Exam terminated due to multiple malpractice warnings.");
    finalSubmit();
  };

  const finalSubmit = () => {
    localStorage.removeItem(`exam_timer_${exam.id}_${studentId}`);
    onSubmit(answers, logs);
  };

  const runCodeSimulation = () => {
    setIsRunningCode(true);
    setConsoleOutput("Compiling...");
    
    setTimeout(() => {
      setIsRunningCode(false);
      const randomSuccess = Math.random() > 0.2;
      if (randomSuccess) {
         setConsoleOutput(`> Build Successful\n> Running...\n\nOutput:\nHello World\nResult: 42\n\nProcess finished with exit code 0`);
      } else {
         setConsoleOutput(`> Build Failed\n\nError: SyntaxError at line 4: unexpected token ';'\n    at Main.java:4:15`);
      }
    }, 1500);
  };

  const currentQuestion = shuffledQuestions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === shuffledQuestions.length - 1;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Stats for Modal
  const attemptedCount = Object.keys(answers).length;
  const reviewCount = markedForReview.size;
  const unattemptedCount = shuffledQuestions.length - attemptedCount;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col no-select relative">
      {/* Visual Alert Overlay */}
      <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 flex flex-col items-center pointer-events-none space-y-3 w-full max-w-lg px-4">
        {activeAlerts.map(alert => (
          <div key={alert.id} className="pointer-events-auto bg-white border-l-4 border-red-500 shadow-xl rounded-r-lg p-4 flex items-start gap-3 w-full animate-in slide-in-from-top-2 fade-in duration-300">
             <div className="p-2 bg-red-100 rounded-full shrink-0">
               <AlertTriangle className="text-red-600" size={20} />
             </div>
             <div className="flex-1 min-w-0">
               <h4 className="font-bold text-sm text-gray-900">Proctoring Alert</h4>
               <p className="text-sm text-gray-600 mt-0.5 break-words leading-snug">{alert.text}</p>
             </div>
             <button onClick={() => setActiveAlerts(prev => prev.filter(a => a.id !== alert.id))} className="text-gray-400 hover:text-gray-600 p-1 transition-colors">
               <X size={16} />
             </button>
          </div>
        ))}
      </div>

      {/* Top Bar */}
      <div className="bg-white shadow-sm border-b px-4 py-3 flex justify-between items-center sticky top-0 z-30">
        <div>
          <h2 className="font-bold text-gray-800">{exam.title}</h2>
          <span className="text-xs text-gray-500">Subject: {exam.subject} {exam.negativeMarking && <span className="ml-2 text-red-500 font-semibold">• Negative Marking</span>}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-gray-100 px-3 py-1 rounded-full flex items-center gap-2 font-mono font-bold text-brand-700">
            <Clock size={16} />
            {formatTime(timeLeft)}
          </div>
          <Button size="sm" variant="danger" onClick={() => setIsSubmitModalOpen(true)}>Finish Exam</Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar: Question Palette */}
        <div className="w-64 bg-white border-r overflow-y-auto p-4 hidden md:block">
          <h3 className="font-semibold text-gray-700 mb-4">Question Palette</h3>
          <div className="grid grid-cols-4 gap-2">
            {shuffledQuestions.map((q, idx) => {
              const isAnswered = answers[q.id];
              const isReview = markedForReview.has(q.id);
              let btnClass = "bg-gray-100 text-gray-600 hover:bg-gray-200";
              if (isReview) btnClass = "bg-yellow-100 text-yellow-700 border border-yellow-300";
              else if (isAnswered) btnClass = "bg-green-100 text-green-700 border border-green-300";
              if (currentQuestionIndex === idx) btnClass += " ring-2 ring-brand-500";

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`h-10 w-10 rounded flex items-center justify-center text-sm font-medium transition-all ${btnClass}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
          
          <div className="mt-8 space-y-2 text-xs text-gray-500">
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div> Answered</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded"></div> Marked for Review</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-gray-100 border rounded"></div> Not Visited</div>
          </div>
        </div>

        {/* Main Question Area */}
        <div className="flex-1 p-6 overflow-y-auto relative bg-gray-100/50">
          <ProctoringWidget isActive={true} onLog={handleLog} onTerminate={handleTerminate} />

          <Card className="max-w-4xl mx-auto mb-20 shadow-lg border-t-4 border-t-brand-500">
             <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-4">
                <div>
                   <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Question {currentQuestionIndex + 1}</span>
                   <span className="mx-2 text-gray-300">|</span>
                   <Badge color="blue">{currentQuestion.marks} Marks</Badge>
                </div>
                <div className="flex gap-2">
                   <button 
                     onClick={() => {
                        const newSet = new Set(markedForReview);
                        if (newSet.has(currentQuestion.id)) newSet.delete(currentQuestion.id);
                        else newSet.add(currentQuestion.id);
                        setMarkedForReview(newSet);
                     }}
                     className={`flex items-center gap-1 text-sm px-3 py-1 rounded transition-colors ${markedForReview.has(currentQuestion.id) ? 'text-yellow-700 bg-yellow-50 font-bold' : 'text-gray-500 hover:bg-gray-100'}`}
                   >
                     <Flag size={14} fill={markedForReview.has(currentQuestion.id) ? "currentColor" : "none"} />
                     {markedForReview.has(currentQuestion.id) ? "Unmark" : "Mark for Review"}
                   </button>
                   {exam.calculatorAllowed && (
                     <button onClick={() => setShowCalculator(!showCalculator)} className="text-gray-500 hover:bg-gray-100 p-2 rounded" title="Open Calculator">
                        <Calculator size={18} />
                     </button>
                   )}
                </div>
             </div>

             <h3 className="text-xl font-medium text-gray-900 mb-8 leading-relaxed font-serif">
               {currentQuestion.text}
             </h3>

             {/* Question Type Rendering */}
             <div className="space-y-4">
               {/* MCQ */}
               {currentQuestion.options && (
                 currentQuestion.options.map((opt, oIdx) => (
                   <label key={oIdx} className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${answers[currentQuestion.id] === opt ? 'bg-brand-50 border-brand-500 ring-1 ring-brand-500 shadow-sm' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                     <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-4 ${answers[currentQuestion.id] === opt ? 'border-brand-600 bg-brand-600' : 'border-gray-300'}`}>
                       {answers[currentQuestion.id] === opt && <div className="w-2 h-2 bg-white rounded-full"></div>}
                     </div>
                     <input 
                       type="radio" 
                       name={`q-${currentQuestion.id}`} 
                       className="hidden"
                       checked={answers[currentQuestion.id] === opt}
                       onChange={() => setAnswers({...answers, [currentQuestion.id]: opt})}
                     />
                     <span className={`text-base ${answers[currentQuestion.id] === opt ? 'text-brand-900 font-medium' : 'text-gray-700'}`}>{opt}</span>
                   </label>
                 ))
               )}

               {/* Coding / Practical Simulation */}
               {!currentQuestion.options && (
                 <div className="space-y-0 shadow-lg rounded-lg overflow-hidden border border-gray-700">
                    <div className="bg-gray-800 text-gray-300 p-2 flex justify-between items-center text-xs px-4">
                       <span className="flex items-center gap-2"><Code size={14}/> Main.java</span>
                       <span className="text-gray-500">Java JDK 17</span>
                    </div>
                    <textarea 
                      className="w-full h-64 bg-[#1e1e1e] text-[#d4d4d4] font-mono p-4 text-sm focus:outline-none resize-y"
                      value={answers[currentQuestion.id] || code}
                      onChange={(e) => setAnswers({...answers, [currentQuestion.id]: e.target.value})}
                      spellCheck={false}
                    />
                    <div className="bg-[#1e1e1e] border-t border-gray-700 p-2 flex justify-end">
                       <Button size="sm" variant="secondary" icon={Terminal} onClick={runCodeSimulation} isLoading={isRunningCode} className="!bg-brand-600 !text-white !border-none hover:!bg-brand-700">Run Code</Button>
                    </div>
                    {consoleOutput && (
                      <div className="bg-black text-green-400 font-mono text-xs p-4 border-t border-gray-700 max-h-40 overflow-y-auto whitespace-pre-wrap">
                        {consoleOutput}
                      </div>
                    )}
                 </div>
               )}
             </div>
          </Card>

          {/* Bottom Nav */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-between items-center z-20 md:pl-64 shadow-lg-up">
            <Button 
              variant="secondary" 
              onClick={() => setCurrentQuestionIndex(p => Math.max(0, p - 1))}
              disabled={currentQuestionIndex === 0}
              icon={ChevronLeft}
            >
              Previous
            </Button>
            
            <Button 
              variant="primary" 
              onClick={() => {
                if (isLastQuestion) setIsSubmitModalOpen(true);
                else setCurrentQuestionIndex(p => Math.min(shuffledQuestions.length - 1, p + 1));
              }}
            >
              {isLastQuestion ? "Finish Exam" : "Next Question"} {isLastQuestion ? <CheckCircle className="ml-2 w-4 h-4"/> : <ChevronRight className="ml-2 w-4 h-4"/>}
            </Button>
          </div>
        </div>
      </div>

      {/* Calculator Modal */}
      {showCalculator && (
        <div className="fixed top-24 right-24 z-50 bg-white shadow-2xl rounded-xl border w-72 p-4 animate-in fade-in zoom-in duration-200">
           <div className="flex justify-between mb-4 border-b pb-2">
              <span className="font-bold text-gray-700 flex items-center gap-2"><Calculator size={16}/> Scientific</span>
              <button onClick={() => setShowCalculator(false)} className="text-gray-400 hover:text-gray-600">×</button>
           </div>
           <div className="bg-gray-100 p-3 text-right rounded-lg mb-4 font-mono text-2xl tracking-widest text-gray-800 shadow-inner">0</div>
           <div className="grid grid-cols-4 gap-2">
              {['C','(',')','/','7','8','9','*','4','5','6','-','1','2','3','+','0','.','=','^'].map(key => (
                 <button key={key} className={`rounded p-3 text-sm font-bold shadow-sm active:scale-95 transition-transform ${key === '=' ? 'bg-brand-600 text-white' : 'bg-gray-50 border hover:bg-gray-100 text-gray-700'}`}>{key}</button>
              ))}
           </div>
        </div>
      )}

      {/* Submission Modal */}
      <Modal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        title="Confirm Submission"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsSubmitModalOpen(false)}>Return to Exam</Button>
            <Button variant="danger" onClick={finalSubmit} icon={CheckCircle}>Confirm Submit</Button>
          </>
        }
      >
        <div className="text-center sm:text-left">
           <div className="bg-blue-50 p-4 rounded-lg mb-6 flex items-start">
             <AlertTriangle className="text-blue-600 mt-1 mr-3 flex-shrink-0" />
             <p className="text-sm text-blue-800">
               Are you sure you want to submit? You cannot change your answers after submission.
             </p>
           </div>

           <div className="grid grid-cols-3 gap-4 text-center">
             <div className="p-3 bg-green-50 rounded-lg border border-green-100">
               <div className="text-2xl font-bold text-green-600">{attemptedCount}</div>
               <div className="text-xs text-green-800 font-medium uppercase mt-1">Attempted</div>
             </div>
             <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-100">
               <div className="text-2xl font-bold text-yellow-600">{reviewCount}</div>
               <div className="text-xs text-yellow-800 font-medium uppercase mt-1">Marked</div>
             </div>
             <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
               <div className="text-2xl font-bold text-gray-600">{unattemptedCount}</div>
               <div className="text-xs text-gray-600 font-medium uppercase mt-1">Skipped</div>
             </div>
           </div>
           
           <p className="text-xs text-gray-500 mt-6 text-center">
             Time Remaining: {formatTime(timeLeft)}
           </p>
        </div>
      </Modal>
    </div>
  );
};