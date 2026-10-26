import React, { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  FileText, 
  Eye, 
  Save, 
  UserCheck, 
  Info,
  Maximize2,
  Check,
  X,
  FileDown,
  Smartphone,
  Zap,
  RotateCw,
  SlidersHorizontal,
  Users,
  Calendar,
  GraduationCap,
  ArrowRight,
  UserPlus,
  ListPlus,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { Exam, Student, ExamSubmission } from '../types/exam';
import { gradeExamSubmission, getGradeRank } from '../utils/scoring';
import { OfficialSheetVisualizer } from './OfficialSheetVisualizer';

interface ScannerViewProps {
  currentExam: Exam;
  students: Student[];
  onSaveSubmission: (submission: ExamSubmission) => void;
  onViewStudentReport: (submission: ExamSubmission) => void;
  onNavigateToStudents?: () => void;
  onAddStudent?: (student: Student) => void;
  onBatchAddStudents?: (students: Student[]) => void;
}

export const ScannerView: React.FC<ScannerViewProps> = ({
  currentExam,
  students,
  onSaveSubmission,
  onViewStudentReport,
  onNavigateToStudents,
  onAddStudent,
  onBatchAddStudents,
}) => {
  const [selectedExamCode, setSelectedExamCode] = useState<string>(currentExam.codes[0] || '101');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanStep, setScanStep] = useState<string>('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [fileMimeType, setFileMimeType] = useState<string>('image/jpeg');

  // Year & Class Context for matching SBD to correct student list
  const [targetYear, setTargetYear] = useState<string>(currentExam.academicYear || '2024 - 2025');
  const [targetClass, setTargetClass] = useState<string>(students[0]?.className || '12A1');
  
  // Quick Add Student Modal before / during grading
  const [showQuickAddModal, setShowQuickAddModal] = useState<boolean>(false);
  const [quickAddMode, setQuickAddMode] = useState<'single' | 'batch'>('single');
  const [quickSbd, setQuickSbd] = useState<string>('');
  const [quickName, setQuickName] = useState<string>('');
  const [quickGender, setQuickGender] = useState<'Nam' | 'Nữ'>('Nam');
  const [quickDob, setQuickDob] = useState<string>('15/05/2007');
  const [quickBatchText, setQuickBatchText] = useState<string>(
`010229	Trần Thị Thảo	12A1	2024 - 2025	Nữ	19/08/2007
010230	Phạm Gia Huy	12A1	2024 - 2025	Nam	04/11/2007`
  );
  
  // Camera state
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isTorchOn, setIsTorchOn] = useState<boolean>(false);
  const [hasTorchSupport, setHasTorchSupport] = useState<boolean>(false);
  const [showSampleModal, setShowSampleModal] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Scanned / Detected data
  const [detectedSbd, setDetectedSbd] = useState<string>('010201');
  const [detectedCode, setDetectedCode] = useState<string>(selectedExamCode);
  const [studentName, setStudentName] = useState<string>('Nguyễn Văn An');
  const [detectedPart1, setDetectedPart1] = useState<Record<number, 'A' | 'B' | 'C' | 'D' | null>>({});
  const [detectedPart2, setDetectedPart2] = useState<Record<number, { a?: boolean | null; b?: boolean | null; c?: boolean | null; d?: boolean | null }>>({});
  const [detectedPart3, setDetectedPart3] = useState<Record<number, string | null>>({});
  const [scanNotes, setScanNotes] = useState<string[]>([]);
  const [confidence, setConfidence] = useState<number>(98.5);
  const [activeReviewTab, setActiveReviewTab] = useState<'part1' | 'part2' | 'part3' | 'overview'>('overview');
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [lastSavedSubmission, setLastSavedSubmission] = useState<ExamSubmission | null>(null);

  // Available unique classes and years
  const availableClasses = React.useMemo(() => {
    const set = new Set(students.map((s) => s.className).filter(Boolean));
    if (!set.has('12A1')) set.add('12A1');
    if (!set.has('12A2')) set.add('12A2');
    return Array.from(set);
  }, [students]);

  const availableYears = React.useMemo(() => {
    const set = new Set(students.map((s) => s.academicYear).filter(Boolean));
    if (currentExam.academicYear) set.add(currentExam.academicYear);
    if (!set.has('2024 - 2025')) set.add('2024 - 2025');
    if (!set.has('2025 - 2026')) set.add('2025 - 2026');
    return Array.from(set);
  }, [students, currentExam.academicYear]);

  // Three-way matching of student: SBD + Class + Academic Year
  const matchedStudent = React.useMemo(() => {
    // 1. Strict match: SBD + targetClass + targetYear
    const exact = students.find(
      (s) =>
        s.sbd === detectedSbd &&
        (targetClass === 'all' || s.className === targetClass) &&
        (targetYear === 'all' || s.academicYear === targetYear)
    );
    if (exact) return exact;

    // 2. Fallback: match by SBD across any class in the same year
    const inYear = students.find(
      (s) => s.sbd === detectedSbd && (targetYear === 'all' || s.academicYear === targetYear)
    );
    if (inYear) return inYear;

    // 3. Fallback: match by SBD in entire roster
    return students.find((s) => s.sbd === detectedSbd);
  }, [students, detectedSbd, targetClass, targetYear]);

  // Active question set for the selected exam code
  const currentQuestions = currentExam.questionsByCode[detectedCode] || currentExam.questionsByCode[selectedExamCode] || Object.values(currentExam.questionsByCode)[0] || [];

  // Match student name whenever SBD or matchedStudent changes
  useEffect(() => {
    if (matchedStudent) {
      setStudentName(matchedStudent.name);
    }
  }, [matchedStudent]);

  // Live calculation of scores based on current state & manual edits
  const currentGrading = React.useMemo(() => {
    return gradeExamSubmission(currentQuestions, {
      part1: detectedPart1,
      part2: detectedPart2,
      part3: detectedPart3,
    });
  }, [currentQuestions, detectedPart1, detectedPart2, detectedPart3]);

  // Helper to process scanning
  const processImageScan = async (base64Data: string, mime: string) => {
    setIsScanning(true);
    setSaveSuccess(false);

    try {
      setScanStep('Đang chuẩn hóa ảnh & định vị 4 góc OMR...');
      await new Promise((r) => setTimeout(r, 600));

      setScanStep('Đang đọc Số báo danh (Mục 7) & Mã đề thi (Mục 8)...');
      await new Promise((r) => setTimeout(r, 700));

      setScanStep('AI Vision đang phân tích các ô tô Phần I, II, III chuẩn BGD 2025...');

      const response = await fetch('/api/scan-answer-sheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Data,
          mimeType: mime,
          examCodeExpected: selectedExamCode,
        }),
      });

      const result = await response.json();
      if (!result.success && !result.data) {
        throw new Error(result.error || 'Không thể quét phiếu.');
      }

      const data = result.data;

      // Extract detected values
      const sbd = String(data.studentId || '010201').padStart(6, '0');
      const code = String(data.examCode || selectedExamCode).padStart(3, '0');

      setDetectedSbd(sbd);
      setDetectedCode(code);
      if (data.studentName) {
        setStudentName(data.studentName);
      } else {
        const student = students.find((s) => s.sbd === sbd);
        if (student) setStudentName(student.name);
      }

      // Format Part 1
      const p1: Record<number, any> = {};
      Object.entries(data.part1 || {}).forEach(([k, v]) => {
        p1[parseInt(k, 10)] = v;
      });
      setDetectedPart1(p1);

      // Format Part 2
      const p2: Record<number, any> = {};
      Object.entries(data.part2 || {}).forEach(([k, v]) => {
        p2[parseInt(k, 10)] = v;
      });
      setDetectedPart2(p2);

      // Format Part 3
      const p3: Record<number, any> = {};
      Object.entries(data.part3 || {}).forEach(([k, v]) => {
        p3[parseInt(k, 10)] = v;
      });
      setDetectedPart3(p3);

      setConfidence(data.confidenceScore || 98.5);
      setScanNotes(data.scanNotes || ['Nhận diện thành công các phần thi theo phiếu chuẩn 2025.']);

      setScanStep('Hoàn tất chấm điểm tự động!');
    } catch (err: any) {
      console.error(err);
      alert('Có lỗi khi quét ảnh: ' + (err?.message || 'Vui lòng thử lại'));
    } finally {
      setIsScanning(false);
    }
  };

  // Handle File Upload or Camera Capture from input
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const mime = file.type || 'image/jpeg';
    setFileMimeType(mime);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      setPreviewImage(base64);
      processImageScan(base64, mime);
    };
    reader.readAsDataURL(file);
  };

  // 1-Click Demo Scan with ready-to-test official sheet
  const handleDemoScan = () => {
    const randomIndex = Math.floor(Math.random() * Math.min(students.length, 10));
    const sampleStudent = students[randomIndex] || students[0];
    const sampleCode = currentExam.codes[Math.floor(Math.random() * currentExam.codes.length)] || '101';

    setPreviewImage('/assets/aistudio/phieu_bgd_2025_preview.png');
    setFileMimeType('image/png');

    setIsScanning(true);
    setSaveSuccess(false);
    setScanStep('Đang nạp dữ liệu phiếu mẫu BGD 2025...');

    setTimeout(() => {
      setScanStep('Đang nhận diện SBD ' + sampleStudent.sbd + ' & Mã đề ' + sampleCode + '...');
      setTimeout(() => {
        setDetectedSbd(sampleStudent.sbd);
        setDetectedCode(sampleCode);
        setStudentName(sampleStudent.name);

        const qList = currentExam.questionsByCode[sampleCode] || currentExam.questionsByCode['101'] || [];
        const p1: Record<number, any> = {};
        const p2: Record<number, any> = {};
        const p3: Record<number, any> = {};

        qList.forEach((q) => {
          if (q.part === 1) {
            p1[q.number] = Math.random() < 0.85 ? q.correctAnswer : 'C';
          } else if (q.part === 2) {
            const ca = q.correctAnswer;
            p2[q.number] = {
              a: Math.random() < 0.9 ? ca.a : !ca.a,
              b: Math.random() < 0.9 ? ca.b : !ca.b,
              c: Math.random() < 0.85 ? ca.c : !ca.c,
              d: Math.random() < 0.85 ? ca.d : !ca.d,
            };
          } else if (q.part === 3) {
            p3[q.number] = Math.random() < 0.8 ? q.correctAnswer : '10';
          }
        });

        setDetectedPart1(p1);
        setDetectedPart2(p2);
        setDetectedPart3(p3);
        setConfidence(99.4);
        setScanNotes([
          'Định vị 4 góc chuẩn xác (Sai lệch < 0.5%).',
          `Khớp thành công SBD ${sampleStudent.sbd} với học sinh ${sampleStudent.name} (${sampleStudent.className}).`,
          'Mã đề nhận diện: ' + sampleCode + '.',
          'Các ô Phần I, Phần II, Phần III tô rõ nét bằng bút chì 2B.',
        ]);

        setIsScanning(false);
      }, 800);
    }, 700);
  };

  // Start Camera with specified mode
  const startCamera = async (mode: 'environment' | 'user' = facingMode) => {
    try {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }

      setIsCameraActive(true);
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Check torch capability
      const track = stream.getVideoTracks()[0];
      const capabilities = (track.getCapabilities && track.getCapabilities()) as any;
      if (capabilities && capabilities.torch) {
        setHasTorchSupport(true);
      } else {
        setHasTorchSupport(false);
      }
    } catch (err: any) {
      alert('Không thể mở camera: ' + (err.message || 'Vui lòng cấp quyền truy cập camera trên thiết bị'));
      setIsCameraActive(false);
    }
  };

  // Switch facing mode (Rear <-> Front)
  const toggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Toggle Torch/Flash on mobile
  const toggleTorch = async () => {
    if (!mediaStreamRef.current) return;
    const track = mediaStreamRef.current.getVideoTracks()[0];
    try {
      await (track as any).applyConstraints({
        advanced: [{ torch: !isTorchOn }],
      });
      setIsTorchOn(!isTorchOn);
    } catch (e) {
      console.warn('Torch toggle not supported', e);
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
    setIsTorchOn(false);
  };

  // Capture Frame from Camera
  const captureFrame = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 1280;
    canvas.height = videoRef.current.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    setPreviewImage(dataUrl);
    setFileMimeType('image/jpeg');
    stopCamera();
    processImageScan(dataUrl, 'image/jpeg');
  };

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // Quick Add Single Student from Keyboard
  const handleQuickAddSingleStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickName.trim() || !quickSbd.trim()) {
      alert('Vui lòng nhập đầy đủ Số báo danh và Họ tên!');
      return;
    }
    const cleanSbd = quickSbd.padStart(6, '0').slice(-6);
    const newStudent: Student = {
      id: `hs-${cleanSbd}-${Date.now()}`,
      sbd: cleanSbd,
      name: quickName.trim(),
      className: targetClass !== 'all' ? targetClass : '12A1',
      academicYear: targetYear !== 'all' ? targetYear : (currentExam.academicYear || '2024 - 2025'),
      gender: quickGender,
      dob: quickDob,
    };

    if (onAddStudent) {
      onAddStudent(newStudent);
    }
    setDetectedSbd(cleanSbd);
    setStudentName(newStudent.name);
    setQuickSbd('');
    setQuickName('');
    setShowQuickAddModal(false);
  };

  // Quick Add Batch from Excel / Keyboard
  const handleQuickAddBatchStudents = () => {
    const lines = quickBatchText.split('\n').map((l) => l.trim()).filter(Boolean);
    const parsed: Student[] = [];

    lines.forEach((line, idx) => {
      const parts = line.includes('\t')
        ? line.split('\t').map((p) => p.trim())
        : line.split('|').map((p) => p.trim());

      if (parts.length >= 2) {
        const rawSbd = parts[0].replace(/\D/g, '') || String(idx + 1);
        const sbd = rawSbd.padStart(6, '0').slice(-6);
        const name = parts[1];
        const className = parts[2] || (targetClass !== 'all' ? targetClass : '12A1');
        const academicYear = parts[3] || (targetYear !== 'all' ? targetYear : (currentExam.academicYear || '2024 - 2025'));
        const gender = parts[4] === 'Nữ' || parts[4] === 'Nu' || parts[4] === 'F' ? 'Nữ' : 'Nam';
        const dob = parts[5] || '15/05/2007';

        parsed.push({
          id: `hs-${sbd}-${Date.now()}-${idx}`,
          sbd,
          name,
          className,
          academicYear,
          gender,
          dob,
        });
      }
    });

    if (parsed.length === 0) {
      alert('Không phân tích được học sinh nào. Định dạng mỗi dòng: SBD [TAB] Họ Tên [TAB] Lớp [TAB] Năm học');
      return;
    }

    if (onBatchAddStudents) {
      onBatchAddStudents(parsed);
    }
    setShowQuickAddModal(false);
  };

  // Save to Student Gradebook (Linked by SBD + Class + Academic Year)
  const handleSaveToGradebook = () => {
    const finalClass = matchedStudent?.className || (targetClass !== 'all' ? targetClass : '12A1');
    const finalYear = matchedStudent?.academicYear || (targetYear !== 'all' ? targetYear : currentExam.academicYear || '2024 - 2025');
    const finalName = studentName.trim() || matchedStudent?.name || `Thí sinh ${detectedSbd}`;

    // Auto-register student into roster if not already present
    const exists = students.some(
      (s) => s.sbd === detectedSbd && s.className === finalClass && s.academicYear === finalYear
    );
    if (!exists && onAddStudent) {
      onAddStudent({
        id: `hs-${detectedSbd}-${Date.now()}`,
        sbd: detectedSbd,
        name: finalName,
        className: finalClass,
        academicYear: finalYear,
        gender: 'Nam',
        dob: '01/01/2007',
      });
    }

    const newSubmission: ExamSubmission = {
      id: `sub-${detectedSbd}-${Date.now()}`,
      examId: currentExam.id,
      examTitle: currentExam.title,
      sbd: detectedSbd,
      examCode: detectedCode,
      studentName: finalName,
      className: finalClass,
      academicYear: finalYear,
      scannedAt: new Date().toLocaleString('vi-VN'),
      imagePreviewUrl: previewImage || '/assets/aistudio/phieu_bgd_2025_preview.png',
      rawAnswers: {
        part1: detectedPart1,
        part2: detectedPart2,
        part3: detectedPart3,
      },
      scores: currentGrading.scores,
      questionResults: currentGrading.questionResults,
      topicCompetencies: currentGrading.topicCompetencies,
      levelCompetencies: currentGrading.levelCompetencies,
      scanNotes: [
        ...scanNotes,
        `✓ Đã nhập kết quả kiểm tra vào học sinh: ${finalName} | SBD: ${detectedSbd} | Lớp: ${finalClass} | Năm học: ${finalYear}.`,
      ],
    };

    onSaveSubmission(newSubmission);
    setLastSavedSubmission(newSubmission);
    setSaveSuccess(true);

    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (e) {
      // ignore
    }
  };

  // Target answer keys for visualizer
  const correctKeys = React.useMemo(() => {
    const p1: Record<number, 'A' | 'B' | 'C' | 'D'> = {};
    const p2: Record<number, { a: boolean; b: boolean; c: boolean; d: boolean }> = {};
    const p3: Record<number, string> = {};

    currentQuestions.forEach((q) => {
      if (q.part === 1) p1[q.number] = q.correctAnswer;
      else if (q.part === 2) p2[q.number] = q.correctAnswer;
      else if (q.part === 3) p3[q.number] = q.correctAnswer;
    });

    return { part1: p1, part2: p2, part3: p3 };
  }, [currentQuestions]);

  const gradeRank = getGradeRank(currentGrading.scores.totalScore);

  return (
    <div className="space-y-6">
      {/* Top Controls: Exam Selector, Mode Selection & Mobile Camera Trigger */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                <Camera className="w-3.5 h-3.5" />
                Quét Camera Điện Thoại & AI Vision 2025
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Đang chấm cho đề: <span className="font-bold text-slate-900">{currentExam.title}</span>
              </span>
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Quét Ảnh & Chấm Điểm Tự Động
            </h1>
            <p className="text-xs text-slate-500">
              Nhận diện số báo danh, mã đề thi ({currentExam.codes.join(', ')}) và tự động tính điểm theo ma trận chuẩn Bộ Giáo dục 2025.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Quick Demo Scan */}
            <button
              type="button"
              onClick={handleDemoScan}
              disabled={isScanning}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20 transition-all hover:scale-102"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Chấm thử phiếu mẫu 2025</span>
            </button>

            {/* BUTTON 1: Open Phone Native Camera (High resolution 12-48MP capture) */}
            <label className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20 cursor-pointer transition-all hover:scale-102">
              <Smartphone className="w-4 h-4" />
              <span>Chụp bằng Camera điện thoại</span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>

            {/* BUTTON 2: Live Viewfinder Camera Stream */}
            {!isCameraActive ? (
              <button
                type="button"
                onClick={() => startCamera('environment')}
                disabled={isScanning}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition-colors"
              >
                <Camera className="w-4 h-4 text-slate-700" />
                <span>Bật Camera trực tiếp</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={stopCamera}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300 transition-colors"
              >
                <span>Tắt Camera</span>
              </button>
            )}

            {/* BUTTON 3: Upload from Gallery/Computer */}
            <label className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 shadow-2xs cursor-pointer transition-colors">
              <Upload className="w-4 h-4 text-slate-700" />
              <span>Tải file ảnh / PDF</span>
              <input
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
          </div>
        </div>

        {/* Academic Year, Class, and Student Roster Context Bar */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/70 p-3.5 rounded-xl border">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            {/* Academic Year Selector */}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                  Năm học
                </span>
                <select
                  value={targetYear}
                  onChange={(e) => setTargetYear(e.target.value)}
                  className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tất cả các năm học</option>
                  {availableYears.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

            {/* Class Selector */}
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-blue-600 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                  Lớp học
                </span>
                <select
                  value={targetClass}
                  onChange={(e) => setTargetClass(e.target.value)}
                  className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tất cả các lớp</option>
                  {availableClasses.map((c) => (
                    <option key={c} value={c}>
                      Lớp {c} ({students.filter((s) => s.className === c && (targetYear === 'all' || s.academicYear === targetYear)).length} HS)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

            {/* Expected Exam Code */}
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                  Mã đề dự kiến
                </span>
                <select
                  value={selectedExamCode}
                  onChange={(e) => {
                    setSelectedExamCode(e.target.value);
                    setDetectedCode(e.target.value);
                  }}
                  className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-mono font-bold text-emerald-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  {currentExam.codes.map((c) => (
                    <option key={c} value={c}>
                      Mã đề {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Quick Roster Action */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowQuickAddModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-all cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Thêm học sinh từ bàn phím</span>
            </button>

            {onNavigateToStudents && (
              <button
                type="button"
                onClick={onNavigateToStudents}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 shadow-2xs transition-colors cursor-pointer"
              >
                <Users className="w-3.5 h-3.5 text-slate-500" />
                <span>Sổ điểm lớp ({students.filter((s) => targetClass === 'all' || s.className === targetClass).length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Camera Viewport if Active */}
        {isCameraActive && (
          <div className="mt-4 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center relative overflow-hidden shadow-2xl">
            {/* Top Camera Controls Bar */}
            <div className="flex items-center justify-between mb-3 text-white px-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
                <span className="text-xs font-bold font-mono">
                  Đang mở: {facingMode === 'environment' ? 'Camera Sau (Mặt lưng)' : 'Camera Trước'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {hasTorchSupport && (
                  <button
                    type="button"
                    onClick={toggleTorch}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 border transition-colors ${
                      isTorchOn ? 'bg-amber-500 text-black border-amber-400' : 'bg-slate-800 text-white border-slate-700'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>{isTorchOn ? 'Tắt Đèn' : 'Bật Đèn Flash'}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={toggleFacingMode}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 flex items-center gap-1"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Đổi Camera</span>
                </button>
              </div>
            </div>

            {/* Video Canvas Container */}
            <div className="relative inline-block max-w-full rounded-xl overflow-hidden bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="rounded-xl shadow-lg max-h-[60vh] mx-auto object-contain"
              />

              {/* OMR Alignment Target Overlay with 4 Corner Markers */}
              <div className="absolute inset-4 sm:inset-8 border-2 border-dashed border-rose-500/80 rounded-xl pointer-events-none flex flex-col justify-between p-2">
                <div className="flex justify-between">
                  <div className="w-5 h-5 border-t-4 border-l-4 border-rose-400"></div>
                  <div className="w-5 h-5 border-t-4 border-r-4 border-rose-400"></div>
                </div>

                <div className="text-center">
                  <span className="text-[11px] font-bold text-white bg-black/75 px-3 py-1.5 rounded-full shadow-lg border border-white/20">
                    Căn chỉnh 4 góc đen của phiếu vào khung viền
                  </span>
                </div>

                <div className="flex justify-between">
                  <div className="w-5 h-5 border-b-4 border-l-4 border-rose-400"></div>
                  <div className="w-5 h-5 border-b-4 border-r-4 border-rose-400"></div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-4 flex justify-center items-center gap-3">
              <button
                type="button"
                onClick={captureFrame}
                className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-sm flex items-center gap-2 shadow-xl shadow-rose-900/50 hover:scale-102 transition-all"
              >
                <Camera className="w-5 h-5" />
                <span>Chụp & Chấm Điểm Ngay</span>
              </button>

              <button
                type="button"
                onClick={stopCamera}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Progress / Scanning Status */}
      {isScanning && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center shadow-xs">
          <div className="w-12 h-12 rounded-full border-4 border-blue-600 border-t-transparent animate-spin mx-auto mb-3"></div>
          <h3 className="text-sm font-bold text-blue-900">
            Hệ thống AI đang quét & phân tích phiếu trả lời trắc nghiệm...
          </h3>
          <p className="text-xs text-blue-700 mt-1 font-mono">{scanStep}</p>
        </div>
      )}

      {/* Split-View: Sheet Visualizer (Left) vs Real-Time Results & Manual Override (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Visual Sheet */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Phiếu làm bài trực quan (Đối chiếu kết quả)
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500 font-medium">
                  Độ tin cậy: <span className="font-bold text-emerald-600">{confidence}%</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowSampleModal(true)}
                  className="text-[11px] text-blue-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Xem phiếu mẫu BGD</span>
                </button>
              </div>
            </div>

            {/* Official Sheet Visualizer with Highlighting & Full Part 3 Bubble Grid */}
            <OfficialSheetVisualizer
              sbd={detectedSbd}
              examCode={detectedCode}
              studentName={studentName}
              examTitle={currentExam.title}
              part1Answers={detectedPart1}
              part2Answers={detectedPart2}
              part3Answers={detectedPart3}
              correctAnswers={correctKeys}
              interactive={true}
              onPart1Change={(qNum, choice) => {
                setDetectedPart1((prev) => ({ ...prev, [qNum]: choice }));
              }}
              onPart2Change={(qNum, subItem, val) => {
                setDetectedPart2((prev) => ({
                  ...prev,
                  [qNum]: { ...(prev[qNum] || {}), [subItem]: val },
                }));
              }}
              onPart3Change={(qNum, val) => {
                setDetectedPart3((prev) => ({ ...prev, [qNum]: val }));
              }}
              maxPart1Questions={currentQuestions.filter((q) => q.part === 1).length || 12}
              maxPart2Questions={currentQuestions.filter((q) => q.part === 2).length || 4}
              maxPart3Questions={currentQuestions.filter((q) => q.part === 3).length || 6}
            />
          </div>
        </div>

        {/* Right Column: Scorecard, Match Info & Question Review */}
        <div className="lg:col-span-5 space-y-4">
          {/* Main Score Box */}
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-5 text-white shadow-md border border-slate-800">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-slate-400 font-medium">Kết quả chấm điểm tự động</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-4xl font-black text-white tracking-tight">
                    {currentGrading.scores.totalScore}
                  </span>
                  <span className="text-sm text-slate-400 font-bold">/ 10.0</span>
                </div>
              </div>

              <div className="text-right">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-black border ${gradeRank.badgeClass}`}>
                  {gradeRank.rank}
                </span>
                <p className="text-[10px] text-slate-400 mt-1">Thang điểm 10</p>
              </div>
            </div>

            {/* Score Breakdown (Part 1, 2, 3) */}
            <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-800/80 text-center">
              <div className="bg-slate-800/60 p-2 rounded-xl border border-slate-700/60">
                <p className="text-[10px] text-slate-400">Phần I (Trắc nghiệm)</p>
                <p className="text-sm font-bold text-white mt-0.5">
                  {currentGrading.scores.part1Score} <span className="text-[10px] text-slate-400">/ 3.0đ</span>
                </p>
              </div>

              <div className="bg-slate-800/60 p-2 rounded-xl border border-slate-700/60">
                <p className="text-[10px] text-slate-400">Phần II (Đúng/Sai)</p>
                <p className="text-sm font-bold text-amber-300 mt-0.5">
                  {currentGrading.scores.part2Score} <span className="text-[10px] text-slate-400">/ 4.0đ</span>
                </p>
              </div>

              <div className="bg-slate-800/60 p-2 rounded-xl border border-slate-700/60">
                <p className="text-[10px] text-slate-400">Phần III (Trả lời ngắn)</p>
                <p className="text-sm font-bold text-emerald-300 mt-0.5">
                  {currentGrading.scores.part3Score} <span className="text-[10px] text-slate-400">/ 3.0đ</span>
                </p>
              </div>
            </div>

            {/* Student & Code Match Card (SBD + Lớp + Năm học) */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2.5">
              {matchedStudent ? (
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Đã khớp trong danh sách học sinh:
                    </span>
                    <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      Lớp {matchedStudent.className}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Họ và tên:</span>
                    <span className="font-bold text-white text-sm">{studentName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Số báo danh (Mục 7):</span>
                    <span className="font-mono font-bold text-amber-300 tracking-wider text-sm">{detectedSbd}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Năm học:</span>
                    <span className="font-medium text-slate-200">{matchedStudent.academicYear}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Mã đề nhận diện (Mục 8):</span>
                    <span className="font-mono font-bold text-blue-300">{detectedCode}</span>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-xs space-y-2">
                  <div className="flex items-start gap-1.5 text-[11px] font-bold text-amber-300">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
                    <span>SBD {detectedSbd} chưa có trong Lớp {targetClass} ({targetYear})</span>
                  </div>
                  <p className="text-[10px] text-slate-300 leading-relaxed">
                    Hệ thống sẽ tự động thêm học sinh này vào danh sách khi lưu điểm:
                  </p>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Họ và tên học sinh:</label>
                    <input
                      type="text"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="Nhập tên học sinh..."
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-semibold focus:outline-hidden focus:border-amber-400"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Lớp:</span>
                      <select
                        value={targetClass}
                        onChange={(e) => setTargetClass(e.target.value)}
                        className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-700 text-slate-200 text-xs"
                      >
                        {availableClasses.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Năm học:</span>
                      <select
                        value={targetYear}
                        onChange={(e) => setTargetYear(e.target.value)}
                        className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-700 text-slate-200 text-xs"
                      >
                        {availableYears.map((y) => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Save Button */}
            <div className="mt-4">
              <button
                type="button"
                onClick={handleSaveToGradebook}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-900/30 transition-all hover:scale-101 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Lưu vào Sổ Điểm Học Sinh</span>
              </button>
            </div>

            {saveSuccess && (
              <div className="mt-3 p-3 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs space-y-2">
                <div className="flex items-center gap-1.5 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Đã ghi nhận kết quả vào học sinh {studentName}!</span>
                </div>
                <div className="flex items-center gap-2 pt-1 border-t border-emerald-500/20">
                  {lastSavedSubmission && (
                    <button
                      type="button"
                      onClick={() => onViewStudentReport(lastSavedSubmission)}
                      className="flex-1 py-1 px-2 rounded-lg bg-emerald-600/80 hover:bg-emerald-600 text-white text-[11px] font-bold text-center"
                    >
                      Xem báo cáo chi tiết
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setSaveSuccess(false);
                      setPreviewImage(null);
                    }}
                    className="py-1 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold"
                  >
                    Chấm bài tiếp theo
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Edit / Audit Details */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase">
                Chi tiết câu hỏi & Điểm thành phần
              </h3>
              <div className="flex gap-1">
                {(['overview', 'part1', 'part2', 'part3'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveReviewTab(tab)}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      activeReviewTab === tab
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tab === 'overview' ? 'Tổng quát' : tab === 'part1' ? 'P.I' : tab === 'part2' ? 'P.II' : 'P.III'}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab content */}
            <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1 text-xs">
              {currentGrading.questionResults
                .filter((qr) => {
                  if (activeReviewTab === 'overview') return true;
                  if (activeReviewTab === 'part1') return qr.part === 1;
                  if (activeReviewTab === 'part2') return qr.part === 2;
                  if (activeReviewTab === 'part3') return qr.part === 3;
                  return true;
                })
                .map((qr) => {
                  const isCorrect = qr.isCorrect === true;
                  const isPartial = qr.isCorrect === 'partial';

                  return (
                    <div
                      key={`${qr.part}-${qr.questionNumber}`}
                      className={`p-2 rounded-lg border flex items-center justify-between gap-2 ${
                        isCorrect
                          ? 'bg-emerald-50/50 border-emerald-200'
                          : isPartial
                          ? 'bg-amber-50/50 border-amber-200'
                          : 'bg-rose-50/50 border-rose-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                            isCorrect
                              ? 'bg-emerald-600 text-white'
                              : isPartial
                              ? 'bg-amber-500 text-white'
                              : 'bg-rose-600 text-white'
                          }`}
                        >
                          {isCorrect ? <Check className="w-3 h-3" /> : isPartial ? '½' : <X className="w-3 h-3" />}
                        </span>
                        <div>
                          <p className="font-bold text-slate-800">
                            Phần {qr.part} - Câu {qr.questionNumber}
                          </p>
                          <p className="text-[10px] text-slate-500 line-clamp-1">
                            {qr.topic}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-slate-900 text-xs">
                          {qr.scoreEarned} / {qr.maxScore}đ
                        </p>
                        <p className="text-[10px] text-slate-500">{qr.details}</p>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Scan Notes */}
            {scanNotes.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-600 space-y-1">
                <div className="font-bold text-slate-700 flex items-center gap-1">
                  <Info className="w-3 h-3 text-blue-500" />
                  Ghi chú nhận diện AI:
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-[10px] text-slate-500">
                  {scanNotes.map((note, i) => (
                    <li key={i}>{note}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Modal: View Official Sample Sheet Preview (No Chrome iframe blocking) */}
      {showSampleModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-5 sm:p-6 max-h-[92vh] overflow-y-auto space-y-4 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Phiếu Trả Lời Trắc Nghiệm Mẫu Chuẩn - Bộ GD&ĐT
                </h3>
                <p className="text-xs text-slate-500">
                  Mẫu phiếu chính thức chuẩn OMR: Mục 7 (SBD 6 số), Mục 8 (Mã đề 3 số), Phần I (40 câu), Phần II (Đúng/Sai), Phần III (Trả lời ngắn 4 cột)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowSampleModal(false)}
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
                * Phiếu có 4 vạch đen định vị góc giúp nhận diện quét tự động chính xác cao.
              </span>
              <div className="flex items-center gap-2">
                <a
                  href="/assets/aistudio/phieu_bgd_2025_preview.png"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Eye className="w-4 h-4 text-slate-600" />
                  <span>Xem ảnh gốc</span>
                </a>

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
                  onClick={() => setShowSampleModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Students from Keyboard Before Grading */}
      {showQuickAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-5 sm:p-6 max-h-[92vh] overflow-y-auto space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-blue-600" />
                  Thêm Danh Sách Học Sinh Từ Bàn Phím
                </h3>
                <p className="text-xs text-slate-500">
                  Lưu danh sách học sinh theo SBD, Lớp học và Năm học trước khi bắt đầu quét bài thi.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowQuickAddModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 font-bold transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Mode Switcher */}
            <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => setQuickAddMode('single')}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  quickAddMode === 'single'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Nhập từng học sinh
              </button>
              <button
                type="button"
                onClick={() => setQuickAddMode('batch')}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  quickAddMode === 'batch'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Dán nhanh từ Excel / Bàn phím (Hàng loạt)
              </button>
            </div>

            {quickAddMode === 'single' ? (
              <form onSubmit={handleQuickAddSingleStudent} className="space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Số báo danh (6 chữ số) <span className="text-rose-500">*</span>:
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={quickSbd}
                      onChange={(e) => setQuickSbd(e.target.value.replace(/\D/g, ''))}
                      placeholder="VD: 010229"
                      required
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 font-mono font-bold text-blue-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Họ và tên học sinh <span className="text-rose-500">*</span>:
                    </label>
                    <input
                      type="text"
                      value={quickName}
                      onChange={(e) => setQuickName(e.target.value)}
                      placeholder="VD: Trần Thị Mai Phương"
                      required
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Lớp học:</label>
                    <input
                      type="text"
                      value={targetClass !== 'all' ? targetClass : '12A1'}
                      onChange={(e) => setTargetClass(e.target.value)}
                      placeholder="VD: 12A1"
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Năm học:</label>
                    <input
                      type="text"
                      value={targetYear !== 'all' ? targetYear : '2024 - 2025'}
                      onChange={(e) => setTargetYear(e.target.value)}
                      placeholder="VD: 2024 - 2025"
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Giới tính:</label>
                    <select
                      value={quickGender}
                      onChange={(e) => setQuickGender(e.target.value as 'Nam' | 'Nữ')}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-white"
                    >
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Ngày sinh:</label>
                    <input
                      type="text"
                      value={quickDob}
                      onChange={(e) => setQuickDob(e.target.value)}
                      placeholder="15/05/2007"
                      className="w-full border border-slate-300 rounded-xl px-3 py-2"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowQuickAddModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-500/20"
                  >
                    Lưu học sinh này vào danh sách
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3 text-xs">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-blue-900 space-y-1">
                  <p className="font-bold">Định dạng mỗi dòng (copy từ Excel hoặc gõ phân cách bằng phím Tab / dấu |):</p>
                  <p className="font-mono text-[11px] text-blue-700">
                    SBD [Tab] Họ và tên [Tab] Lớp [Tab] Năm học [Tab] Giới tính [Tab] Ngày sinh
                  </p>
                </div>

                <textarea
                  rows={6}
                  value={quickBatchText}
                  onChange={(e) => setQuickBatchText(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-3 font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  placeholder="Dán dữ liệu từ bảng tính Excel vào đây..."
                />

                <div className="pt-2 border-t flex justify-between items-center">
                  <span className="text-slate-500 text-[11px]">
                    Sẽ lưu trực tiếp vào cơ sở dữ liệu học sinh của hệ thống.
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowQuickAddModal(false)}
                      className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50"
                    >
                      Hủy
                    </button>
                    <button
                      type="button"
                      onClick={handleQuickAddBatchStudents}
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/20"
                    >
                      Lưu toàn bộ vào danh sách lớp
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
