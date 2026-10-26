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
  AlertCircle 
} from 'lucide-react';
import { Exam, Student, ExamSubmission } from '../types/exam';
import { getGradeRank } from '../utils/scoring';

interface StudentsGradebookViewProps {
  currentExam: Exam;
  students: Student[];
  submissions: ExamSubmission[];
  onViewStudentReport: (submission: ExamSubmission) => void;
  onNavigateToScanner: () => void;
}

export const StudentsGradebookView: React.FC<StudentsGradebookViewProps> = ({
  currentExam,
  students,
  submissions,
  onViewStudentReport,
  onNavigateToScanner,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [rankFilter, setRankFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'sbd' | 'name' | 'score'>('score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

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
  }, [rosterData, searchQuery, rankFilter, sortBy, sortOrder]);

  // Export CSV with UTF-8 BOM so Microsoft Excel renders Vietnamese correctly
  const exportToExcelCSV = () => {
    const headers = [
      'STT',
      'Số Báo Danh',
      'Họ và Tên',
      'Lớp',
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
      `'${item.sbd}`, // preserve leading zeros in Excel
      `"${item.name}"`,
      item.className,
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
      '\uFEFF' + // UTF-8 BOM
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Bang_Diem_Lop_${students[0]?.className || '12A1'}_${currentExam.subject}.csv`);
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
              Lớp {students[0]?.className || '12A1'}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Bài thi: <span className="font-bold text-slate-900">{currentExam.title}</span>
            </span>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Sổ Điểm & Danh Sách Học Sinh
          </h1>
          <p className="text-xs text-slate-500">
            Tự động đồng bộ điểm số từ phiếu quét, theo dõi học sinh đã nộp và xuất báo cáo kết quả chi tiết.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
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
            <span>In bảng điểm lớp</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo SBD hoặc tên học sinh..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
          <select
            value={rankFilter}
            onChange={(e) => setRankFilter(e.target.value)}
            className="text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          >
            <option value="all">Tất cả học sinh ({rosterData.length})</option>
            <option value="excellent">Học sinh Giỏi / Xuất sắc (≥ 8.0)</option>
            <option value="good">Học sinh Khá (6.5 - 7.9)</option>
            <option value="average">Học sinh Trung bình (5.0 - 6.4)</option>
            <option value="weak">Cần hỗ trợ (&lt; 5.0)</option>
            <option value="ungraded">Chưa nộp bài ({rosterData.length - gradedTotal})</option>
          </select>

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

      {/* Main Students Roster Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-700 border-b border-slate-200">
                <th className="py-3 px-3.5 font-bold">STT</th>
                <th className="py-3 px-3.5 font-bold">Số báo danh</th>
                <th className="py-3 px-3.5 font-bold">Họ và tên</th>
                <th className="py-3 px-3.5 font-bold">Lớp</th>
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
              {filteredData.map((item, idx) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3.5 text-slate-500 font-mono">{idx + 1}</td>
                  <td className="py-3 px-3.5 font-mono font-bold text-blue-700">
                    {item.sbd}
                  </td>
                  <td className="py-3 px-3.5 font-bold text-slate-900">
                    {item.name}
                  </td>
                  <td className="py-3 px-3.5 text-slate-600">{item.className}</td>
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
                  <td className="py-3 px-3.5 text-right">
                    {item.submission ? (
                      <button
                        type="button"
                        onClick={() => onViewStudentReport(item.submission!)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Xem chi tiết</span>
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredData.length === 0 && (
          <div className="p-8 text-center text-slate-500 text-xs">
            Không tìm thấy học sinh phù hợp với bộ lọc tìm kiếm.
          </div>
        )}
      </div>
    </div>
  );
};
