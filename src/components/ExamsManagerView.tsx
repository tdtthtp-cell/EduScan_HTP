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
  AlertCircle,
  AlertTriangle,
  Edit3,
  CheckCircle2,
  Calendar,
  Award,
  HelpCircle,
  X,
  Bookmark,
  ChevronRight
} from 'lucide-react';
import { 
  Exam, 
  ExamQuestion, 
  ExamMatrixItem, 
  COGNITIVE_LEVEL_LABELS, 
  COGNITIVE_LEVEL_COLORS, 
  CognitiveLevel 
} from '../types/exam';

interface ExamsManagerViewProps {
  exams: Exam[];
  currentExam: Exam;
  onSelectExam: (exam: Exam) => void;
  onCreateExam: (newExam: Exam) => void;
  onUpdateExam?: (updatedExam: Exam) => void;
  onDeleteExam?: (examId: string) => void;
}

// Preset standard templates according to practical Ministry of Education & Training guidelines
interface MatrixPreset {
  id: string;
  name: string;
  subject: string;
  grade: number;
  durationMinutes: number;
  part1Count: number;
  part2Count: number;
  part3Count: number;
  description: string;
  matrix: ExamMatrixItem[];
}

const PRESET_TEMPLATES: MatrixPreset[] = [
  {
    id: 'toan-bgd-2025',
    name: 'Toán học (Chuẩn Bộ GD&ĐT 2025)',
    subject: 'Toán học',
    grade: 12,
    durationMinutes: 90,
    part1Count: 12,
    part2Count: 4,
    part3Count: 6,
    description: 'Phần I: 12 câu trắc nghiệm (0.25đ = 3đ). Phần II: 4 câu Đúng/Sai (1.0đ = 4đ). Phần III: 6 câu trả lời ngắn (0.5đ = 3đ).',
    matrix: [
      { topic: 'Đạo hàm & Ứng dụng khảo sát hàm số', recognitionCount: 4, comprehensionCount: 3, applicationCount: 2, advancedCount: 1, totalScore: 3.5 },
      { topic: 'Toạ độ trong không gian Oxyz', recognitionCount: 3, comprehensionCount: 2, applicationCount: 2, advancedCount: 1, totalScore: 2.75 },
      { topic: 'Xác suất có điều kiện & Thống kê', recognitionCount: 2, comprehensionCount: 2, applicationCount: 1, advancedCount: 1, totalScore: 2.0 },
      { topic: 'Nguyên hàm & Tích phân thực tế', recognitionCount: 2, comprehensionCount: 1, applicationCount: 1, advancedCount: 0, totalScore: 1.75 },
    ],
  },
  {
    id: 'vatly-bgd-2025',
    name: 'Vật lí (Chuẩn Bộ GD&ĐT 2025)',
    subject: 'Vật lí',
    grade: 12,
    durationMinutes: 50,
    part1Count: 18,
    part2Count: 4,
    part3Count: 6,
    description: 'Phần I: 18 câu trắc nghiệm (0.25đ = 4.5đ). Phần II: 4 câu Đúng/Sai (1.0đ = 4đ). Phần III: 6 câu trả lời ngắn (0.25đ = 1.5đ).',
    matrix: [
      { topic: 'Vật lí nhiệt & Khí lý tưởng', recognitionCount: 6, comprehensionCount: 4, applicationCount: 2, advancedCount: 1, totalScore: 4.25 },
      { topic: 'Từ trường & Cảm ứng điện từ', recognitionCount: 5, comprehensionCount: 3, applicationCount: 2, advancedCount: 1, totalScore: 3.5 },
      { topic: 'Vật lí hạt nhân & Phóng xạ', recognitionCount: 4, comprehensionCount: 2, applicationCount: 1, advancedCount: 1, totalScore: 2.25 },
    ],
  },
  {
    id: 'hoahoc-bgd-2025',
    name: 'Hóa học (Chuẩn Bộ GD&ĐT 2025)',
    subject: 'Hóa học',
    grade: 12,
    durationMinutes: 50,
    part1Count: 18,
    part2Count: 4,
    part3Count: 6,
    description: 'Phần I: 18 câu trắc nghiệm (0.25đ = 4.5đ). Phần II: 4 câu Đúng/Sai (1.0đ = 4đ). Phần III: 6 câu trả lời ngắn (0.25đ = 1.5đ).',
    matrix: [
      { topic: 'Este - Lipit & Hợp chất Cacbohidrat', recognitionCount: 5, comprehensionCount: 3, applicationCount: 2, advancedCount: 1, totalScore: 3.75 },
      { topic: 'Hợp chất chứa Nitơ & Polime', recognitionCount: 5, comprehensionCount: 3, applicationCount: 2, advancedCount: 1, totalScore: 3.5 },
      { topic: 'Kim loại & Hóa học môi trường', recognitionCount: 4, comprehensionCount: 3, applicationCount: 1, advancedCount: 1, totalScore: 2.75 },
    ],
  },
  {
    id: 'sinhhoc-bgd-2025',
    name: 'Sinh học (Chuẩn Bộ GD&ĐT 2025)',
    subject: 'Sinh học',
    grade: 12,
    durationMinutes: 50,
    part1Count: 18,
    part2Count: 4,
    part3Count: 6,
    description: 'Phần I: 18 câu trắc nghiệm (0.25đ = 4.5đ). Phần II: 4 câu Đúng/Sai (1.0đ = 4đ). Phần III: 6 câu trả lời ngắn (0.25đ = 1.5đ).',
    matrix: [
      { topic: 'Di truyền học phân tử & tế bào', recognitionCount: 6, comprehensionCount: 4, applicationCount: 2, advancedCount: 1, totalScore: 4.5 },
      { topic: 'Quy luật di truyền & Di truyền học người', recognitionCount: 5, comprehensionCount: 3, applicationCount: 2, advancedCount: 1, totalScore: 3.5 },
      { topic: 'Tiến hóa & Sinh thái học môi trường', recognitionCount: 4, comprehensionCount: 2, applicationCount: 1, advancedCount: 1, totalScore: 2.0 },
    ],
  },
  {
    id: 'lichsu-bgd-2025',
    name: 'Lịch sử / Địa lí / KT&PL (Chuẩn 28 câu)',
    subject: 'Lịch sử',
    grade: 12,
    durationMinutes: 50,
    part1Count: 24,
    part2Count: 4,
    part3Count: 0,
    description: 'Phần I: 24 câu trắc nghiệm (0.25đ = 6.0đ). Phần II: 4 câu Đúng/Sai (1.0đ = 4.0đ). Môn KHXH không có Phần III.',
    matrix: [
      { topic: 'Lịch sử Việt Nam thời kỳ hiện đại', recognitionCount: 9, comprehensionCount: 5, applicationCount: 3, advancedCount: 1, totalScore: 5.75 },
      { topic: 'Lịch sử thế giới & Quan hệ quốc tế', recognitionCount: 7, comprehensionCount: 4, applicationCount: 2, advancedCount: 1, totalScore: 4.25 },
    ],
  },
  {
    id: 'kiem-tra-45p',
    name: 'Kiểm tra 1 tiết / 45 phút linh hoạt',
    subject: 'Toán học',
    grade: 12,
    durationMinutes: 45,
    part1Count: 20,
    part2Count: 2,
    part3Count: 4,
    description: 'Phần I: 20 câu trắc nghiệm (0.25đ = 5.0đ). Phần II: 2 câu Đúng/Sai (1.0đ = 2.0đ). Phần III: 4 câu trả lời ngắn (0.75đ = 3.0đ).',
    matrix: [
      { topic: 'Kiến thức kiểm tra định kỳ chương 1', recognitionCount: 7, comprehensionCount: 5, applicationCount: 2, advancedCount: 1, totalScore: 4.5 },
      { topic: 'Kiến thức kiểm tra định kỳ chương 2', recognitionCount: 6, comprehensionCount: 4, applicationCount: 2, advancedCount: 1, totalScore: 4.0 },
      { topic: 'Bài toán vận dụng thực tế nâng cao', recognitionCount: 1, comprehensionCount: 1, applicationCount: 1, advancedCount: 1, totalScore: 1.5 },
    ],
  },
];

export const ExamsManagerView: React.FC<ExamsManagerViewProps> = ({
  exams,
  currentExam,
  onSelectExam,
  onCreateExam,
  onUpdateExam,
  onDeleteExam,
}) => {
  const [selectedCode, setSelectedCode] = useState<string>(currentExam.codes[0] || '101');
  const [showPdfViewerModal, setShowPdfViewerModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Unified Exam & Matrix Editor Modal State
  const [showEditorModal, setShowEditorModal] = useState<boolean>(false);
  const [editorMode, setEditorMode] = useState<'create' | 'edit'>('edit');
  const [activeModalTab, setActiveModalTab] = useState<'info' | 'matrix' | 'answers'>('info');

  // Exam form fields
  const [editingExamId, setEditingExamId] = useState<string>(currentExam.id);
  const [formTitle, setFormTitle] = useState<string>(currentExam.title);
  const [formSubject, setFormSubject] = useState<string>(currentExam.subject);
  const [formGrade, setFormGrade] = useState<number>(currentExam.grade);
  const [formDuration, setFormDuration] = useState<number>(currentExam.durationMinutes);
  const [formAcademicYear, setFormAcademicYear] = useState<string>(currentExam.academicYear);
  const [formTotalScore, setFormTotalScore] = useState<number>(currentExam.totalScore || 10.0);
  const [formScoringRule, setFormScoringRule] = useState<string>(currentExam.scoringRuleDescription);

  // Editable Matrix state
  const [editableMatrix, setEditableMatrix] = useState<ExamMatrixItem[]>(() => {
    return JSON.parse(JSON.stringify(currentExam.matrix));
  });

  // Exam codes management
  const [formCodes, setFormCodes] = useState<string[]>(currentExam.codes);
  const [newCodeInput, setNewCodeInput] = useState<string>('');
  const [activeCodeTab, setActiveCodeTab] = useState<string>(currentExam.codes[0] || '101');

  // Answer keys per code
  const [draftQuestionsByCode, setDraftQuestionsByCode] = useState<Record<string, ExamQuestion[]>>(() => {
    return JSON.parse(JSON.stringify(currentExam.questionsByCode));
  });

  // Delete Exam confirmation modal
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    isOpen: boolean;
    exam?: Exam;
  }>({ isOpen: false });

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Open Editor for Creating a New Exam
  const handleOpenCreateModal = () => {
    const defaultPreset = PRESET_TEMPLATES[0];
    setEditorMode('create');
    setEditingExamId(`exam-${Date.now()}`);
    setFormTitle('Đề kiểm tra Khảo sát Năng lực 2026');
    setFormSubject(defaultPreset.subject);
    setFormGrade(defaultPreset.grade);
    setFormDuration(defaultPreset.durationMinutes);
    setFormAcademicYear(currentExam.academicYear || '2026 - 2027');
    setFormTotalScore(10.0);
    setFormScoringRule(defaultPreset.description);
    setEditableMatrix(JSON.parse(JSON.stringify(defaultPreset.matrix)));

    const codes = ['101', '102'];
    setFormCodes(codes);
    setActiveCodeTab('101');
    setDraftQuestionsByCode(
      initQuestionsFromMatrix(codes, defaultPreset.matrix, defaultPreset.part1Count, defaultPreset.part2Count, defaultPreset.part3Count)
    );

    setActiveModalTab('info');
    setShowEditorModal(true);
  };

  // Open Editor for Editing an Existing Exam
  const handleOpenEditModal = (exam: Exam, initialTab: 'info' | 'matrix' | 'answers' = 'info') => {
    setEditorMode('edit');
    setEditingExamId(exam.id);
    setFormTitle(exam.title);
    setFormSubject(exam.subject);
    setFormGrade(exam.grade);
    setFormDuration(exam.durationMinutes);
    setFormAcademicYear(exam.academicYear);
    setFormTotalScore(exam.totalScore || 10.0);
    setFormScoringRule(exam.scoringRuleDescription);
    setEditableMatrix(JSON.parse(JSON.stringify(exam.matrix)));

    setFormCodes([...exam.codes]);
    setActiveCodeTab(exam.codes[0] || '101');
    setDraftQuestionsByCode(JSON.parse(JSON.stringify(exam.questionsByCode)));

    setActiveModalTab(initialTab);
    setShowEditorModal(true);
  };

  // Apply a sample matrix preset into the editor
  const handleApplyPreset = (preset: MatrixPreset) => {
    setFormSubject(preset.subject);
    setFormGrade(preset.grade);
    setFormDuration(preset.durationMinutes);
    setFormScoringRule(preset.description);
    setEditableMatrix(JSON.parse(JSON.stringify(preset.matrix)));

    // Re-generate or adapt questions
    const generatedQuestions = initQuestionsFromMatrix(
      formCodes,
      preset.matrix,
      preset.part1Count,
      preset.part2Count,
      preset.part3Count
    );
    setDraftQuestionsByCode(generatedQuestions);

    showNotification(`Đã áp dụng mẫu ma trận "${preset.name}"!`);
  };

  // Helper to initialize questions based on matrix and part counts
  function initQuestionsFromMatrix(
    codes: string[],
    matrix: ExamMatrixItem[],
    p1: number,
    p2: number,
    p3: number
  ): Record<string, ExamQuestion[]> {
    const result: Record<string, ExamQuestion[]> = {};
    const topics = matrix.map((m) => m.topic);
    const opts: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];

    codes.forEach((code, codeIdx) => {
      const qList: ExamQuestion[] = [];

      // Part 1: Multiple choice
      for (let i = 1; i <= p1; i++) {
        const topic = topics[(i - 1) % topics.length] || 'Kiến thức trọng tâm';
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
          maxScore: Number((3.0 / Math.max(1, p1)).toFixed(2)),
          correctAnswer: opts[(i + codeIdx) % 4],
        });
      }

      // Part 2: True / False
      for (let i = 1; i <= p2; i++) {
        const topic = topics[(i + 1) % topics.length] || 'Kiến thức trọng tâm';
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

      // Part 3: Short answer
      const samplePart3 = ['12.5', '4', '-3.2', '0.75', '100', '2.5'];
      for (let i = 1; i <= p3; i++) {
        const topic = topics[(i + 2) % topics.length] || 'Kiến thức trọng tâm';
        qList.push({
          number: i,
          part: 3,
          topic,
          cognitiveLevel: i <= 3 ? 'application' : 'advanced_application',
          maxScore: Number((3.0 / Math.max(1, p3)).toFixed(2)),
          correctAnswer: samplePart3[(i - 1) % samplePart3.length],
        });
      }

      result[code] = qList;
    });

    return result;
  }

  // Matrix Editing Handlers
  const handleMatrixCellChange = (index: number, field: keyof ExamMatrixItem, value: any) => {
    setEditableMatrix((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleAddMatrixRow = () => {
    const newRow: ExamMatrixItem = {
      topic: `Chuyên đề ${editableMatrix.length + 1}: Chủ đề kiến thức mới`,
      recognitionCount: 2,
      comprehensionCount: 2,
      applicationCount: 1,
      advancedCount: 0,
      totalScore: 1.5,
    };
    setEditableMatrix((prev) => [...prev, newRow]);
  };

  const handleRemoveMatrixRow = (index: number) => {
    if (editableMatrix.length <= 1) {
      alert('Ma trận đề thi cần có ít nhất 1 chủ đề / chuyên đề!');
      return;
    }
    setEditableMatrix((prev) => prev.filter((_, i) => i !== index));
  };

  // Matrix Summary Calculations
  const matrixTotalNB = editableMatrix.reduce((a, b) => a + (Number(b.recognitionCount) || 0), 0);
  const matrixTotalTH = editableMatrix.reduce((a, b) => a + (Number(b.comprehensionCount) || 0), 0);
  const matrixTotalVD = editableMatrix.reduce((a, b) => a + (Number(b.applicationCount) || 0), 0);
  const matrixTotalVDC = editableMatrix.reduce((a, b) => a + (Number(b.advancedCount) || 0), 0);
  const matrixTotalQuestions = matrixTotalNB + matrixTotalTH + matrixTotalVD + matrixTotalVDC;
  const matrixTotalScore = Number(editableMatrix.reduce((a, b) => a + (Number(b.totalScore) || 0), 0).toFixed(2));

  // Exam codes management
  const handleAddCode = () => {
    const trimmed = newCodeInput.trim();
    if (!trimmed) return;
    if (formCodes.includes(trimmed)) {
      alert('Mã đề này đã tồn tại!');
      return;
    }

    const updatedCodes = [...formCodes, trimmed];
    setFormCodes(updatedCodes);
    setNewCodeInput('');

    // Clone questions from first code with shuffled answers
    const baseQuestions = draftQuestionsByCode[formCodes[0]] || [];
    const opts: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];
    const clonedQuestions = baseQuestions.map((q) => {
      if (q.part === 1) {
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

  const handleRemoveCode = (codeToRemove: string) => {
    if (formCodes.length <= 1) {
      alert('Đề thi phải có ít nhất 1 mã đề!');
      return;
    }
    const updatedCodes = formCodes.filter((c) => c !== codeToRemove);
    setFormCodes(updatedCodes);
    if (activeCodeTab === codeToRemove) {
      setActiveCodeTab(updatedCodes[0]);
    }
    const updatedDraft = { ...draftQuestionsByCode };
    delete updatedDraft[codeToRemove];
    setDraftQuestionsByCode(updatedDraft);
  };

  // Shuffle answers from base code to other codes
  const handleShuffleFromPrimary = () => {
    const primary = formCodes[0];
    const baseQuestions = draftQuestionsByCode[primary] || [];
    const opts: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];

    const newDraft: Record<string, ExamQuestion[]> = { [primary]: baseQuestions };
    formCodes.slice(1).forEach((code, idx) => {
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
    showNotification(`Đã tự động đảo đáp án từ Mã đề ${primary} sang các mã còn lại!`);
  };

  // Update questions in draft
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

  const handleUpdateQuestionMeta = (
    code: string,
    part: 1 | 2 | 3,
    qNum: number,
    field: 'topic' | 'cognitiveLevel' | 'maxScore',
    value: any
  ) => {
    setDraftQuestionsByCode((prev) => {
      const list = [...(prev[code] || [])];
      const idx = list.findIndex((q) => q.part === part && q.number === qNum);
      if (idx >= 0) {
        list[idx] = { ...list[idx], [field]: value } as any;
      }
      return { ...prev, [code]: list };
    });
  };

  // Add question to a part
  const handleAddQuestionToPart = (code: string, part: 1 | 2 | 3) => {
    setDraftQuestionsByCode((prev) => {
      const list = [...(prev[code] || [])];
      const existingInPart = list.filter((q) => q.part === part);
      const nextNum = existingInPart.length + 1;
      const defaultTopic = editableMatrix[0]?.topic || 'Kiến thức trọng tâm';

      let newQuestion: ExamQuestion;
      if (part === 1) {
        newQuestion = {
          number: nextNum,
          part: 1,
          topic: defaultTopic,
          cognitiveLevel: 'comprehension',
          maxScore: 0.25,
          correctAnswer: 'A',
        };
      } else if (part === 2) {
        newQuestion = {
          number: nextNum,
          part: 2,
          topic: defaultTopic,
          cognitiveLevel: 'application',
          maxScore: 1.0,
          correctAnswer: { a: true, b: false, c: true, d: false },
        };
      } else {
        newQuestion = {
          number: nextNum,
          part: 3,
          topic: defaultTopic,
          cognitiveLevel: 'application',
          maxScore: 0.5,
          correctAnswer: '0',
        };
      }

      return { ...prev, [code]: [...list, newQuestion] };
    });
  };

  // Remove question from a part
  const handleRemoveQuestionFromPart = (code: string, part: 1 | 2 | 3, qNum: number) => {
    setDraftQuestionsByCode((prev) => {
      const list = prev[code] || [];
      const filtered = list.filter((q) => !(q.part === part && q.number === qNum));
      // Re-index questions in that part
      let reindexedNum = 1;
      const updated = filtered.map((q) => {
        if (q.part === part) {
          const res = { ...q, number: reindexedNum };
          reindexedNum++;
          return res;
        }
        return q;
      });
      return { ...prev, [code]: updated };
    });
  };

  // Save the exam (Create or Edit)
  const handleSaveExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (formCodes.length === 0) {
      alert('Vui lòng tạo ít nhất 1 mã đề thi!');
      return;
    }

    const updatedExam: Exam = {
      id: editingExamId,
      title: formTitle.trim(),
      subject: formSubject.trim(),
      grade: formGrade,
      academicYear: formAcademicYear.trim(),
      durationMinutes: formDuration,
      totalScore: formTotalScore,
      codes: formCodes,
      scoringRuleDescription: formScoringRule.trim(),
      matrix: editableMatrix,
      questionsByCode: draftQuestionsByCode,
    };

    if (editorMode === 'edit') {
      if (onUpdateExam) onUpdateExam(updatedExam);
      showNotification(`Đã lưu thay đổi cho đề thi "${updatedExam.title}"!`);
    } else {
      onCreateExam(updatedExam);
      onSelectExam(updatedExam);
      showNotification(`Đã tạo thành công đề thi mới "${updatedExam.title}"!`);
    }

    setSelectedCode(formCodes[0]);
    setShowEditorModal(false);
  };

  // Duplicate an exam
  const handleDuplicateExam = (exam: Exam, e: React.MouseEvent) => {
    e.stopPropagation();
    const duplicated: Exam = {
      ...JSON.parse(JSON.stringify(exam)),
      id: `exam-${Date.now()}`,
      title: `[Bản sao] ${exam.title}`,
      academicYear: exam.academicYear,
    };
    onCreateExam(duplicated);
    onSelectExam(duplicated);
    showNotification(`Đã nhân bản đề thi "${exam.title}"!`);
  };

  // Prompt delete exam
  const handlePromptDelete = (exam: Exam, e: React.MouseEvent) => {
    e.stopPropagation();
    if (exams.length <= 1) {
      alert('Hệ thống cần lưu lại ít nhất 1 đề thi!');
      return;
    }
    setDeleteConfirmModal({ isOpen: true, exam });
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmModal.exam && onDeleteExam) {
      onDeleteExam(deleteConfirmModal.exam.id);
      showNotification(`Đã xoá đề thi "${deleteConfirmModal.exam.title}" khỏi hệ thống.`);
    }
    setDeleteConfirmModal({ isOpen: false });
  };

  const currentQuestions = currentExam.questionsByCode[selectedCode] || Object.values(currentExam.questionsByCode)[0] || [];

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="flex items-center justify-between p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-semibold shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-emerald-600 hover:text-emerald-900 font-bold p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header & Quick Action */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              Quy chuẩn 2025 - 2026
            </span>
            <span className="text-xs text-slate-500 font-medium">Khảo thí & Ma trận kiến thức tùy chỉnh</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Quản Lý Đề Thi & Chỉnh Sửa Ma Trận Theo Yêu Cầu Thực Tế
          </h1>
          <p className="text-xs text-slate-500">
            Cho phép linh hoạt chỉnh sửa ma trận kiến thức, số lượng câu hỏi theo 4 mức độ nhận thức, thang điểm và đáp án cho từng mã đề thi.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
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

          {/* Button: Edit current exam & matrix */}
          <button
            type="button"
            onClick={() => handleOpenEditModal(currentExam, 'matrix')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 transition-colors shadow-2xs"
          >
            <Sliders className="w-4 h-4 text-amber-700" />
            <span>Chỉnh sửa Ma trận đề này</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all hover:scale-102"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo đề thi mới (Chọn mẫu Ma trận)</span>
          </button>
        </div>
      </div>

      {/* Exam List Cards */}
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
              className={`p-4 rounded-2xl border transition-all cursor-pointer relative group ${
                isSelected
                  ? 'bg-blue-50/40 border-blue-500 shadow-sm ring-2 ring-blue-500/30'
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
                <span className="font-bold text-slate-800">Thang {exam.totalScore || 10}đ</span>
              </div>

              {/* Action Buttons on Card */}
              <div className="mt-2.5 pt-2 border-t border-slate-100/80 flex items-center justify-between gap-1">
                <span className="text-[10px] font-mono text-slate-400">
                  Niên khóa: {exam.academicYear}
                </span>
                <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenEditModal(exam, 'info');
                    }}
                    className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Chỉnh sửa thông tin đề thi & ma trận"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleDuplicateExam(exam, e)}
                    className="p-1 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                    title="Nhân bản đề thi này"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  {exams.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => handlePromptDelete(exam, e)}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                      title="Xoá đề thi này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Matrix Breakdown for Current Exam */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-600" />
                Bảng Ma Trận Kiến Thức Chuẩn Bộ Giáo Dục
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Có thể chỉnh sửa
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Phân phối số câu hỏi và tỷ lệ điểm theo từng chủ đề & 4 cấp độ nhận thức (Nhận biết, Thông hiểu, Vận dụng, Vận dụng cao)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleOpenEditModal(currentExam, 'matrix')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Chỉnh sửa Ma trận kiến thức</span>
            </button>
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
                  {currentExam.matrix.reduce((a, b) => a + Number(b.recognitionCount || 0), 0)} câu
                </td>
                <td className="py-2.5 px-3 text-center font-mono text-blue-800">
                  {currentExam.matrix.reduce((a, b) => a + Number(b.comprehensionCount || 0), 0)} câu
                </td>
                <td className="py-2.5 px-3 text-center font-mono text-amber-800">
                  {currentExam.matrix.reduce((a, b) => a + Number(b.applicationCount || 0), 0)} câu
                </td>
                <td className="py-2.5 px-3 text-center font-mono text-rose-800">
                  {currentExam.matrix.reduce((a, b) => a + Number(b.advancedCount || 0), 0)} câu
                </td>
                <td className="py-2.5 px-3 text-right font-black text-blue-700">
                  {Number(currentExam.matrix.reduce((a, b) => a + Number(b.totalScore || 0), 0).toFixed(2))}đ
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Answer Key Details for selectedCode */}
        <div className="pt-4 border-t border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <ListOrdered className="w-4 h-4 text-blue-600" />
              Đáp Án Chuẩn & Phân Phối Câu Hỏi - Mã Đề {selectedCode}
            </h3>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Chọn mã đề:</span>
              <div className="flex gap-1">
                {currentExam.codes.map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setSelectedCode(code)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      selectedCode === code
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Mã {code}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => handleOpenEditModal(currentExam, 'answers')}
                className="ml-2 flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                <span>Chỉnh sửa đáp án</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {currentQuestions.map((q) => {
              let answerDisplay = '';
              if (q.part === 1) {
                answerDisplay = q.correctAnswer;
              } else if (q.part === 2) {
                const ca = q.correctAnswer as any;
                answerDisplay = `a:${ca?.a ? 'Đ' : 'S'} | b:${ca?.b ? 'Đ' : 'S'} | c:${ca?.c ? 'Đ' : 'S'} | d:${ca?.d ? 'Đ' : 'S'}`;
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

      {/* COMPREHENSIVE MODAL: Unified Exam & Knowledge Matrix Editor */}
      {showEditorModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-5 sm:p-7 space-y-5 shadow-2xl max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  {editorMode === 'create' ? 'Tạo Đề Thi Mới & Cấu Hình Ma Trận BGD' : 'Chỉnh Sửa Đề Thi & Ma Trận Kiến Thức'}
                </h3>
                <p className="text-xs text-slate-500">
                  Tùy chỉnh linh hoạt chuyên đề, số lượng câu hỏi 4 mức độ tư duy, bảng đáp án từng mã đề theo yêu cầu thực tế.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowEditorModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveModalTab('info')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeModalTab === 'info'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>1. Thông tin chung & Mẫu ma trận</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveModalTab('matrix')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeModalTab === 'matrix'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>2. Bảng Ma trận kiến thức ({editableMatrix.length} chuyên đề)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveModalTab('answers')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeModalTab === 'answers'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ListOrdered className="w-3.5 h-3.5" />
                <span>3. Mã đề & Đáp án chi tiết ({formCodes.length} mã)</span>
              </button>
            </div>

            <form onSubmit={handleSaveExam} className="space-y-5 text-xs">
              {/* TAB 1: General Info & Matrix Presets */}
              {activeModalTab === 'info' && (
                <div className="space-y-4">
                  {/* Preset Library Buttons */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-blue-600" />
                        Chọn nhanh Mẫu Ma Trận Chuẩn Bộ Giáo Dục:
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Bấm để nạp sẵn ma trận & cấu trúc câu
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {PRESET_TEMPLATES.map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => handleApplyPreset(preset)}
                          className="p-2.5 bg-white hover:bg-blue-100/60 border border-blue-200 rounded-xl text-left transition-all hover:scale-101 shadow-2xs group"
                        >
                          <div className="font-bold text-slate-900 text-[11px] group-hover:text-blue-700">
                            {preset.name}
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            {preset.durationMinutes} phút • {preset.part1Count + preset.part2Count + preset.part3Count} câu
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Form Details */}
                  <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 space-y-3">
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide flex items-center gap-1.5">
                      <Sliders className="w-4 h-4 text-blue-600" />
                      Thông tin cơ bản về đề kiểm tra
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                      <div className="sm:col-span-8">
                        <label className="font-bold text-slate-700 block mb-1">
                          Tên bài thi / Đề kiểm tra: <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formTitle}
                          onChange={(e) => setFormTitle(e.target.value)}
                          placeholder="VD: Đề thi Khảo sát Năng lực Môn Toán 2026"
                          className="w-full border border-slate-300 rounded-xl p-2.5 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-medium"
                        />
                      </div>

                      <div className="sm:col-span-4">
                        <label className="font-bold text-slate-700 block mb-1">Môn học:</label>
                        <select
                          value={formSubject}
                          onChange={(e) => setFormSubject(e.target.value)}
                          className="w-full border border-slate-300 rounded-xl p-2.5 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-medium"
                        >
                          <option value="Toán học">Toán học</option>
                          <option value="Vật lí">Vật lí</option>
                          <option value="Hóa học">Hóa học</option>
                          <option value="Sinh học">Sinh học</option>
                          <option value="Lịch sử">Lịch sử</option>
                          <option value="Địa lí">Địa lí</option>
                          <option value="Giáo dục kinh tế & pháp luật">GD Kinh tế & Pháp luật</option>
                          <option value="Tin học">Tin học</option>
                          <option value="Tiếng Anh">Tiếng Anh</option>
                          <option value="Công nghệ">Công nghệ</option>
                        </select>
                      </div>

                      <div className="sm:col-span-3">
                        <label className="font-bold text-slate-700 block mb-1">Khối lớp:</label>
                        <select
                          value={formGrade}
                          onChange={(e) => setFormGrade(Number(e.target.value))}
                          className="w-full border border-slate-300 rounded-xl p-2.5 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-medium"
                        >
                          <option value={10}>Lớp 10</option>
                          <option value={11}>Lớp 11</option>
                          <option value={12}>Lớp 12</option>
                        </select>
                      </div>

                      <div className="sm:col-span-3">
                        <label className="font-bold text-slate-700 block mb-1">Thời gian làm bài (phút):</label>
                        <input
                          type="number"
                          required
                          min={15}
                          max={180}
                          value={formDuration}
                          onChange={(e) => setFormDuration(Number(e.target.value))}
                          className="w-full border border-slate-300 rounded-xl p-2.5 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-medium"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="font-bold text-slate-700 block mb-1">Năm học:</label>
                        <input
                          type="text"
                          required
                          value={formAcademicYear}
                          onChange={(e) => setFormAcademicYear(e.target.value)}
                          placeholder="2026 - 2027"
                          className="w-full border border-slate-300 rounded-xl p-2.5 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-medium font-mono"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="font-bold text-slate-700 block mb-1">Thang điểm tổng:</label>
                        <input
                          type="number"
                          step={0.5}
                          required
                          value={formTotalScore}
                          onChange={(e) => setFormTotalScore(Number(e.target.value))}
                          className="w-full border border-slate-300 rounded-xl p-2.5 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-bold text-blue-700"
                        />
                      </div>

                      <div className="sm:col-span-12">
                        <label className="font-bold text-slate-700 block mb-1">
                          Mô tả quy chế & thang điểm các phần thi:
                        </label>
                        <textarea
                          rows={2}
                          value={formScoringRule}
                          onChange={(e) => setFormScoringRule(e.target.value)}
                          placeholder="Mô tả số câu, thang điểm Phần I, Phần II (0.1 - 0.25 - 0.5 - 1.0) và Phần III..."
                          className="w-full border border-slate-300 rounded-xl p-2.5 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-[11px] text-slate-500">
                      * Chuyển sang Tab 2 để tùy chỉnh ma trận chuyên đề hoặc Tab 3 để nhập đáp án.
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveModalTab('matrix')}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-1 shadow-xs"
                    >
                      <span>Tiếp tục sang Ma trận kiến thức</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: Editable Knowledge Matrix Table */}
              {activeModalTab === 'matrix' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-indigo-600" />
                        Chỉnh Sửa Ma Trận Kiến Thức Chi Tiết
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Thầy/Cô có thể đổi tên chuyên đề, điều chỉnh số câu theo 4 mức độ nhận thức và thang điểm tương ứng.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddMatrixRow}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-1 shadow-xs shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Thêm chuyên đề mới</span>
                    </button>
                  </div>

                  {/* Matrix Editor Table */}
                  <div className="border border-slate-300 rounded-2xl overflow-hidden bg-white shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-100 text-slate-800 border-b border-slate-300">
                          <tr>
                            <th className="py-2.5 px-3 font-bold w-12 text-center">STT</th>
                            <th className="py-2.5 px-3 font-bold">Chuyên đề / Chủ đề kiến thức</th>
                            <th className="py-2.5 px-2 font-bold text-center text-emerald-800 w-24">
                              Nhận biết (NB)
                            </th>
                            <th className="py-2.5 px-2 font-bold text-center text-blue-800 w-24">
                              Thông hiểu (TH)
                            </th>
                            <th className="py-2.5 px-2 font-bold text-center text-amber-800 w-24">
                              Vận dụng (VD)
                            </th>
                            <th className="py-2.5 px-2 font-bold text-center text-rose-800 w-24">
                              V.Dụng cao (VDC)
                            </th>
                            <th className="py-2.5 px-3 font-bold text-center w-24">
                              Điểm số (đ)
                            </th>
                            <th className="py-2.5 px-2 font-bold text-center w-12">Xoá</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {editableMatrix.map((row, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/70">
                              <td className="py-2 px-3 text-center text-slate-400 font-mono">
                                {idx + 1}
                              </td>
                              <td className="py-2 px-3">
                                <input
                                  type="text"
                                  required
                                  value={row.topic}
                                  onChange={(e) => handleMatrixCellChange(idx, 'topic', e.target.value)}
                                  className="w-full border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-900 bg-white focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                                />
                              </td>
                              <td className="py-2 px-2 text-center">
                                <input
                                  type="number"
                                  min={0}
                                  value={row.recognitionCount}
                                  onChange={(e) => handleMatrixCellChange(idx, 'recognitionCount', Math.max(0, Number(e.target.value)))}
                                  className="w-16 border border-emerald-300 rounded-lg px-2 py-1 text-center font-mono font-bold text-emerald-700 bg-emerald-50/30 focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                                />
                              </td>
                              <td className="py-2 px-2 text-center">
                                <input
                                  type="number"
                                  min={0}
                                  value={row.comprehensionCount}
                                  onChange={(e) => handleMatrixCellChange(idx, 'comprehensionCount', Math.max(0, Number(e.target.value)))}
                                  className="w-16 border border-blue-300 rounded-lg px-2 py-1 text-center font-mono font-bold text-blue-700 bg-blue-50/30 focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                                />
                              </td>
                              <td className="py-2 px-2 text-center">
                                <input
                                  type="number"
                                  min={0}
                                  value={row.applicationCount}
                                  onChange={(e) => handleMatrixCellChange(idx, 'applicationCount', Math.max(0, Number(e.target.value)))}
                                  className="w-16 border border-amber-300 rounded-lg px-2 py-1 text-center font-mono font-bold text-amber-700 bg-amber-50/30 focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                                />
                              </td>
                              <td className="py-2 px-2 text-center">
                                <input
                                  type="number"
                                  min={0}
                                  value={row.advancedCount}
                                  onChange={(e) => handleMatrixCellChange(idx, 'advancedCount', Math.max(0, Number(e.target.value)))}
                                  className="w-16 border border-rose-300 rounded-lg px-2 py-1 text-center font-mono font-bold text-rose-700 bg-rose-50/30 focus:ring-1 focus:ring-rose-500 focus:outline-hidden"
                                />
                              </td>
                              <td className="py-2 px-3 text-center">
                                <input
                                  type="number"
                                  step={0.25}
                                  min={0}
                                  value={row.totalScore}
                                  onChange={(e) => handleMatrixCellChange(idx, 'totalScore', Math.max(0, Number(e.target.value)))}
                                  className="w-16 border border-slate-300 rounded-lg px-2 py-1 text-center font-mono font-black text-slate-900 bg-white focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                                />
                              </td>
                              <td className="py-2 px-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveMatrixRow(idx)}
                                  className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                                  title="Xoá chuyên đề này"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-slate-100/90 font-bold text-slate-900 border-t-2 border-slate-300">
                          <tr>
                            <td colSpan={2} className="py-2.5 px-3">
                              Tổng cộng toàn bộ ma trận đề thi:
                            </td>
                            <td className="py-2.5 px-2 text-center font-mono text-emerald-800">
                              {matrixTotalNB} câu
                            </td>
                            <td className="py-2.5 px-2 text-center font-mono text-blue-800">
                              {matrixTotalTH} câu
                            </td>
                            <td className="py-2.5 px-2 text-center font-mono text-amber-800">
                              {matrixTotalVD} câu
                            </td>
                            <td className="py-2.5 px-2 text-center font-mono text-rose-800">
                              {matrixTotalVDC} câu
                            </td>
                            <td className="py-2.5 px-3 text-center font-mono font-black text-blue-700">
                              {matrixTotalScore}đ
                            </td>
                            <td></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>

                  {/* Matrix Validation Banner */}
                  <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-700">
                        Tổng số câu theo ma trận: <strong className="text-blue-700">{matrixTotalQuestions} câu</strong>
                      </span>
                      <span>•</span>
                      <span className="font-semibold text-slate-700">
                        Tổng điểm: <strong className={matrixTotalScore === formTotalScore ? 'text-emerald-700' : 'text-amber-700'}>{matrixTotalScore}đ / {formTotalScore}đ</strong>
                      </span>
                    </div>

                    {matrixTotalScore === formTotalScore ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
                        <Check className="w-3 h-3" />
                        Điểm số ma trận chuẩn 10.0đ
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-100/80 px-2.5 py-0.5 rounded-full">
                        <AlertTriangle className="w-3 h-3" />
                        Tổng điểm chưa khớp {formTotalScore}đ ({matrixTotalScore}đ)
                      </span>
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveModalTab('info')}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                    >
                      ← Quay lại thông tin chung
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveModalTab('answers')}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-1 shadow-xs"
                    >
                      <span>Tiếp tục sang Bảng đáp án</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: Exam Codes & Answer Keys Editor */}
              {activeModalTab === 'answers' && (
                <div className="space-y-4">
                  {/* Exam Codes Toolbar */}
                  <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide flex items-center gap-1.5">
                        <Hash className="w-4 h-4 text-emerald-600" />
                        Quản lý các Mã Đề Thi (Mục 8 trên phiếu tô)
                      </h4>
                      <span className="text-[11px] text-slate-500">
                        Thêm các mã đề chuẩn 3 chữ số (VD: 101, 102, 103, 104)
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 bg-white p-3 rounded-xl border border-slate-200">
                      <span className="font-semibold text-slate-600 text-xs">Mã đề:</span>
                      {formCodes.map((c) => (
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
                          {formCodes.length > 1 && (
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
                          placeholder="Mã mới..."
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
                          Thêm mã
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleShuffleFromPrimary}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 transition-colors"
                      >
                        <Shuffle className="w-3.5 h-3.5" />
                        <span>Đảo đáp án tự động từ Mã {formCodes[0]} sang các mã còn lại</span>
                      </button>

                      <span className="text-[11px] text-slate-500 italic">
                        * Đang chỉnh sửa đáp án của: <strong className="text-blue-700 font-mono">Mã {activeCodeTab}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Interactive Questions & Answers for activeCodeTab */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-4">
                    {/* Part 1 Answers */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between bg-slate-800 text-white px-3 py-1.5 rounded-lg">
                        <span className="font-bold text-[11px] uppercase">
                          Phần I: Trắc nghiệm 4 lựa chọn (A, B, C, D)
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-300">
                            {(draftQuestionsByCode[activeCodeTab] || []).filter((q) => q.part === 1).length} câu
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAddQuestionToPart(activeCodeTab, 1)}
                            className="px-2 py-0.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-bold flex items-center gap-0.5"
                          >
                            <Plus className="w-3 h-3" />
                            Thêm câu
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                        {(draftQuestionsByCode[activeCodeTab] || [])
                          .filter((q) => q.part === 1)
                          .map((q) => (
                            <div key={q.number} className="p-2 border border-slate-200 rounded-lg bg-slate-50/50 text-center relative group">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-bold text-slate-700 text-[11px]">
                                  Câu {q.number}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveQuestionFromPart(activeCodeTab, 1, q.number)}
                                  className="text-slate-300 hover:text-rose-600 text-[10px] font-bold"
                                  title="Xoá câu này"
                                >
                                  ✕
                                </button>
                              </div>

                              <div className="flex justify-center gap-1 mb-1">
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

                              {/* Cognitive Level Selector */}
                              <select
                                value={q.cognitiveLevel}
                                onChange={(e) => handleUpdateQuestionMeta(activeCodeTab, 1, q.number, 'cognitiveLevel', e.target.value)}
                                className="w-full text-[9px] border border-slate-200 rounded px-1 py-0.5 bg-white text-slate-600 focus:outline-hidden"
                              >
                                <option value="recognition">Nhận biết</option>
                                <option value="comprehension">Thông hiểu</option>
                                <option value="application">Vận dụng</option>
                                <option value="advanced_application">Vận dụng cao</option>
                              </select>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Part 2 Answers */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between bg-slate-800 text-white px-3 py-1.5 rounded-lg">
                        <span className="font-bold text-[11px] uppercase">
                          Phần II: Trắc nghiệm Đúng / Sai (a, b, c, d)
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-amber-300">Thang BGD: 0.1 - 0.25 - 0.5 - 1.0đ</span>
                          <button
                            type="button"
                            onClick={() => handleAddQuestionToPart(activeCodeTab, 2)}
                            className="px-2 py-0.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-bold flex items-center gap-0.5"
                          >
                            <Plus className="w-3 h-3" />
                            Thêm câu
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                        {(draftQuestionsByCode[activeCodeTab] || [])
                          .filter((q) => q.part === 2)
                          .map((q) => {
                            const ca = q.correctAnswer as any;
                            return (
                              <div key={q.number} className="p-2.5 border border-slate-200 rounded-lg bg-slate-50/50">
                                <div className="flex items-center justify-between border-b pb-1 mb-1.5">
                                  <span className="font-bold text-slate-800 text-[11px]">
                                    Câu {q.number} (Đúng / Sai)
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveQuestionFromPart(activeCodeTab, 2, q.number)}
                                    className="text-slate-300 hover:text-rose-600 text-[10px] font-bold"
                                    title="Xoá câu này"
                                  >
                                    ✕
                                  </button>
                                </div>
                                <div className="space-y-1">
                                  {(['a', 'b', 'c', 'd'] as const).map((sub) => (
                                    <div key={sub} className="flex items-center justify-between text-[11px]">
                                      <span className="font-bold text-slate-700 uppercase">{sub})</span>
                                      <div className="flex gap-1.5">
                                        <button
                                          type="button"
                                          onClick={() => handleUpdatePart2Answer(activeCodeTab, q.number, sub, true)}
                                          className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                                            ca?.[sub] === true
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
                                            ca?.[sub] === false
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

                                <div className="mt-2 pt-1 border-t border-slate-200">
                                  <select
                                    value={q.cognitiveLevel}
                                    onChange={(e) => handleUpdateQuestionMeta(activeCodeTab, 2, q.number, 'cognitiveLevel', e.target.value)}
                                    className="w-full text-[9px] border border-slate-200 rounded px-1 py-0.5 bg-white text-slate-600 focus:outline-hidden"
                                  >
                                    <option value="comprehension">Thông hiểu</option>
                                    <option value="application">Vận dụng</option>
                                    <option value="advanced_application">Vận dụng cao</option>
                                  </select>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>

                    {/* Part 3 Answers */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between bg-slate-800 text-white px-3 py-1.5 rounded-lg">
                        <span className="font-bold text-[11px] uppercase">
                          Phần III: Trắc nghiệm Trả lời ngắn (Giá trị số chuẩn)
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-300">
                            {(draftQuestionsByCode[activeCodeTab] || []).filter((q) => q.part === 3).length} câu
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAddQuestionToPart(activeCodeTab, 3)}
                            className="px-2 py-0.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-bold flex items-center gap-0.5"
                          >
                            <Plus className="w-3 h-3" />
                            Thêm câu
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                        {(draftQuestionsByCode[activeCodeTab] || [])
                          .filter((q) => q.part === 3)
                          .map((q) => (
                            <div key={q.number} className="p-2 border border-slate-200 rounded-lg bg-slate-50/50 text-center">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-bold text-slate-800 text-[11px]">
                                  Câu {q.number}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveQuestionFromPart(activeCodeTab, 3, q.number)}
                                  className="text-slate-300 hover:text-rose-600 text-[10px] font-bold"
                                  title="Xoá câu này"
                                >
                                  ✕
                                </button>
                              </div>

                              <input
                                type="text"
                                value={String(q.correctAnswer || '')}
                                onChange={(e) => handleUpdatePart3Answer(activeCodeTab, q.number, e.target.value)}
                                placeholder="VD: 12.5"
                                className="w-full text-center font-mono font-bold text-xs border border-slate-300 rounded p-1 bg-white focus:ring-1 focus:ring-blue-500 focus:outline-hidden mb-1"
                              />

                              <select
                                value={q.cognitiveLevel}
                                onChange={(e) => handleUpdateQuestionMeta(activeCodeTab, 3, q.number, 'cognitiveLevel', e.target.value)}
                                className="w-full text-[9px] border border-slate-200 rounded px-1 py-0.5 bg-white text-slate-600 focus:outline-hidden"
                              >
                                <option value="application">Vận dụng</option>
                                <option value="advanced_application">Vận dụng cao</option>
                              </select>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex justify-between items-center pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowEditorModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20"
                >
                  <Check className="w-4 h-4" />
                  <span>
                    {editorMode === 'edit'
                      ? 'Lưu Thay Đổi Đề Thi & Ma Trận'
                      : `Hoàn Tất & Tạo Đề Thi Mới (${formCodes.length} mã đề)`}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Official 2025 Sample Sheet */}
      {showPdfViewerModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-5 sm:p-6 max-h-[92vh] overflow-y-auto space-y-4 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Phiếu Trả Lời Trắc Nghiệm Mẫu Chuẩn - Bộ GD&ĐT
                </h3>
                <p className="text-xs text-slate-500">
                  Mẫu phiếu chính thức có đầy đủ Mục 7 (SBD 6 số), Mục 8 (Mã đề 3 số), Phần I (40 câu), Phần II (Đúng/Sai), Phần III (Trả lời ngắn 4 cột)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPdfViewerModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 font-bold transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="border border-slate-300 rounded-xl overflow-y-auto bg-slate-100 flex items-center justify-center p-3 max-h-[66vh] shadow-inner">
              <img
                src="/assets/aistudio/phieu_bgd_2025_preview.png"
                alt="Phiếu Trả Lời Trắc Nghiệm Mẫu - Bộ GD&ĐT"
                className="max-h-[62vh] w-auto rounded-lg shadow-lg border border-slate-300 object-contain bg-white mx-auto hover:scale-101 transition-transform"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100">
              <span className="text-[11px] text-slate-500 font-medium">
                * Có thể tải file PDF khổ chuẩn A4 để in ấn cho học sinh làm bài thi.
              </span>
              <div className="flex items-center gap-2">
                <a
                  href="/assets/aistudio/Phi_u_TNTL_2025_TNMaker_f1ed3d93.pdf"
                  download="Phieu_Tra_Loi_Trac_Nghiem_2025_BGD.pdf"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all hover:scale-102"
                >
                  <FileDown className="w-4 h-4" />
                  <span>Tải tệp PDF in A4</span>
                </a>

                <button
                  type="button"
                  onClick={() => setShowPdfViewerModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Exam Confirmation Modal */}
      {deleteConfirmModal.isOpen && deleteConfirmModal.exam && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 space-y-4 shadow-2xl border border-rose-100">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-slate-900">
                  Xác nhận xoá đề thi
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Bạn có chắc chắn muốn xoá đề thi <strong>"{deleteConfirmModal.exam.title}"</strong>?
                </p>
              </div>
            </div>

            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
              <p className="font-semibold">⚠️ Lưu ý:</p>
              <p className="mt-0.5 text-[11px]">
                Toàn bộ ma trận kiến thức, mã đề ({deleteConfirmModal.exam.codes.join(', ')}) và đáp án tương ứng sẽ bị loại bỏ khỏi danh sách đề thi.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmModal({ isOpen: false })}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-rose-600/20"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xác nhận xoá đề thi</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
