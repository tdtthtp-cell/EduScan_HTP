import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Clock, 
  Send, 
  RotateCcw, 
  CheckCircle2, 
  Sparkles, 
  Award,
  AlertCircle
} from 'lucide-react';
import { Exam, Student, ExamSubmission } from '../types/exam';
import { gradeExamSubmission, getGradeRank } from '../utils/scoring';
import { OfficialSheetVisualizer } from './OfficialSheetVisualizer';

interface OnlineTestViewProps {
  currentExam: Exam;
  students: Student[];
  onSaveSubmission: (submission: ExamSubmission) => void;
  onViewStudentReport: (submission: ExamSubmission) => void;
}

export const OnlineTestView: React.FC<OnlineTestViewProps> = ({
  currentExam,
  students,
  onSaveSubmission,
  onViewStudentReport,
}) => {
  const [sbd, setSbd] = useState<string>('010217');
  const [studentName, setStudentName] = useState<string>('Lâm Khánh Thi');
  const [selectedCode, setSelectedCode] = useState<string>(currentExam.codes[0] || '101');
  
  // Timer state (seconds)
  const [timeLeft, setTimeLeft] = useState<number>(currentExam.durationMinutes * 60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);

  // Student answers state
  const [part1Answers, setPart1Answers] = useState<Record<number, 'A' | 'B' | 'C' | 'D' | null>>({});
  const [part2Answers, setPart2Answers] = useState<Record<number, { a?: boolean | null; b?: boolean | null; c?: boolean | null; d?: boolean | null }>>({});
  const [part3Answers, setPart3Answers] = useState<Record<number, string | null>>({});

  const [submittedResult, setSubmittedResult] = useState<ExamSubmission | null>(null);

  // Questions for chosen code
  const questions = currentExam.questionsByCode[selectedCode] || Object.values(currentExam.questionsByCode)[0] || [];

  // Countdown timer effect
  useEffect(() => {
    if (!isTimerRunning || timeLeft <= 0 || submittedResult) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft, submittedResult]);

  // Sync student name when SBD changes
  const handleSbdSelect = (val: string) => {
    setSbd(val);
    const matched = students.find((s) => s.sbd === val);
    if (matched) setStudentName(matched.name);
  };

  const handleReset = () => {
    setPart1Answers({});
    setPart2Answers({});
    setPart3Answers({});
    setSubmittedResult(null);
    setTimeLeft(currentExam.durationMinutes * 60);
    setIsTimerRunning(true);
  };

  const handleSubmit = () => {
    const grading = gradeExamSubmission(questions, {
      part1: part1Answers,
      part2: part2Answers,
      part3: part3Answers,
    });

    const newSub: ExamSubmission = {
      id: `sub-online-${sbd}-${Date.now()}`,
      examId: currentExam.id,
      examTitle: currentExam.title,
      sbd,
      examCode: selectedCode,
      studentName: studentName || 'Học sinh',
      className: students.find((s) => s.sbd === sbd)?.className || '12A1',
      academicYear: students.find((s) => s.sbd === sbd)?.academicYear || currentExam.academicYear || '2024 - 2025',
      scannedAt: new Date().toLocaleString('vi-VN') + ' (Thi trực tuyến)',
      imagePreviewUrl: '/assets/aistudio/phieu_bgd_2025_preview.png',
      rawAnswers: {
        part1: part1Answers,
        part2: part2Answers,
        part3: part3Answers,
      },
      scores: grading.scores,
      questionResults: grading.questionResults,
      topicCompetencies: grading.topicCompetencies,
      levelCompetencies: grading.levelCompetencies,
      scanNotes: ['Bài thi trực tuyến nộp thành công.', 'Hệ thống đã tự động tính điểm theo ma trận BGD 2025.'],
      aiPedagogicalAdvice: `Thí sinh ${studentName} hoàn thành bài thi với điểm số ${grading.scores.totalScore}/10. Hãy tiếp tục phát huy ở các phần câu hỏi nhận biết & thông hiểu và rèn thêm kỹ năng suy luận các câu hỏi trắc nghiệm Đúng/Sai!`,
    };

    setSubmittedResult(newSub);
    onSaveSubmission(newSub);
    setIsTimerRunning(false);

    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {
      // ignore
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Info */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
              Phòng Thi Trực Tuyến
            </span>
            <span className="text-xs text-slate-500 font-medium">Phiếu làm bài chuẩn BGD 2025</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            {currentExam.title}
          </h1>
          <p className="text-xs text-slate-500">
            Thí sinh tương tác trực tiếp trên phiếu tô điện tử. Hệ thống tự động chấm điểm và ghi nhận vào sổ điểm lớp.
          </p>
        </div>

        {/* Timer Box */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-sm">
            <Clock className="w-5 h-5 text-amber-400 animate-pulse" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Thời gian còn lại</p>
              <p className="font-mono text-lg font-black tracking-widest text-amber-300">
                {formatTime(timeLeft)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="p-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs"
            title="Làm lại từ đầu"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Student Profile Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div>
          <label className="font-bold text-slate-700 block mb-1">Thí sinh thi:</label>
          <select
            value={sbd}
            onChange={(e) => handleSbdSelect(e.target.value)}
            disabled={Boolean(submittedResult)}
            className="w-full border border-slate-300 rounded-xl p-2 bg-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          >
            {students.map((st) => (
              <option key={st.sbd} value={st.sbd}>
                {st.sbd} - {st.name} ({st.className})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">Mã đề thi:</label>
          <select
            value={selectedCode}
            onChange={(e) => setSelectedCode(e.target.value)}
            disabled={Boolean(submittedResult)}
            className="w-full border border-slate-300 rounded-xl p-2 bg-white font-mono font-bold text-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          >
            {currentExam.codes.map((code) => (
              <option key={code} value={code}>
                Mã đề {code}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          {!submittedResult ? (
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20 transition-all hover:scale-101"
            >
              <Send className="w-4 h-4" />
              <span>Nộp bài & Chấm điểm ngay</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onViewStudentReport(submittedResult)}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20"
            >
              <Award className="w-4 h-4 text-amber-300" />
              <span>Xem báo cáo chi tiết ({submittedResult.scores.totalScore}đ)</span>
            </button>
          )}
        </div>
      </div>

      {/* Result Alert if submitted */}
      {submittedResult && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-5 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-white font-black text-xl">
              ✓
            </div>
            <div>
              <h3 className="font-bold text-base">
                Nộp bài thành công! Thí sinh: {submittedResult.studentName}
              </h3>
              <p className="text-xs text-emerald-100">
                Tổng điểm: <span className="font-black text-white text-sm">{submittedResult.scores.totalScore} / 10.0đ</span> • Xếp loại: {getGradeRank(submittedResult.scores.totalScore).rank}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onViewStudentReport(submittedResult)}
              className="px-4 py-2 rounded-xl bg-white text-emerald-800 font-bold text-xs shadow-md hover:bg-emerald-50 transition-colors"
            >
              Xem Phiếu Báo Điểm Chi Tiết
            </button>
          </div>
        </div>
      )}

      {/* The Interactive Official Sheet Visualizer */}
      <OfficialSheetVisualizer
        sbd={sbd}
        examCode={selectedCode}
        studentName={studentName}
        examTitle={currentExam.title}
        part1Answers={part1Answers}
        part2Answers={part2Answers}
        part3Answers={part3Answers}
        correctAnswers={
          submittedResult
            ? {
                part1: questions
                  .filter((q) => q.part === 1)
                  .reduce((acc, q) => ({ ...acc, [q.number]: q.correctAnswer }), {}),
                part2: questions
                  .filter((q) => q.part === 2)
                  .reduce((acc, q) => ({ ...acc, [q.number]: q.correctAnswer }), {}),
                part3: questions
                  .filter((q) => q.part === 3)
                  .reduce((acc, q) => ({ ...acc, [q.number]: q.correctAnswer }), {}),
              }
            : undefined
        }
        interactive={!submittedResult}
        onPart1Change={(qNum, choice) => {
          setPart1Answers((prev) => ({ ...prev, [qNum]: choice }));
        }}
        onPart2Change={(qNum, subItem, val) => {
          setPart2Answers((prev) => ({
            ...prev,
            [qNum]: { ...(prev[qNum] || {}), [subItem]: val },
          }));
        }}
        onPart3Change={(qNum, val) => {
          setPart3Answers((prev) => ({ ...prev, [qNum]: val }));
        }}
        maxPart1Questions={questions.filter((q) => q.part === 1).length || 12}
        maxPart2Questions={questions.filter((q) => q.part === 2).length || 4}
        maxPart3Questions={questions.filter((q) => q.part === 3).length || 6}
      />
    </div>
  );
};
