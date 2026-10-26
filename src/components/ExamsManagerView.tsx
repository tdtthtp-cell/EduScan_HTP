import React, { useState } from 'react';
import { 
  BookOpen, 
  Plus, 
  FileDown, 
  Clock, 
  Layers, 
  Sparkles, 
  FileText, 
  Check, 
  ListOrdered,
  Eye,
  Sliders,
  Trash2,
  Shuffle,
  Copy,
  Hash,
  AlertCircle
} from 'lucide-react';
import { Exam, ExamQuestion, COGNITIVE_LEVEL_LABELS, COGNITIVE_LEVEL_COLORS, CognitiveLevel } from '../types/exam';

interface ExamsManagerViewProps {
  exams: Exam[];
  currentExam: Exam;
  onSelectExam: (exam: Exam) => void;
  onCreateExam: (newExam: Exam) => void;
}

export const ExamsManagerView: React.FC<ExamsManagerViewProps> = ({
  exams,
  currentExam,
  onSelectExam,
  onCreateExam,
}) => {
  const [selectedCode, setSelectedCode] = useState<string>(currentExam.codes[0] || '101');
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showPdfViewerModal, setShowPdfViewerModal] = useState<boolean>(false);

  // Form state for creating a new exam
  const [newTitle, setNewTitle] = useState<string>('Đề kiểm tra Khảo sát Năng lực 2025');
  const [newSubject, setNewSubject] = useState<string>('Toán học');
  const [newGrade, setNewGrade] = useState<number>(12);
  const [newDuration, setNewDuration] = useState<number>(90);
  const [newAcademicYear, setNewAcademicYear] = useState<string>('2024 - 2025');

  // Exam codes management
  const [examCodes, setExamCodes] = useState<string[]>(['101', '102']);
  const [newCodeInput, setNewCodeInput] = useState<string>('');
  const [activeCodeTab, setActiveCodeTab] = useState<string>('101');

  // Question counts
  const [part1Count, setPart1Count] = useState<number>(12); // 12 for Math, 18 for Physics/Chem/Bio, or 40
  const [part2Count, setPart2Count] = useState<number>(4);  // 4 or 8 questions
  const [part3Count, setPart3Count] = useState<number>(6);  // 6 short answers

  // Answer keys per code: code -> list of ExamQuestion
  const [draftQuestionsByCode, setDraftQuestionsByCode] = useState<Record<string, ExamQuestion[]>>(() => {
    return initDefaultQuestions(['101', '102'], 12, 4, 6, 'Toán học');
  });

  // Helper to initialize questions
  function initDefaultQuestions(
    codes: string[],
    p1: number,
    p2: number,
    p3: number,
    subject: string
  ): Record<string, ExamQuestion[]> {
    const result: Record<string, ExamQuestion[]> = {};
    const topics = [
      `Chuyên đề 1: Kiến thức trọng tâm ${subject}`,
      `Chuyên đề 2: Kỹ năng suy luận & Ứng dụng`,
      `Chuyên đề 3: Phương pháp giải toán thực tế`,
      `Chuyên đề 4: Tổng hợp kiến thức nâng cao`,
    ];

    codes.forEach((code, codeIdx) => {
      const qList: ExamQuestion[] = [];
      const opts: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];

      // Part 1
      for (let i = 1; i <= p1; i++) {
        const topic = topics[(i - 1) % topics.length];
        const cognitiveLevel: CognitiveLevel =
          i <= Math.ceil(p1 * 0.4)
            ? 'recognition'
            : i <= Math.ceil(p1 * 0.7)
            ? 'comprehension'
            : i <= Math.ceil(p1 * 0.9)
            ? 'application'
            : 'advanced_application';

        qList.push({
          number: i,
          part: 1,
          topic,
          cognitiveLevel,
          maxScore: Number((3.0 / p1).toFixed(2)),
          correctAnswer: opts[(i + codeIdx) % 4],
        });
      }

      // Part 2
      for (let i = 1; i <= p2; i++) {
        const topic = topics[(i + 1) % topics.length];
        qList.push({
          number: i,
          part: 2,
          topic,
          cognitiveLevel: i <= 2 ? 'application' : 'advanced_application',
          maxScore: 1.0,
          correctAnswer: {
            a: (i + codeIdx) % 2 === 0,
            b: (i + codeIdx + 1) % 3 === 0,
            c: (i + codeIdx) % 2 !== 0,
            d: (i + codeIdx) % 3 !== 0,
          },
        });
      }

      // Part 3
      const samplePart3 = ['12.5', '4', '-3.2', '0.75', '100', '2.5'];
      for (let i = 1; i <= p3; i++) {
        const topic = topics[(i + 2) % topics.length];
        qList.push({
          number: i,
          part: 3,
          topic,
          cognitiveLevel: i <= 3 ? 'application' : 'advanced_application',
          maxScore: Number((3.0 / p3).toFixed(2)),
          correctAnswer: samplePart3[(i - 1) % samplePart3.length],
        });
      }

      result[code] = qList;
    });

    return result;
  }

  // Open modal and reset draft
  const handleOpenCreateModal = () => {
    const codes = ['101', '102'];
    setExamCodes(codes);
    setActiveCodeTab('101');
    setDraftQuestionsByCode(initDefaultQuestions(codes, part1Count, part2Count, part3Count, newSubject));
    setShowCreateModal(true);
  };

  // Add exam code
  const handleAddCode = () => {
    const trimmed = newCodeInput.trim();
    if (!trimmed) return;
    if (examCodes.includes(trimmed)) {
      alert('Mã đề này đã tồn tại!');
      return;
    }

    const updatedCodes = [...examCodes, trimmed];
    setExamCodes(updatedCodes);
    setNewCodeInput('');

    // Clone questions from first code with shuffled answers
    const baseQuestions = draftQuestionsByCode[examCodes[0]] || [];
    const clonedQuestions = baseQuestions.map((q) => {
      if (q.part === 1) {
        const opts: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];
        return { ...q, correctAnswer: opts[Math.floor(Math.random() * 4)] };
      } else if (q.part === 2) {
        return {
          ...q,
          correctAnswer: {
            a: Math.random() > 0.5,
            b: Math.random() > 0.5,
            c: Math.random() > 0.5,
            d: Math.random() > 0.5,
          },
        };
      }
      return { ...q };
    });

    setDraftQuestionsByCode((prev) => ({
      ...prev,
      [trimmed]: clonedQuestions,
    }));
    setActiveCodeTab(trimmed);
  };

  // Remove code
  const handleRemoveCode = (codeToRemove: string) => {
    if (examCodes.length <= 1) {
      alert('Đề thi phải có ít nhất 1 mã đề!');
      return;
    }
    const updatedCodes = examCodes.filter((c) => c !== codeToRemove);
    setExamCodes(updatedCodes);
    if (activeCodeTab === codeToRemove) {
      setActiveCodeTab(updatedCodes[0]);
    }
    const updatedDraft = { ...draftQuestionsByCode };
    delete updatedDraft[codeToRemove];
    setDraftQuestionsByCode(updatedDraft);
  };

  // Update question answer in draft
  const handleUpdatePart1Answer = (code: string, qNum: number, choice: 'A' | 'B' | 'C' | 'D') => {
    setDraftQuestionsByCode((prev) => {
      const list = [...(prev[code] || [])];
      const idx = list.findIndex((q) => q.part === 1 && q.number === qNum);
      if (idx >= 0) {
        list[idx] = { ...list[idx], correctAnswer: choice } as any;
      }
      return { ...prev, [code]: list };
    });
  };

  const handleUpdatePart2Answer = (code: string, qNum: number, subItem: 'a' | 'b' | 'c' | 'd', val: boolean) => {
    setDraftQuestionsByCode((prev) => {
      const list = [...(prev[code] || [])];
      const idx = list.findIndex((q) => q.part === 2 && q.number === qNum);
      if (idx >= 0) {
        const curr = list[idx].correctAnswer as any;
        list[idx] = {
          ...list[idx],
          correctAnswer: { ...curr, [subItem]: val },
        } as any;
      }
      return { ...prev, [code]: list };
    });
  };

  const handleUpdatePart3Answer = (code: string, qNum: number, val: string) => {
    setDraftQuestionsByCode((prev) => {
      const list = [...(prev[code] || [])];
      const idx = list.findIndex((q) => q.part === 3 && q.number === qNum);
      if (idx >= 0) {
        list[idx] = { ...list[idx], correctAnswer: val } as any;
      }
      return { ...prev, [code]: list };
    });
  };

  // Auto shuffle from code 0 to other codes
  const handleShuffleFromPrimary = () => {
    const primary = examCodes[0];
    const baseQuestions = draftQuestionsByCode[primary] || [];
    const opts: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];

    const newDraft: Record<string, ExamQuestion[]> = { [primary]: baseQuestions };
    examCodes.slice(1).forEach((code, idx) => {
      newDraft[code] = baseQuestions.map((q) => {
        if (q.part === 1) {
          const shift = (opts.indexOf(q.correctAnswer as any) + idx + 1) % 4;
          return { ...q, correctAnswer: opts[shift] };
        } else if (q.part === 2) {
          const ca = q.correctAnswer as any;
          return {
            ...q,
            correctAnswer: {
              a: idx % 2 === 0 ? !ca.a : ca.b,
              b: idx % 2 === 0 ? ca.c : !ca.b,
              c: idx % 2 === 0 ? !ca.c : ca.d,
              d: idx % 2 === 0 ? ca.a : !ca.d,
            },
          };
        }
        return { ...q };
      });
    });

    setDraftQuestionsByCode(newDraft);
    alert('Đã tạo đảo đáp án tự động từ Mã đề ' + primary + ' sang các mã đề còn lại!');
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (examCodes.length === 0) {
      alert('Vui lòng thêm ít nhất một mã đề thi!');
      return;
    }

    const newExam: Exam = {
      id: `exam-${Date.now()}`,
      title: newTitle,
      subject: newSubject,
      grade: newGrade,
      academicYear: newAcademicYear,
      durationMinutes: newDuration,
      totalScore: 10.0,
      codes: examCodes,
      scoringRuleDescription: `Phần I: ${part1Count} câu trắc nghiệm. Phần II: ${part2Count} câu Đúng/Sai (thang BGD 0.1 - 0.25 - 0.5 - 1.0). Phần III: ${part3Count} câu trả lời ngắn.`,
      matrix: [
        { topic: `Chuyên đề 1: Kiến thức trọng tâm ${newSubject}`, recognitionCount: 4, comprehensionCount: 3, applicationCount: 2, advancedCount: 1, totalScore: 3.5 },
        { topic: `Chuyên đề 2: Kỹ năng suy luận & Ứng dụng`, recognitionCount: 3, comprehensionCount: 2, applicationCount: 2, advancedCount: 1, totalScore: 2.75 },
        { topic: `Chuyên đề 3: Phương pháp giải toán thực tế`, recognitionCount: 2, comprehensionCount: 2, applicationCount: 1, advancedCount: 1, totalScore: 2.0 },
        { topic: `Chuyên đề 4: Tổng hợp kiến thức nâng cao`, recognitionCount: 2, comprehensionCount: 1, applicationCount: 1, advancedCount: 0, totalScore: 1.75 },
      ],
      questionsByCode: draftQuestionsByCode,
    };

    onCreateExam(newExam);
    onSelectExam(newExam);
    setSelectedCode(examCodes[0]);
    setShowCreateModal(false);
  };

  const questions = currentExam.questionsByCode[selectedCode] || Object.values(currentExam.questionsByCode)[0] || [];

  return (
    <div className="space-y-6">
      {/* Header & Quick Action */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              Quy chuẩn 2025
            </span>
            <span className="text-xs text-slate-500 font-medium">Khảo thí & Quản lý đề thi</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Quản Lý Đề Thi & Ma Trận Kiến Thức Chuẩn BGD
          </h1>
          <p className="text-xs text-slate-500">
            Hỗ trợ đầy đủ 3 phần thi, phân bổ 4 cấp độ tư duy (Nhận biết, Thông hiểu, Vận dụng, Vận dụng cao) và đáp án cho từng mã đề thi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowPdfViewerModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition-colors"
          >
            <Eye className="w-4 h-4 text-slate-700" />
            <span>Xem phiếu mẫu BGD</span>
          </button>

          <a
            href="/assets/aistudio/Phi_u_TNTL_2025_TNMaker_f1ed3d93.pdf"
            download="Phieu_Tra_Loi_Trac_Nghiem_2025_BGD.pdf"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 shadow-2xs transition-colors"
          >
            <FileDown className="w-4 h-4 text-blue-600" />
            <span>Tải PDF in A4</span>
          </a>

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all hover:scale-102"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo đề thi mới (Cấu hình Mã đề)</span>
          </button>
        </div>
      </div>

      {/* Exam List Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {exams.map((exam) => {
          const isSelected = exam.id === currentExam.id;
          return (
            <div
              key={exam.id}
              onClick={() => {
                onSelectExam(exam);
                setSelectedCode(exam.codes[0] || '101');
              }}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-blue-50/40 border-blue-500 shadow-sm ring-1 ring-blue-500'
                  : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  Môn {exam.subject} • Khối {exam.grade}
                </span>
                <span className="text-[10px] text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {exam.durationMinutes} phút
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 line-clamp-1 mb-1">
                {exam.title}
              </h3>
              <p className="text-[11px] text-slate-500 line-clamp-2 mb-3">
                {exam.scoringRuleDescription}
              </p>
              <div className="flex items-center justify-between text-[11px] border-t border-slate-100 pt-2 text-slate-600">
                <span className="font-semibold text-blue-700">
                  {exam.codes.length} mã đề ({exam.codes.join(', ')})
                </span>
                <span className="font-bold text-slate-800">Thang {exam.totalScore}đ</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Matrix Breakdown for Current Exam */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-600" />
              Bảng Ma Trận Kiến Thức Chuẩn Bộ Giáo Dục
            </h2>
            <p className="text-xs text-slate-500">
              Phân phối số câu hỏi và tỷ lệ điểm theo từng chủ đề & cấp độ nhận thức
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Mã đề đang xem:</span>
            <div className="flex gap-1">
              {currentExam.codes.map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setSelectedCode(code)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                    selectedCode === code
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Mã {code}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-700 border-y border-slate-200">
                <th className="py-2.5 px-3 font-bold">Chủ đề / Chuyên đề</th>
                <th className="py-2.5 px-3 font-bold text-center text-emerald-700">Nhận biết (NB)</th>
                <th className="py-2.5 px-3 font-bold text-center text-blue-700">Thông hiểu (TH)</th>
                <th className="py-2.5 px-3 font-bold text-center text-amber-700">Vận dụng (VD)</th>
                <th className="py-2.5 px-3 font-bold text-center text-rose-700">Vận dụng cao (VDC)</th>
                <th className="py-2.5 px-3 font-bold text-right">Tổng điểm</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentExam.matrix.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{row.topic}</td>
                  <td className="py-2.5 px-3 text-center font-mono font-medium text-emerald-700">{row.recognitionCount} câu</td>
                  <td className="py-2.5 px-3 text-center font-mono font-medium text-blue-700">{row.comprehensionCount} câu</td>
                  <td className="py-2.5 px-3 text-center font-mono font-medium text-amber-700">{row.applicationCount} câu</td>
                  <td className="py-2.5 px-3 text-center font-mono font-medium text-rose-700">{row.advancedCount} câu</td>
                  <td className="py-2.5 px-3 text-right font-black text-slate-900">{row.totalScore}đ</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50/80 font-bold text-slate-900 border-t border-slate-200">
                <td className="py-2.5 px-3">Tổng cộng toàn bài</td>
                <td className="py-2.5 px-3 text-center font-mono text-emerald-800">
                  {currentExam.matrix.reduce((a, b) => a + b.recognitionCount, 0)} câu
                </td>
                <td className="py-2.5 px-3 text-center font-mono text-blue-800">
                  {currentExam.matrix.reduce((a, b) => a + b.comprehensionCount, 0)} câu
                </td>
                <td className="py-2.5 px-3 text-center font-mono text-amber-800">
                  {currentExam.matrix.reduce((a, b) => a + b.applicationCount, 0)} câu
                </td>
                <td className="py-2.5 px-3 text-center font-mono text-rose-800">
                  {currentExam.matrix.reduce((a, b) => a + b.advancedCount, 0)} câu
                </td>
                <td className="py-2.5 px-3 text-right font-black text-blue-700">10.0đ</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Answer Key Details for selectedCode */}
        <div className="pt-4 border-t border-slate-100">
          <h3 className="text-xs font-bold text-slate-900 mb-3 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <ListOrdered className="w-4 h-4 text-blue-600" />
              Đáp Án Chuẩn - Mã Đề {selectedCode}
            </span>
            <span className="text-[11px] font-normal text-slate-500">
              Tổng số câu: {questions.length} câu
            </span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {questions.map((q) => {
              let answerDisplay = '';
              if (q.part === 1) {
                answerDisplay = q.correctAnswer;
              } else if (q.part === 2) {
                const ca = q.correctAnswer;
                answerDisplay = `a:${ca.a ? 'Đ' : 'S'} | b:${ca.b ? 'Đ' : 'S'} | c:${ca.c ? 'Đ' : 'S'} | d:${ca.d ? 'Đ' : 'S'}`;
              } else if (q.part === 3) {
                answerDisplay = q.correctAnswer;
              }

              return (
                <div key={`${q.part}-${q.number}`} className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/40 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-800">
                      Phần {q.part} - Câu {q.number}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold border ${COGNITIVE_LEVEL_COLORS[q.cognitiveLevel]}`}>
                      {COGNITIVE_LEVEL_LABELS[q.cognitiveLevel]}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 line-clamp-1 mb-1.5">
                    {q.topic}
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-blue-700 font-mono">
                      {answerDisplay}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {q.maxScore}đ
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal: View Official 2025 PDF */}
      {showPdfViewerModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Phiếu Trả Lời Trắc Nghiệm Mẫu 2025 - Bộ GD&ĐT
                </h3>
                <p className="text-xs text-slate-500">
                  File đính kèm chuẩn: Phi_u_TNTL_2025_TNMaker_f1ed3d93.pdf
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPdfViewerModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center p-2">
              <iframe
                src="/assets/aistudio/Phi_u_TNTL_2025_TNMaker_f1ed3d93.pdf"
                className="w-full h-[65vh] rounded"
                title="Phiếu mẫu BGD 2025"
              />
            </div>

            <div className="flex justify-end gap-2">
              <a
                href="/assets/aistudio/Phi_u_TNTL_2025_TNMaker_f1ed3d93.pdf"
                download="Phieu_Tra_Loi_Trac_Nghiem_2025_BGD.pdf"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5"
              >
                <FileDown className="w-4 h-4" />
                <span>Tải tệp PDF về máy</span>
              </a>
              <button
                type="button"
                onClick={() => setShowPdfViewerModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COMPREHENSIVE MODAL: Create Exam with Exam Codes & Answer Keys */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-5 sm:p-7 space-y-5 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  Tạo Đề Thi Mới & Cấu Hình Các Mã Đề Chuẩn BGD 2025
                </h3>
                <p className="text-xs text-slate-500">
                  Thiết lập danh sách mã đề thi (ví dụ 101, 102...) và bảng đáp án chi tiết cho từng mã đề.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-5 text-xs">
              {/* Section 1: General Info */}
              <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-blue-600" />
                  1. Thông tin chung về đề thi
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-8">
                    <label className="font-bold text-slate-700 block mb-1">Tên bài thi / Đề kiểm tra:</label>
                    <input
                      type="text"
                      required
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="VD: Đề thi Khảo sát Năng lực Môn Toán 2025"
                      className="w-full border border-slate-300 rounded-xl p-2.5 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-medium"
                    />
                  </div>

                  <div className="sm:col-span-4">
                    <label className="font-bold text-slate-700 block mb-1">Môn học:</label>
                    <select
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl p-2.5 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    >
                      <option value="Toán học">Toán học</option>
                      <option value="Vật lí">Vật lí</option>
                      <option value="Hóa học">Hóa học</option>
                      <option value="Sinh học">Sinh học</option>
                      <option value="Lịch sử">Lịch sử</option>
                      <option value="Địa lí">Địa lí</option>
                      <option value="Giáo dục kinh tế & pháp luật">GD KT&PL</option>
                      <option value="Tin học">Tin học</option>
                      <option value="Tiếng Anh">Tiếng Anh</option>
                    </select>
                  </div>

                  <div className="sm:col-span-4">
                    <label className="font-bold text-slate-700 block mb-1">Khối lớp:</label>
                    <select
                      value={newGrade}
                      onChange={(e) => setNewGrade(Number(e.target.value))}
                      className="w-full border border-slate-300 rounded-xl p-2.5 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    >
                      <option value={10}>Lớp 10</option>
                      <option value={11}>Lớp 11</option>
                      <option value={12}>Lớp 12</option>
                    </select>
                  </div>

                  <div className="sm:col-span-4">
                    <label className="font-bold text-slate-700 block mb-1">Thời gian làm bài (phút):</label>
                    <input
                      type="number"
                      required
                      min={15}
                      max={180}
                      value={newDuration}
                      onChange={(e) => setNewDuration(Number(e.target.value))}
                      className="w-full border border-slate-300 rounded-xl p-2.5 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>

                  <div className="sm:col-span-4">
                    <label className="font-bold text-slate-700 block mb-1">Niên khóa:</label>
                    <input
                      type="text"
                      value={newAcademicYear}
                      onChange={(e) => setNewAcademicYear(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl p-2.5 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Manage Exam Codes (Mã Đề Thi) */}
              <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide flex items-center gap-1.5">
                    <Hash className="w-4 h-4 text-emerald-600" />
                    2. Quản lý các Mã Đề Thi (Mục 8 trên phiếu tô)
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    Thêm các mã đề chuẩn 3 chữ số (ví dụ: 101, 102, 103, 104)
                  </span>
                </div>

                {/* Code list & Add Code input */}
                <div className="flex flex-wrap items-center gap-2 bg-white p-3 rounded-xl border border-slate-200">
                  <span className="font-semibold text-slate-600 text-xs">Mã đề hiện có:</span>
                  {examCodes.map((c) => (
                    <div
                      key={c}
                      className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold border transition-all ${
                        activeCodeTab === c
                          ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                          : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setActiveCodeTab(c)}
                        className="cursor-pointer font-mono"
                      >
                        Mã {c}
                      </button>
                      {examCodes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveCode(c)}
                          className="hover:text-rose-200 ml-1 text-slate-400 font-bold"
                          title="Xóa mã đề này"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}

                  <div className="flex items-center gap-1 ml-auto">
                    <input
                      type="text"
                      maxLength={3}
                      placeholder="Mã đề mới..."
                      value={newCodeInput}
                      onChange={(e) => setNewCodeInput(e.target.value.replace(/\D/g, ''))}
                      className="w-24 border border-slate-300 rounded-lg px-2 py-1 text-xs font-mono font-bold uppercase focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={handleAddCode}
                      className="px-2.5 py-1 bg-slate-900 text-white rounded-lg font-bold text-xs hover:bg-slate-800 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Thêm mã đề
                    </button>
                  </div>
                </div>

                {/* Quick actions for answer keys */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleShuffleFromPrimary}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 transition-colors"
                    >
                      <Shuffle className="w-3.5 h-3.5" />
                      <span>Đảo đáp án tự động từ Mã {examCodes[0]} sang các mã khác</span>
                    </button>
                  </div>
                  <span className="text-[11px] text-slate-500 italic">
                    * Đang xem & chỉnh sửa đáp án của: <strong className="text-blue-700 font-mono">Mã {activeCodeTab}</strong>
                  </span>
                </div>
              </div>

              {/* Section 3: Interactive Answer Key Editor for Active Code */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide flex items-center gap-1.5">
                    <ListOrdered className="w-4 h-4 text-blue-600" />
                    3. Bảng đáp án chi tiết cho Mã Đề {activeCodeTab}
                  </h4>
                  <div className="text-[11px] text-slate-500">
                    Phần I: {part1Count} câu • Phần II: {part2Count} câu • Phần III: {part3Count} câu
                  </div>
                </div>

                {/* Part 1 Answers: Radio A, B, C, D */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between bg-slate-800 text-white px-3 py-1 rounded">
                    <span className="font-bold text-[11px] uppercase">
                      Phần I: Trắc nghiệm 4 lựa chọn (A, B, C, D)
                    </span>
                    <span className="text-[10px] text-slate-300">{part1Count} câu</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {(draftQuestionsByCode[activeCodeTab] || [])
                      .filter((q) => q.part === 1)
                      .map((q) => (
                        <div key={q.number} className="p-2 border border-slate-200 rounded-lg bg-slate-50/50 text-center">
                          <span className="font-bold text-slate-700 block text-[11px] mb-1">
                            Câu {q.number}
                          </span>
                          <div className="flex justify-center gap-1">
                            {(['A', 'B', 'C', 'D'] as const).map((opt) => {
                              const isSelected = q.correctAnswer === opt;
                              return (
                                <button
                                  key={opt}
                                  type="button"
                                  onClick={() => handleUpdatePart1Answer(activeCodeTab, q.number, opt)}
                                  className={`w-5 h-5 rounded-full text-[10px] font-bold border transition-colors ${
                                    isSelected
                                      ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                                      : 'bg-white text-slate-600 border-slate-300 hover:border-slate-500'
                                  }`}
                                >
                                  {opt}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Part 2 Answers: True/False for a, b, c, d */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between bg-slate-800 text-white px-3 py-1 rounded">
                    <span className="font-bold text-[11px] uppercase">
                      Phần II: Trắc nghiệm Đúng / Sai (a, b, c, d)
                    </span>
                    <span className="text-[10px] text-amber-300">Thang BGD: 0.1 - 0.25 - 0.5 - 1.0đ</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                    {(draftQuestionsByCode[activeCodeTab] || [])
                      .filter((q) => q.part === 2)
                      .map((q) => {
                        const ca = q.correctAnswer as any;
                        return (
                          <div key={q.number} className="p-2.5 border border-slate-200 rounded-lg bg-slate-50/50">
                            <span className="font-bold text-slate-800 text-[11px] block border-b pb-1 mb-1.5">
                              Câu {q.number} (Đúng / Sai)
                            </span>
                            <div className="space-y-1">
                              {(['a', 'b', 'c', 'd'] as const).map((sub) => (
                                <div key={sub} className="flex items-center justify-between text-[11px]">
                                  <span className="font-bold text-slate-700 uppercase">{sub})</span>
                                  <div className="flex gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => handleUpdatePart2Answer(activeCodeTab, q.number, sub, true)}
                                      className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                                        ca[sub] === true
                                          ? 'bg-emerald-600 text-white border-emerald-700'
                                          : 'bg-white text-slate-600 border-slate-300'
                                      }`}
                                    >
                                      Đúng
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleUpdatePart2Answer(activeCodeTab, q.number, sub, false)}
                                      className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                                        ca[sub] === false
                                          ? 'bg-rose-600 text-white border-rose-700'
                                          : 'bg-white text-slate-600 border-slate-300'
                                      }`}
                                    >
                                      Sai
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Part 3 Answers: Short answer numeric inputs */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between bg-slate-800 text-white px-3 py-1 rounded">
                    <span className="font-bold text-[11px] uppercase">
                      Phần III: Trắc nghiệm Trả lời ngắn (Giá trị số chuẩn)
                    </span>
                    <span className="text-[10px] text-slate-300">{part3Count} câu</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                    {(draftQuestionsByCode[activeCodeTab] || [])
                      .filter((q) => q.part === 3)
                      .map((q) => (
                        <div key={q.number} className="p-2 border border-slate-200 rounded-lg bg-slate-50/50 text-center">
                          <span className="font-bold text-slate-800 text-[11px] block mb-1">
                            Câu {q.number}
                          </span>
                          <input
                            type="text"
                            value={String(q.correctAnswer || '')}
                            onChange={(e) => handleUpdatePart3Answer(activeCodeTab, q.number, e.target.value)}
                            placeholder="VD: 12.5"
                            className="w-full text-center font-mono font-bold text-xs border border-slate-300 rounded p-1 bg-white focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                          />
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20"
                >
                  <Check className="w-4 h-4" />
                  <span>Hoàn tất & Lưu Đề Thi ({examCodes.length} mã đề)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
