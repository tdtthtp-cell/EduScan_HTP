import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  FileSpreadsheet, 
  Printer, 
  FileText, 
  Camera, 
  ArrowUpDown, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  AlertTriangle,
  UserPlus,
  Trash2,
  Calendar,
  Layers,
  Check,
  X,
  FilePlus,
  Sparkles
} from 'lucide-react';
import { Exam, Student, ExamSubmission } from '../types/exam';
import { getGradeRank } from '../utils/scoring';

interface StudentsGradebookViewProps {
  currentExam: Exam;
  students: Student[];
  submissions: ExamSubmission[];
  onAddStudent: (student: Student) => void;
  onBatchAddStudents: (students: Student[]) => void;
  onDeleteStudent: (studentId: string) => void;
  onDeleteMultipleStudents?: (studentIds: string[]) => void;
  onViewStudentReport: (submission: ExamSubmission) => void;
  onNavigateToScanner: () => void;
}

export const StudentsGradebookView: React.FC<StudentsGradebookViewProps> = ({
  currentExam,
  students,
  submissions,
  onAddStudent,
  onBatchAddStudents,
  onDeleteStudent,
  onDeleteMultipleStudents,
  onViewStudentReport,
  onNavigateToScanner,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [rankFilter, setRankFilter] = useState<string>('all');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'sbd' | 'name' | 'score'>('score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Multi-selection state for student deletion & management
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Deletion confirmation modal state
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    isOpen: boolean;
    mode: 'single' | 'batch';
    student?: Student;
  }>({ isOpen: false, mode: 'single' });

  // Modal state for adding students from keyboard
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [addMode, setAddMode] = useState<'single' | 'batch'>('single');

  // Single student form state
  const [newSbd, setNewSbd] = useState<string>('');
  const [newName, setNewName] = useState<string>('');
  const [newClass, setNewClass] = useState<string>(students[0]?.className || '12A1');
  const [newYear, setNewYear] = useState<string>(currentExam.academicYear || '2024 - 2025');
  const [newGender, setNewGender] = useState<'Nam' | 'Nữ'>('Nam');
  const [newDob, setNewDob] = useState<string>('15/05/2007');
  const [newEmail, setNewEmail] = useState<string>('');

  // Batch paste state
  const [batchText, setBatchText] = useState<string>(
`010226	Lê Minh Khang	12A1	2024 - 2025	Nam	14/05/2007
010227	Vũ Thu Trang	12A1	2024 - 2025	Nữ	22/09/2007
010228	Hoàng Đức Nam	12A1	2024 - 2025	Nam	18/02/2007`
  );
  const [parsedBatchList, setParsedBatchList] = useState<Student[]>([]);

  // Unique classes and academic years
  const availableClasses = useMemo(() => {
    const set = new Set(students.map((s) => s.className).filter(Boolean));
    return Array.from(set);
  }, [students]);

  const availableYears = useMemo(() => {
    const set = new Set(students.map((s) => s.academicYear).filter(Boolean));
    return Array.from(set);
  }, [students]);

  // Map submissions by SBD for the current exam
  const submissionMap = useMemo(() => {
    const map = new Map<string, ExamSubmission>();
    submissions
      .filter((s) => s.examId === currentExam.id)
      .forEach((sub) => {
        map.set(sub.sbd, sub);
      });
    return map;
  }, [submissions, currentExam.id]);

  // Combined students with grade status
  const rosterData = useMemo(() => {
    return students.map((student) => {
      const sub = submissionMap.get(student.sbd);
      return {
        ...student,
        submission: sub,
        isGraded: Boolean(sub),
        score: sub ? sub.scores.totalScore : -1,
        part1Score: sub ? sub.scores.part1Score : null,
        part2Score: sub ? sub.scores.part2Score : null,
        part3Score: sub ? sub.scores.part3Score : null,
        examCode: sub ? sub.examCode : '—',
        rank: sub ? getGradeRank(sub.scores.totalScore) : null,
      };
    });
  }, [students, submissionMap]);

  // Filter & Search
  const filteredData = useMemo(() => {
    return rosterData
      .filter((item) => {
        const matchesQuery =
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.sbd.includes(searchQuery);

        if (!matchesQuery) return false;

        if (classFilter !== 'all' && item.className !== classFilter) return false;
        if (yearFilter !== 'all' && item.academicYear !== yearFilter) return false;

        if (rankFilter === 'all') return true;
        if (rankFilter === 'ungraded') return !item.isGraded;
        if (rankFilter === 'excellent') return item.isGraded && item.score >= 8.0;
        if (rankFilter === 'good') return item.isGraded && item.score >= 6.5 && item.score < 8.0;
        if (rankFilter === 'average') return item.isGraded && item.score >= 5.0 && item.score < 6.5;
        if (rankFilter === 'weak') return item.isGraded && item.score < 5.0;

        return true;
      })
      .sort((a, b) => {
        let comparison = 0;
        if (sortBy === 'score') {
          comparison = a.score - b.score;
        } else if (sortBy === 'sbd') {
          comparison = a.sbd.localeCompare(b.sbd);
        } else if (sortBy === 'name') {
          comparison = a.name.localeCompare(b.name, 'vi');
        }
        return sortOrder === 'desc' ? -comparison : comparison;
      });
  }, [rosterData, searchQuery, classFilter, yearFilter, rankFilter, sortBy, sortOrder]);

  // Visible student IDs matching current filter & search
  const visibleStudentIds = useMemo(() => filteredData.map((s) => s.id), [filteredData]);

  // Is all visible students selected
  const isAllSelected = useMemo(
    () => visibleStudentIds.length > 0 && visibleStudentIds.every((id) => selectedStudentIds.includes(id)),
    [visibleStudentIds, selectedStudentIds]
  );

  const isSomeSelected = useMemo(
    () => visibleStudentIds.some((id) => selectedStudentIds.includes(id)) && !isAllSelected,
    [visibleStudentIds, selectedStudentIds, isAllSelected]
  );

  // Select all visible students or deselect all visible
  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedStudentIds((prev) => prev.filter((id) => !visibleStudentIds.includes(id)));
    } else {
      setSelectedStudentIds((prev) => Array.from(new Set([...prev, ...visibleStudentIds])));
    }
  };

  // Toggle single student selection
  const handleToggleSelectOne = (studentId: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  // Clear all selections
  const handleClearSelection = () => {
    setSelectedStudentIds([]);
  };

  // Prompt delete single student
  const promptDeleteSingle = (student: Student) => {
    setDeleteConfirmModal({
      isOpen: true,
      mode: 'single',
      student,
    });
  };

  // Prompt delete batch selected students
  const promptDeleteBatch = () => {
    if (selectedStudentIds.length === 0) return;
    setDeleteConfirmModal({
      isOpen: true,
      mode: 'batch',
    });
  };

  // Execute deletion after user confirms in modal
  const handleExecuteDelete = () => {
    if (deleteConfirmModal.mode === 'single' && deleteConfirmModal.student) {
      const student = deleteConfirmModal.student;
      onDeleteStudent(student.id);
      setSelectedStudentIds((prev) => prev.filter((id) => id !== student.id));
      setToastMessage(`Đã xoá học sinh "${student.name}" (SBD: ${student.sbd}) khỏi danh sách.`);
    } else if (deleteConfirmModal.mode === 'batch') {
      const count = selectedStudentIds.length;
      if (onDeleteMultipleStudents) {
        onDeleteMultipleStudents(selectedStudentIds);
      } else {
        selectedStudentIds.forEach((id) => onDeleteStudent(id));
      }
      setSelectedStudentIds([]);
      setToastMessage(`Đã xoá thành công ${count} học sinh đã chọn khỏi danh sách.`);
    }
    setDeleteConfirmModal({ isOpen: false, mode: 'single' });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Handle single student submit
  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSbd = newSbd.padStart(6, '0').slice(-6);

    if (students.some((s) => s.sbd === cleanSbd && s.className === newClass && s.academicYear === newYear)) {
      alert(`Học sinh với SBD ${cleanSbd} trong Lớp ${newClass} (${newYear}) đã tồn tại!`);
      return;
    }

    const student: Student = {
      id: `hs-${Date.now()}`,
      sbd: cleanSbd,
      name: newName.trim(),
      className: newClass.trim(),
      academicYear: newYear.trim(),
      gender: newGender,
      dob: newDob.trim(),
      email: newEmail.trim() || undefined,
    };

    onAddStudent(student);
    setNewSbd('');
    setNewName('');
    setShowAddModal(false);
  };

  // Parse batch text from keyboard / Excel paste
  const handleParseBatch = () => {
    const lines = batchText.split('\n').map((l) => l.trim()).filter(Boolean);
    const parsed: Student[] = [];

    lines.forEach((line, idx) => {
      // Split by tab, pipe (|), or comma (,)
      let parts: string[] = [];
      if (line.includes('\t')) {
        parts = line.split('\t');
      } else if (line.includes('|')) {
        parts = line.split('|');
      } else {
        parts = line.split(',');
      }

      parts = parts.map((p) => p.trim());
      if (parts.length >= 2) {
        const sbdRaw = parts[0].replace(/\D/g, '').padStart(6, '0').slice(-6);
        const name = parts[1];
        const className = parts[2] || newClass || '12A1';
        const academicYear = parts[3] || newYear || '2024 - 2025';
        const gender: 'Nam' | 'Nữ' = parts[4]?.toLowerCase().includes('nữ') ? 'Nữ' : 'Nam';
        const dob = parts[5] || '01/01/2007';

        if (sbdRaw && name) {
          parsed.push({
            id: `hs-batch-${Date.now()}-${idx}`,
            sbd: sbdRaw,
            name,
            className,
            academicYear,
            gender,
            dob,
          });
        }
      }
    });

    setParsedBatchList(parsed);
  };

  const handleConfirmBatchAdd = () => {
    if (parsedBatchList.length === 0) {
      alert('Không có học sinh hợp lệ để lưu!');
      return;
    }

    onBatchAddStudents(parsedBatchList);
    setBatchText('');
    setParsedBatchList([]);
    setShowAddModal(false);
  };

  // Export CSV with UTF-8 BOM
  const exportToExcelCSV = () => {
    const headers = [
      'STT',
      'Số Báo Danh',
      'Họ và Tên',
      'Lớp',
      'Năm Học',
      'Giới Tính',
      'Ngày Sinh',
      'Mã Đề',
      'Điểm Phần I (Trắc nghiệm)',
      'Điểm Phần II (Đúng/Sai)',
      'Điểm Phần III (Trả lời ngắn)',
      'Tổng Điểm (Thang 10)',
      'Xếp Loại',
      'Trạng Thái',
    ];

    const rows = filteredData.map((item, idx) => [
      idx + 1,
      `'${item.sbd}`,
      `"${item.name}"`,
      item.className,
      item.academicYear,
      item.gender,
      item.dob,
      item.examCode,
      item.part1Score !== null ? item.part1Score : '',
      item.part2Score !== null ? item.part2Score : '',
      item.part3Score !== null ? item.part3Score : '',
      item.isGraded ? item.score : '',
      item.rank ? item.rank.rank : 'Chưa thi',
      item.isGraded ? 'Đã chấm' : 'Chưa nộp bài',
    ]);

    const csvContent =
      '\uFEFF' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Bang_Diem_${classFilter}_${yearFilter}_${currentExam.subject}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const gradedTotal = rosterData.filter((r) => r.isGraded).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              Quản lý danh sách học sinh
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Đề thi: <span className="font-bold text-slate-900">{currentExam.title}</span>
            </span>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Sổ Điểm & Danh Sách Học Sinh Theo Lớp & Năm Học
          </h1>
          <p className="text-xs text-slate-500">
            Học sinh được lưu trữ từ trước theo Số báo danh, Lớp học và Năm học. Khi chấm bài, điểm số tự động nhập vào đúng học sinh.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Button: Add student from keyboard */}
          <button
            type="button"
            onClick={() => {
              handleParseBatch();
              setShowAddModal(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 transition-all hover:scale-102"
          >
            <UserPlus className="w-4 h-4" />
            <span>Thêm học sinh từ bàn phím</span>
          </button>

          <button
            type="button"
            onClick={exportToExcelCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all hover:scale-102"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Xuất file Excel / CSV</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 shadow-2xs transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>In bảng điểm</span>
          </button>
        </div>
      </div>

      {/* Multi-Criteria Filter Bar (Lớp học, Năm học, Tìm kiếm, Xếp loại) */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Search box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo SBD hoặc tên..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          {/* Class Filter */}
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-semibold text-slate-700"
          >
            <option value="all">Tất cả các lớp ({students.length} HS)</option>
            {availableClasses.map((cls) => (
              <option key={cls} value={cls}>
                Lớp {cls} ({students.filter((s) => s.className === cls).length} HS)
              </option>
            ))}
          </select>

          {/* Academic Year Filter */}
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-semibold text-slate-700"
          >
            <option value="all">Tất cả năm học</option>
            {availableYears.map((yr) => (
              <option key={yr} value={yr}>
                Năm học {yr}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          {/* Rank Filter */}
          <select
            value={rankFilter}
            onChange={(e) => setRankFilter(e.target.value)}
            className="text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-slate-700"
          >
            <option value="all">Tất cả kết quả ({rosterData.length})</option>
            <option value="excellent">Giỏi / Xuất sắc (≥ 8.0)</option>
            <option value="good">Khá (6.5 - 7.9)</option>
            <option value="average">Trung bình (5.0 - 6.4)</option>
            <option value="weak">Cần bồi dưỡng (&lt; 5.0)</option>
            <option value="ungraded">Chưa nộp bài ({rosterData.length - gradedTotal})</option>
          </select>

          {/* Sort button */}
          <button
            type="button"
            onClick={() => {
              if (sortBy === 'score') setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
              else {
                setSortBy('score');
                setSortOrder('desc');
              }
            }}
            className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold border ${
              sortBy === 'score' ? 'bg-blue-50 text-blue-700 border-blue-300' : 'bg-white text-slate-700 border-slate-300'
            }`}
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>Sắp xếp điểm ({sortOrder === 'desc' ? 'Cao → Thấp' : 'Thấp → Cao'})</span>
          </button>
        </div>
      </div>

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

      {/* Batch Selection Action Bar */}
      {selectedStudentIds.length > 0 && (
        <div className="bg-gradient-to-r from-rose-50 via-amber-50 to-blue-50 border-2 border-rose-300 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in duration-150">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
              {selectedStudentIds.length}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">
                Đã chọn <span className="text-rose-700 font-extrabold text-sm">{selectedStudentIds.length}</span> học sinh
                <span className="text-slate-500 font-normal"> (trong tổng số {filteredData.length} học sinh đang hiển thị)</span>
              </p>
              <p className="text-[11px] text-slate-600">
                Bạn có thể xoá đồng loạt các học sinh đã chọn hoặc huỷ chọn bất kỳ lúc nào.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={handleClearSelection}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 transition-colors shadow-2xs"
            >
              Bỏ chọn ({selectedStudentIds.length})
            </button>
            <button
              type="button"
              onClick={promptDeleteBatch}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1.5 shadow-md shadow-rose-600/20 transition-all hover:scale-102"
            >
              <Trash2 className="w-4 h-4" />
              <span>Xoá {selectedStudentIds.length} học sinh đã chọn</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Students Roster Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-700 border-b border-slate-200">
                <th className="py-3 px-3.5 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isSomeSelected;
                    }}
                    onChange={handleToggleSelectAll}
                    title={isAllSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả học sinh đang hiển thị'}
                    className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-3.5 font-bold">STT</th>
                <th className="py-3 px-3.5 font-bold">Số báo danh</th>
                <th className="py-3 px-3.5 font-bold">Họ và tên</th>
                <th className="py-3 px-3.5 font-bold">Lớp</th>
                <th className="py-3 px-3.5 font-bold">Năm học</th>
                <th className="py-3 px-3.5 font-bold text-center">Mã đề</th>
                <th className="py-3 px-3.5 font-bold text-center">Phần I (Trắc nghiệm)</th>
                <th className="py-3 px-3.5 font-bold text-center">Phần II (Đúng/Sai)</th>
                <th className="py-3 px-3.5 font-bold text-center">Phần III (Trả lời ngắn)</th>
                <th className="py-3 px-3.5 font-bold text-center">Tổng điểm</th>
                <th className="py-3 px-3.5 font-bold text-center">Xếp loại</th>
                <th className="py-3 px-3.5 font-bold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map((item, idx) => {
                const isSelected = selectedStudentIds.includes(item.id);
                return (
                  <tr
                    key={item.id}
                    className={`transition-colors ${
                      isSelected
                        ? 'bg-blue-50/70 hover:bg-blue-100/60 border-l-4 border-l-blue-600'
                        : 'hover:bg-slate-50/70'
                    }`}
                  >
                    <td className="py-3 px-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelectOne(item.id)}
                        className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>
                    <td className="py-3 px-3.5 text-slate-500 font-mono">{idx + 1}</td>
                    <td className="py-3 px-3.5 font-mono font-bold text-blue-700">
                      {item.sbd}
                    </td>
                    <td className="py-3 px-3.5 font-bold text-slate-900">
                      {item.name}
                    </td>
                    <td className="py-3 px-3.5 font-semibold text-slate-700">{item.className}</td>
                    <td className="py-3 px-3.5 text-slate-500 font-mono">{item.academicYear}</td>
                    <td className="py-3 px-3.5 text-center font-mono font-medium">
                      {item.examCode !== '—' ? (
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-bold">
                          {item.examCode}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-3 px-3.5 text-center font-mono text-slate-700">
                      {item.part1Score !== null ? `${item.part1Score}đ` : '—'}
                    </td>
                    <td className="py-3 px-3.5 text-center font-mono text-amber-700">
                      {item.part2Score !== null ? `${item.part2Score}đ` : '—'}
                    </td>
                    <td className="py-3 px-3.5 text-center font-mono text-emerald-700">
                      {item.part3Score !== null ? `${item.part3Score}đ` : '—'}
                    </td>
                    <td className="py-3 px-3.5 text-center">
                      {item.isGraded ? (
                        <span className="font-black text-sm text-slate-900">
                          {item.score}đ
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Chưa nộp</span>
                      )}
                    </td>
                    <td className="py-3 px-3.5 text-center">
                      {item.rank ? (
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${item.rank.badgeClass}`}>
                          {item.rank.rank}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-500">
                          Chờ quét
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3.5 text-right flex items-center justify-end gap-1.5">
                      {item.submission ? (
                        <button
                          type="button"
                          onClick={() => onViewStudentReport(item.submission!)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Xem điểm</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={onNavigateToScanner}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>Quét bài</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => promptDeleteSingle(item)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        title={`Xóa học sinh ${item.name} khỏi danh sách`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredData.length === 0 && (
          <div className="p-8 text-center text-slate-500 text-xs">
            Không tìm thấy học sinh nào trong Lớp hoặc Năm học đã chọn. Hãy bấm <strong>"Thêm học sinh từ bàn phím"</strong> để nhập danh sách mới.
          </div>
        )}
      </div>

      {/* COMPREHENSIVE MODAL: Add Student(s) from Keyboard / Excel Paste */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-5 sm:p-6 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-blue-600" />
                  Thêm Học Sinh Từ Bàn Phím (Lưu Trước Khi Chấm Điểm)
                </h3>
                <p className="text-xs text-slate-500">
                  Lưu trữ sẵn SBD, Lớp học và Năm học. Khi quét ảnh hoặc chấm bài, điểm số sẽ tự động nhập vào hồ sơ học sinh.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            {/* Mode Tabs */}
            <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setAddMode('single')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  addMode === 'single'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Nhập từng học sinh
              </button>
              <button
                type="button"
                onClick={() => {
                  setAddMode('batch');
                  handleParseBatch();
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  addMode === 'batch'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Nhập nhanh cả danh sách (Dán từ Excel / Bàn phím)
              </button>
            </div>

            {/* Form Mode 1: Single Student */}
            {addMode === 'single' ? (
              <form onSubmit={handleSingleSubmit} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Số báo danh (6 chữ số): <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="VD: 010226"
                      value={newSbd}
                      onChange={(e) => setNewSbd(e.target.value.replace(/\D/g, ''))}
                      className="w-full border border-slate-300 rounded-xl p-2.5 font-mono font-bold text-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Họ và tên học sinh: <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="VD: Nguyễn Văn Anh"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-medium"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Lớp học: <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="VD: 12A1"
                      value={newClass}
                      onChange={(e) => setNewClass(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-semibold"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Năm học: <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="VD: 2024 - 2025"
                      value={newYear}
                      onChange={(e) => setNewYear(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-medium"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Giới tính:</label>
                    <select
                      value={newGender}
                      onChange={(e) => setNewGender(e.target.value as any)}
                      className="w-full border border-slate-300 rounded-xl p-2.5 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    >
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Ngày sinh (DD/MM/YYYY):</label>
                    <input
                      type="text"
                      placeholder="15/03/2007"
                      value={newDob}
                      onChange={(e) => setNewDob(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20"
                  >
                    <Check className="w-4 h-4" />
                    <span>Lưu Học Sinh Vào Danh Sách</span>
                  </button>
                </div>
              </form>
            ) : (
              /* Form Mode 2: Batch Paste from Excel */
              <div className="space-y-3.5 text-xs">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-bold text-slate-700 block">
                      Dán danh sách từ Excel hoặc gõ từ bàn phím:
                    </label>
                    <span className="text-[11px] text-slate-500">
                      Mỗi dòng: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">SBD | Họ tên | Lớp | Năm học | Giới tính | Ngày sinh</code>
                    </span>
                  </div>
                  <textarea
                    rows={6}
                    value={batchText}
                    onChange={(e) => setBatchText(e.target.value)}
                    placeholder="010226	Lê Minh Khang	12A1	2024 - 2025	Nam	14/05/2007..."
                    className="w-full border border-slate-300 rounded-xl p-3 font-mono text-[11px] focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                  <div className="flex justify-between items-center mt-1">
                    <button
                      type="button"
                      onClick={handleParseBatch}
                      className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Phân tích & Kiểm tra danh sách
                    </button>
                    <span className="text-[11px] text-slate-500">
                      Nhận diện được: <strong className="text-blue-700">{parsedBatchList.length}</strong> học sinh
                    </span>
                  </div>
                </div>

                {/* Parsed Preview Table */}
                {parsedBatchList.length > 0 && (
                  <div className="border border-slate-200 rounded-xl overflow-hidden max-h-40 overflow-y-auto">
                    <table className="w-full text-[11px] text-left">
                      <thead className="bg-slate-50 text-slate-700 sticky top-0 border-b">
                        <tr>
                          <th className="py-1.5 px-2 font-bold">STT</th>
                          <th className="py-1.5 px-2 font-bold">SBD</th>
                          <th className="py-1.5 px-2 font-bold">Họ và tên</th>
                          <th className="py-1.5 px-2 font-bold">Lớp</th>
                          <th className="py-1.5 px-2 font-bold">Năm học</th>
                          <th className="py-1.5 px-2 font-bold">Giới tính</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {parsedBatchList.map((st, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="py-1 px-2 text-slate-500">{i + 1}</td>
                            <td className="py-1 px-2 font-mono font-bold text-blue-700">{st.sbd}</td>
                            <td className="py-1 px-2 font-semibold text-slate-900">{st.name}</td>
                            <td className="py-1 px-2 text-slate-700">{st.className}</td>
                            <td className="py-1 px-2 text-slate-600">{st.academicYear}</td>
                            <td className="py-1 px-2 text-slate-600">{st.gender}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmBatchAdd}
                    disabled={parsedBatchList.length === 0}
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20"
                  >
                    <Check className="w-4 h-4" />
                    <span>Lưu Toàn Bộ ({parsedBatchList.length}) Học Sinh Vào Danh Sách</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (Single Student & Batch Selection) */}
      {deleteConfirmModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 space-y-4 shadow-2xl border border-rose-100">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-slate-900">
                  {deleteConfirmModal.mode === 'single'
                    ? 'Xác nhận xoá học sinh'
                    : `Xác nhận xoá ${selectedStudentIds.length} học sinh đã chọn`}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {deleteConfirmModal.mode === 'single'
                    ? 'Bạn có chắc chắn muốn xoá học sinh này khỏi danh sách sổ điểm?'
                    : `Bạn có chắc chắn muốn xoá toàn bộ ${selectedStudentIds.length} học sinh đã chọn khỏi danh sách sổ điểm?`}
                </p>
              </div>
            </div>

            {/* Details preview for Single Student */}
            {deleteConfirmModal.mode === 'single' && deleteConfirmModal.student && (
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Họ và tên:</span>
                  <span className="font-bold text-slate-900 text-sm">{deleteConfirmModal.student.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Số báo danh:</span>
                  <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {deleteConfirmModal.student.sbd}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Lớp & Năm học:</span>
                  <span className="font-semibold text-slate-700">
                    Lớp {deleteConfirmModal.student.className} • Năm học {deleteConfirmModal.student.academicYear}
                  </span>
                </div>
                {submissionMap.get(deleteConfirmModal.student.sbd) && (
                  <div className="flex justify-between items-center pt-1.5 border-t border-slate-200 text-rose-600 font-semibold">
                    <span>Kết quả bài thi đã chấm:</span>
                    <span className="font-bold">
                      {submissionMap.get(deleteConfirmModal.student.sbd)!.scores.totalScore}đ (sẽ bị xoá)
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Details preview for Batch Selection */}
            {deleteConfirmModal.mode === 'batch' && (
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs space-y-2">
                <p className="font-bold text-slate-800">
                  Danh sách học sinh sẽ bị xoá ({selectedStudentIds.length}):
                </p>
                <div className="max-h-36 overflow-y-auto space-y-1 pr-1 divide-y divide-slate-200/60">
                  {students
                    .filter((s) => selectedStudentIds.includes(s.id))
                    .slice(0, 8)
                    .map((s) => (
                      <div key={s.id} className="flex justify-between items-center py-1 text-[11px]">
                        <span className="font-bold text-slate-800 truncate mr-2">{s.name}</span>
                        <span className="font-mono text-slate-500 shrink-0">
                          SBD: {s.sbd} • {s.className}
                        </span>
                      </div>
                    ))}
                  {selectedStudentIds.length > 8 && (
                    <p className="text-[11px] text-slate-500 italic pt-1 text-center font-medium">
                      ... và {selectedStudentIds.length - 8} học sinh khác
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
              <p className="font-bold flex items-center gap-1">
                <span>⚠️ Lưu ý:</span>
              </p>
              <p className="mt-0.5 text-[11px] leading-relaxed">
                Hành động này sẽ xoá học sinh và kết quả bài làm tương ứng khỏi hệ thống. Dữ liệu sau khi xoá không thể khôi phục tự động.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmModal({ isOpen: false, mode: 'single' })}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleExecuteDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-md shadow-rose-600/20"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>
                  {deleteConfirmModal.mode === 'single' ? 'Xác nhận xoá' : `Xác nhận xoá (${selectedStudentIds.length})`}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
