import React, { useState } from 'react';
import { 
  Printer, 
  X, 
  Award, 
  Sparkles, 
  BrainCircuit, 
  BookOpen, 
  Check, 
  AlertCircle,
  FileText,
  MessageSquare
} from 'lucide-react';
import { ExamSubmission, COGNITIVE_LEVEL_LABELS, COGNITIVE_LEVEL_COLORS } from '../types/exam';
import { getGradeRank } from '../utils/scoring';

interface StudentDetailReportModalProps {
  submission: ExamSubmission | null;
  onClose: () => void;
}

export const StudentDetailReportModal: React.FC<StudentDetailReportModalProps> = ({
  submission,
  onClose,
}) => {
  if (!submission) return null;

  const [teacherNote, setTeacherNote] = useState<string>(
    submission.teacherFeedback || 'Em có tư duy tốt ở các câu hỏi thông hiểu. Cần cẩn thận hơn ở các câu hỏi phần Đúng/Sai để tránh mất điểm đáng tiếc.'
  );

  const gradeRank = getGradeRank(submission.scores.totalScore);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full p-5 sm:p-7 space-y-6 shadow-2xl max-h-[92vh] overflow-y-auto print:max-h-none print:shadow-none print:p-0">
        {/* Modal Top Actions */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 print:hidden">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              Báo cáo cá nhân chi tiết
            </span>
            <span className="text-xs text-slate-500 font-medium">Chuẩn BGD 2025</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In phiếu báo điểm</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 font-bold"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Official Header */}
        <div className="text-center border-b-2 border-slate-900 pb-4">
          <div className="flex justify-between items-start text-[11px] text-slate-600 mb-2">
            <div>
              <p className="font-bold uppercase text-slate-800">TRƯỜNG THPT CHUYÊN LÊ HỒNG PHONG</p>
              <p>Tổ Chuyên Môn Khảo Thí</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-slate-800">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
              <p className="italic">Độc lập - Tự do - Hạnh phúc</p>
            </div>
          </div>

          <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight uppercase">
            PHIẾU BÁO CÁO KẾT QUẢ VÀ PHÂN TÍCH NĂNG LỰC
          </h2>
          <p className="text-xs text-slate-600 font-medium">
            Kỳ thi: <span className="font-bold text-slate-900">{submission.examTitle}</span>
          </p>
        </div>

        {/* Student Information & Score Summary Box */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Info */}
          <div className="md:col-span-8 p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-500 font-medium">Họ và tên thí sinh:</span>
                <p className="text-sm font-black text-blue-900 uppercase">{submission.studentName}</p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Lớp:</span>
                <p className="text-sm font-bold text-slate-900">{submission.className}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200">
              <div>
                <span className="text-slate-500 font-medium">Số báo danh (Mục 7):</span>
                <p className="font-mono font-black text-slate-900 text-sm">{submission.sbd}</p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Mã đề thi (Mục 8):</span>
                <p className="font-mono font-black text-emerald-700 text-sm">{submission.examCode}</p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Thời gian quét:</span>
                <p className="text-slate-700 font-medium text-[11px]">{submission.scannedAt}</p>
              </div>
            </div>
          </div>

          {/* Big Score Box */}
          <div className="md:col-span-4 p-4 rounded-xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white flex flex-col justify-between text-center">
            <div>
              <p className="text-xs text-slate-300 font-medium">Tổng điểm bài thi</p>
              <div className="flex items-baseline justify-center gap-1 mt-1">
                <span className="text-4xl font-black text-white">{submission.scores.totalScore}</span>
                <span className="text-sm text-slate-400 font-bold">/ 10.0</span>
              </div>
            </div>

            <div className="mt-2 pt-2 border-t border-slate-800">
              <span className={`inline-block px-3 py-0.5 rounded-full text-xs font-black border ${gradeRank.badgeClass}`}>
                {gradeRank.rank}
              </span>
            </div>
          </div>
        </div>

        {/* 3 Sections Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl border border-slate-200 bg-white">
            <p className="text-slate-500 font-medium text-[11px]">Phần I: Trắc nghiệm 4 lựa chọn</p>
            <p className="text-base font-black text-slate-900 mt-1">
              {submission.scores.part1Score} <span className="text-xs text-slate-400 font-normal">/ 3.0đ</span>
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">Mỗi câu 0.25 điểm</p>
          </div>

          <div className="p-3 rounded-xl border border-slate-200 bg-white">
            <p className="text-slate-500 font-medium text-[11px]">Phần II: Trắc nghiệm Đúng / Sai</p>
            <p className="text-base font-black text-amber-700 mt-1">
              {submission.scores.part2Score} <span className="text-xs text-slate-400 font-normal">/ 4.0đ</span>
            </p>
            <p className="text-[10px] text-amber-600 mt-0.5">Thang lũy tiến BGD 2025</p>
          </div>

          <div className="p-3 rounded-xl border border-slate-200 bg-white">
            <p className="text-slate-500 font-medium text-[11px]">Phần III: Trả lời ngắn</p>
            <p className="text-base font-black text-emerald-700 mt-1">
              {submission.scores.part3Score} <span className="text-xs text-slate-400 font-normal">/ 3.0đ</span>
            </p>
            <p className="text-[10px] text-emerald-600 mt-0.5">Mỗi câu 0.5 điểm</p>
          </div>
        </div>

        {/* Competency by Cognitive Levels & Topics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Cognitive Levels */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 border-b pb-2">
              <BrainCircuit className="w-4 h-4 text-indigo-600" />
              Năng lực theo Cấp độ Nhận thức
            </h3>
            <div className="space-y-2.5">
              {Object.entries(submission.levelCompetencies || {}).map(([key, lvl]) => (
                <div key={key} className="space-y-1 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-700">{lvl.label}</span>
                    <span className="font-black text-slate-900">{lvl.percentage}% ({lvl.scoreEarned}/{lvl.maxScore}đ)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      style={{ width: `${lvl.percentage}%` }}
                      className="h-full rounded-full bg-blue-600"
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Topics Competencies */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 border-b pb-2">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              Năng lực theo Chuyên đề Môn học
            </h3>
            <div className="space-y-2.5">
              {Object.entries(submission.topicCompetencies || {}).map(([topic, comp]) => (
                <div key={topic} className="space-y-1 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-700 line-clamp-1">{topic}</span>
                    <span className={`font-black ${comp.percentage >= 70 ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {comp.percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      style={{ width: `${comp.percentage}%` }}
                      className={`h-full rounded-full ${comp.percentage >= 70 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Item-by-Item Detailed Questions Table */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-blue-600" />
            Chi tiết kết quả từng câu hỏi
          </h3>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="max-h-60 overflow-y-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-700 sticky top-0 border-b">
                  <tr>
                    <th className="py-2 px-3 font-bold">Câu</th>
                    <th className="py-2 px-3 font-bold">Phần</th>
                    <th className="py-2 px-3 font-bold">Chuyên đề</th>
                    <th className="py-2 px-3 font-bold">Cấp độ</th>
                    <th className="py-2 px-3 font-bold text-center">HS chọn</th>
                    <th className="py-2 px-3 font-bold text-center">Đáp án đúng</th>
                    <th className="py-2 px-3 font-bold text-right">Điểm đạt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {submission.questionResults.map((qr) => {
                    let ansStudent = '—';
                    let ansCorrect = '—';

                    if (qr.part === 1) {
                      ansStudent = qr.studentAnswer || 'Trống';
                      ansCorrect = qr.correctAnswer;
                    } else if (qr.part === 2) {
                      const sa = qr.studentAnswer || {};
                      const ca = qr.correctAnswer || {};
                      ansStudent = `a:${sa.a ? 'Đ' : sa.a === false ? 'S' : '-'} b:${sa.b ? 'Đ' : sa.b === false ? 'S' : '-'} c:${sa.c ? 'Đ' : sa.c === false ? 'S' : '-'} d:${sa.d ? 'Đ' : sa.d === false ? 'S' : '-'}`;
                      ansCorrect = `a:${ca.a ? 'Đ' : 'S'} b:${ca.b ? 'Đ' : 'S'} c:${ca.c ? 'Đ' : 'S'} d:${ca.d ? 'Đ' : 'S'}`;
                    } else if (qr.part === 3) {
                      ansStudent = qr.studentAnswer || 'Trống';
                      ansCorrect = qr.correctAnswer;
                    }

                    return (
                      <tr key={`${qr.part}-${qr.questionNumber}`} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-bold text-slate-900">{qr.questionNumber}</td>
                        <td className="py-2 px-3 font-medium text-slate-600">Phần {qr.part}</td>
                        <td className="py-2 px-3 text-slate-700">{qr.topic}</td>
                        <td className="py-2 px-3">
                          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold border ${COGNITIVE_LEVEL_COLORS[qr.cognitiveLevel]}`}>
                            {COGNITIVE_LEVEL_LABELS[qr.cognitiveLevel]}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-center font-mono font-bold text-slate-800">{ansStudent}</td>
                        <td className="py-2 px-3 text-center font-mono font-bold text-emerald-700">{ansCorrect}</td>
                        <td className="py-2 px-3 text-right font-black text-slate-900">
                          {qr.scoreEarned} / {qr.maxScore}đ
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* AI Pedagogical Advice & Teacher Comment Box */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* AI Pedagogical Analysis */}
          <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200 text-xs space-y-1.5">
            <h4 className="font-bold text-indigo-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Tư vấn & Lộ trình bồi dưỡng kiến thức AI
            </h4>
            <p className="text-[11px] text-indigo-950 leading-relaxed">
              {submission.aiPedagogicalAdvice ||
                'Học sinh thể hiện tư duy logic tốt ở phần trắc nghiệm đơn. Cần tăng cường luyện tập nhận diện mệnh đề Đúng/Sai ở chuyên đề Hình học không gian và các bài toán cực trị thực tế để tối ưu điểm số theo cấu trúc thi 2025.'}
            </p>
          </div>

          {/* Teacher's Handwritten/Custom Feedback */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-white text-xs space-y-1.5">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              Nhận xét của Giáo viên bộ môn:
            </h4>
            <textarea
              value={teacherNote}
              onChange={(e) => setTeacherNote(e.target.value)}
              rows={2}
              className="w-full text-[11px] text-slate-700 border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Signatures for Print */}
        <div className="hidden print:grid grid-cols-2 gap-8 pt-8 text-center text-xs">
          <div>
            <p className="font-bold text-slate-800">CÁN BỘ CHẤM THI</p>
            <p className="italic text-slate-500">(Ký và ghi rõ họ tên)</p>
          </div>
          <div>
            <p className="font-bold text-slate-800">GIÁO VIÊN BỘ MÔN</p>
            <p className="italic text-slate-500">(Ký và ghi rõ họ tên)</p>
          </div>
        </div>
      </div>
    </div>
  );
};
