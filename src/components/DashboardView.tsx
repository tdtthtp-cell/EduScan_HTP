import React, { useMemo } from 'react';
import { 
  Users, 
  TrendingUp, 
  Award, 
  AlertTriangle, 
  CheckCircle2, 
  BookOpen, 
  Camera, 
  BarChart, 
  BrainCircuit, 
  ArrowUpRight,
  Sparkles,
  FileSpreadsheet
} from 'lucide-react';
import { Exam, ExamSubmission, Student, CognitiveLevel } from '../types/exam';
import { getGradeRank } from '../utils/scoring';

interface DashboardViewProps {
  currentExam: Exam;
  exams: Exam[];
  onSelectExam: (exam: Exam) => void;
  submissions: ExamSubmission[];
  students: Student[];
  onNavigateToScanner: () => void;
  onNavigateToStudents: () => void;
  onViewStudentReport: (submission: ExamSubmission) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentExam,
  exams,
  onSelectExam,
  submissions,
  students,
  onNavigateToScanner,
  onNavigateToStudents,
  onViewStudentReport,
}) => {
  // Filter submissions for current exam
  const examSubmissions = useMemo(() => {
    return submissions.filter((sub) => sub.examId === currentExam.id);
  }, [submissions, currentExam.id]);

  // Aggregate statistics
  const stats = useMemo(() => {
    const totalCount = examSubmissions.length;
    if (totalCount === 0) {
      return {
        avgScore: 0,
        maxScore: 0,
        minScore: 0,
        passCount: 0,
        passRate: 0,
        excellentCount: 0,
        scoreBuckets: [0, 0, 0, 0, 0, 0],
      };
    }

    const scores = examSubmissions.map((s) => s.scores.totalScore);
    const sum = scores.reduce((a, b) => a + b, 0);
    const avgScore = Number((sum / totalCount).toFixed(2));
    const maxScore = Math.max(...scores);
    const minScore = Math.min(...scores);
    const passCount = scores.filter((s) => s >= 5.0).length;
    const passRate = Math.round((passCount / totalCount) * 100);
    const excellentCount = scores.filter((s) => s >= 8.0).length;

    // Buckets: [0-3), [3-5), [5-6.5), [6.5-8), [8-9), [9-10]
    const scoreBuckets = [0, 0, 0, 0, 0, 0];
    scores.forEach((s) => {
      if (s < 3.0) scoreBuckets[0]++;
      else if (s < 5.0) scoreBuckets[1]++;
      else if (s < 6.5) scoreBuckets[2]++;
      else if (s < 8.0) scoreBuckets[3]++;
      else if (s < 9.0) scoreBuckets[4]++;
      else scoreBuckets[5]++;
    });

    return {
      avgScore,
      maxScore,
      minScore,
      passCount,
      passRate,
      excellentCount,
      scoreBuckets,
    };
  }, [examSubmissions]);

  // Aggregate Topic Competencies across all submissions
  const topicStats = useMemo(() => {
    const map: Record<string, { totalPossible: number; totalEarned: number; questionCount: number }> = {};

    examSubmissions.forEach((sub) => {
      Object.entries(sub.topicCompetencies || {}).forEach(([topic, comp]) => {
        if (!map[topic]) {
          map[topic] = { totalPossible: 0, totalEarned: 0, questionCount: 0 };
        }
        map[topic].totalPossible += comp.maxScore;
        map[topic].totalEarned += comp.scoreEarned;
        map[topic].questionCount += comp.totalQuestions;
      });
    });

    return Object.entries(map).map(([topic, data]) => {
      const percentage = data.totalPossible > 0 ? Math.round((data.totalEarned / data.totalPossible) * 100) : 0;
      return {
        topic,
        percentage,
        totalEarned: Number(data.totalEarned.toFixed(1)),
        totalPossible: Number(data.totalPossible.toFixed(1)),
        isWeak: percentage < 60,
      };
    }).sort((a, b) => b.percentage - a.percentage);
  }, [examSubmissions]);

  // Aggregate Cognitive Levels
  const levelStats = useMemo(() => {
    const levels: { key: CognitiveLevel; label: string; color: string; barColor: string; text: string }[] = [
      { key: 'recognition', label: 'Nhận biết', color: 'bg-emerald-500', barColor: 'bg-emerald-500', text: 'text-emerald-700' },
      { key: 'comprehension', label: 'Thông hiểu', color: 'bg-blue-500', barColor: 'bg-blue-500', text: 'text-blue-700' },
      { key: 'application', label: 'Vận dụng', color: 'bg-amber-500', barColor: 'bg-amber-500', text: 'text-amber-700' },
      { key: 'advanced_application', label: 'Vận dụng cao', color: 'bg-rose-500', barColor: 'bg-rose-500', text: 'text-rose-700' },
    ];

    return levels.map((lvl) => {
      let earned = 0;
      let possible = 0;
      examSubmissions.forEach((sub) => {
        const comp = sub.levelCompetencies ? (sub.levelCompetencies as Record<string, any>)[lvl.key] : null;
        if (comp) {
          earned += comp.scoreEarned;
          possible += comp.maxScore;
        }
      });

      const percentage = possible > 0 ? Math.round((earned / possible) * 100) : 0;
      return {
        ...lvl,
        percentage,
        earned: Number(earned.toFixed(1)),
        possible: Number(possible.toFixed(1)),
      };
    });
  }, [examSubmissions]);

  // Top Most Mistaken Questions
  const mistakenQuestions = useMemo(() => {
    const qMap: Record<number, { part: number; topic: string; totalAttempts: number; wrongCount: number }> = {};

    examSubmissions.forEach((sub) => {
      sub.questionResults.forEach((qr) => {
        const key = qr.part * 100 + qr.questionNumber;
        if (!qMap[key]) {
          qMap[key] = {
            part: qr.part,
            topic: qr.topic,
            totalAttempts: 0,
            wrongCount: 0,
          };
        }
        qMap[key].totalAttempts++;
        if (qr.isCorrect === false) {
          qMap[key].wrongCount++;
        } else if (qr.isCorrect === 'partial') {
          qMap[key].wrongCount += 0.5;
        }
      });
    });

    return Object.entries(qMap)
      .map(([key, data]) => {
        const keyNum = parseInt(key, 10);
        const part = Math.floor(keyNum / 100);
        const questionNumber = keyNum % 100;
        const wrongRate = data.totalAttempts > 0 ? Math.round((data.wrongCount / data.totalAttempts) * 100) : 0;

        return {
          part,
          questionNumber,
          topic: data.topic,
          wrongRate,
          wrongCount: Math.round(data.wrongCount),
          totalAttempts: data.totalAttempts,
        };
      })
      .sort((a, b) => b.wrongRate - a.wrongRate)
      .slice(0, 5);
  }, [examSubmissions]);

  const bucketLabels = ['< 3.0', '3.0 - 4.9', '5.0 - 6.4', '6.5 - 7.9', '8.0 - 8.9', '9.0 - 10'];

  return (
    <div className="space-y-6">
      {/* Top Banner & Exam Selector */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-lg border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-300" />
                Niên khóa {currentExam.academicYear}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                Lớp {students[0]?.className || '12A1'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white mb-1">
              {currentExam.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Cấu trúc đề chuẩn Bộ GD&ĐT: Thời gian {currentExam.durationMinutes} phút • Thang điểm {currentExam.totalScore}đ • Gồm 3 phần (Trắc nghiệm đơn, Đúng/Sai, Trả lời ngắn).
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center">
            <select
              value={currentExam.id}
              onChange={(e) => {
                const found = exams.find((x) => x.id === e.target.value);
                if (found) onSelectExam(found);
              }}
              className="bg-slate-800/90 text-white border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              {exams.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.subject} - {ex.title.slice(0, 32)}...
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={onNavigateToScanner}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-900/30 transition-all hover:scale-102"
            >
              <Camera className="w-4 h-4" />
              <span>Quét phiếu mới</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Graded Count */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Đã chấm thi</p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-slate-900">{examSubmissions.length}</span>
              <span className="text-xs text-slate-500 font-semibold">/ {students.length} học sinh</span>
            </div>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">
              {Math.round((examSubmissions.length / (students.length || 1)) * 100)}% sĩ số lớp
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Average Score */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Điểm trung bình lớp</p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-blue-600">{stats.avgScore}</span>
              <span className="text-xs text-slate-500 font-semibold">/ 10.0</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Cao nhất: <span className="font-bold text-emerald-600">{stats.maxScore}</span> | Thấp nhất: <span className="font-bold text-rose-600">{stats.minScore}</span>
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Pass Rate (>= 5.0) */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Tỷ lệ đạt chuẩn (≥ 5.0đ)</p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-emerald-600">{stats.passRate}%</span>
              <span className="text-xs text-slate-500 font-semibold">({stats.passCount} HS)</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Học sinh giỏi (≥ 8.0đ): <span className="font-bold text-blue-700">{stats.excellentCount} HS</span>
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Action / Roster Shortcut */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Báo cáo & Sổ điểm</p>
            <p className="text-sm font-bold text-slate-900 mt-1">Sổ điểm Lớp {students[0]?.className}</p>
            <button
              type="button"
              onClick={onNavigateToStudents}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5 mt-1"
            >
              <span>Xem bảng điểm chi tiết</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Analytics Grid: Phổ điểm & Ma trận Năng lực */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Phổ điểm lớp (Histogram) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <BarChart className="w-4 h-4 text-blue-600" />
                Phổ điểm thi trắc nghiệm của lớp
              </h2>
              <p className="text-xs text-slate-500">
                Phân bố điểm số theo các khoảng thang điểm chuẩn Bộ GD&ĐT
              </p>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {examSubmissions.length} bài thi
            </span>
          </div>

          {/* Histogram Bar Chart */}
          <div className="h-52 flex items-end justify-between gap-3 pt-6 pb-2 border-b border-slate-200">
            {stats.scoreBuckets.map((count, idx) => {
              const maxBucket = Math.max(...stats.scoreBuckets, 1);
              const heightPercent = Math.max((count / maxBucket) * 100, 6);
              const isExcellent = idx >= 4;
              const isFailing = idx === 0;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                  <span className="text-[11px] font-bold text-slate-700 group-hover:scale-110 transition-transform">
                    {count} <span className="text-[9px] text-slate-400 font-normal">HS</span>
                  </span>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-t-lg transition-all duration-500 ${
                      isFailing
                        ? 'bg-rose-400 group-hover:bg-rose-500'
                        : isExcellent
                        ? 'bg-emerald-500 group-hover:bg-emerald-600'
                        : 'bg-blue-500 group-hover:bg-blue-600'
                    }`}
                  ></div>
                </div>
              );
            })}
          </div>

          {/* Bucket labels */}
          <div className="flex justify-between gap-3 pt-2 text-[10px] font-semibold text-slate-600 text-center">
            {bucketLabels.map((lbl, idx) => (
              <div key={idx} className="flex-1">
                {lbl}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-6 mt-4 text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-xs bg-rose-400"></div>
              <span>Dưới 3.0 điểm (Yếu)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-xs bg-blue-500"></div>
              <span>3.0 - 7.9 điểm (Trung bình - Khá)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-xs bg-emerald-500"></div>
              <span>8.0 - 10 điểm (Giỏi - Xuất sắc)</span>
            </div>
          </div>
        </div>

        {/* Right Column: Ma trận 4 Cấp độ Nhận thức */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <BrainCircuit className="w-4 h-4 text-indigo-600" />
                  Mức độ Nhận thức chuẩn BGD
                </h2>
                <p className="text-xs text-slate-500">
                  Tỷ lệ nắm vững kiến thức theo 4 bậc tư duy
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {levelStats.map((lvl) => (
                <div key={lvl.key} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700">{lvl.label}</span>
                    <span className="font-black text-slate-900">{lvl.percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div
                      style={{ width: `${lvl.percentage}%` }}
                      className={`h-full rounded-full transition-all duration-500 ${lvl.barColor}`}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Tổng điểm lớp đạt: {lvl.earned}đ</span>
                    <span>Tối đa: {lvl.possible}đ</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-[11px] text-blue-900 leading-relaxed">
            <span className="font-bold">Nhận định sư phạm:</span> Lớp đạt tỷ lệ rất cao ở mức <span className="font-bold">Nhận biết & Thông hiểu</span> ({levelStats[0].percentage}% & {levelStats[1].percentage}%). Tuy nhiên mức <span className="font-bold text-rose-700">Vận dụng cao</span> chỉ đạt {levelStats[3].percentage}%, cần bổ sung chuyên đề bài tập thực tế.
          </div>
        </div>
      </div>

      {/* Competency by Topic & Mistaken Questions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Phân tích theo từng Chuyên đề / Chủ đề */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                Phân tích Năng lực theo Chủ đề Môn học
              </h2>
              <p className="text-xs text-slate-500">
                Độ chính xác và điểm số học sinh đạt được theo từng mảng kiến thức
              </p>
            </div>
          </div>

          <div className="space-y-3.5">
            {topicStats.map((item, idx) => (
              <div key={idx} className="p-3 rounded-xl border border-slate-200 bg-slate-50/40 hover:bg-white transition-colors">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-800">{item.topic}</span>
                    {item.isWeak && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200 flex items-center gap-0.5">
                        <AlertTriangle className="w-2.5 h-2.5" />
                        Cần bồi dưỡng
                      </span>
                    )}
                  </div>
                  <span className={`text-xs font-black ${item.percentage >= 75 ? 'text-emerald-700' : item.percentage >= 60 ? 'text-blue-700' : 'text-rose-700'}`}>
                    {item.percentage}%
                  </span>
                </div>

                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    style={{ width: `${item.percentage}%` }}
                    className={`h-full rounded-full ${
                      item.percentage >= 75 ? 'bg-emerald-500' : item.percentage >= 60 ? 'bg-blue-500' : 'bg-rose-500'
                    }`}
                  ></div>
                </div>

                <div className="flex justify-between items-center mt-1.5 text-[10px] text-slate-500">
                  <span>Điểm tích lũy toàn lớp: {item.totalEarned} / {item.totalPossible}đ</span>
                  <span className="font-medium text-slate-600">
                    {item.percentage >= 75 ? 'Nắm vững' : item.percentage >= 60 ? 'Khá' : 'Hổng kiến thức'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Top 5 Câu hỏi học sinh sai nhiều nhất */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Top 5 câu hỏi học sinh sai nhiều nhất
              </h2>
              <p className="text-xs text-slate-500">
                Trọng tâm để giáo viên chữa bài và rèn luyện trên lớp
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {mistakenQuestions.map((q, idx) => {
              const partName = q.part === 1 ? 'Phần I (Trắc nghiệm)' : q.part === 2 ? 'Phần II (Đúng/Sai)' : 'Phần III (Trả lời ngắn)';
              return (
                <div key={idx} className="p-3 rounded-xl border border-rose-100 bg-rose-50/40 flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-rose-600 text-white font-black text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-xs text-slate-900">
                        {partName} - Câu {q.questionNumber}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 pl-7 line-clamp-1">
                      {q.topic}
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-black text-rose-600">{q.wrongRate}%</div>
                    <div className="text-[10px] text-slate-500">
                      {q.wrongCount}/{q.totalAttempts} bài sai
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick List: Học sinh đạt điểm xuất sắc */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-800 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-500" />
                Top học sinh dẫn đầu lớp
              </span>
              <button
                type="button"
                onClick={onNavigateToStudents}
                className="text-blue-600 text-[11px] font-semibold hover:underline"
              >
                Xem tất cả
              </button>
            </h3>
            <div className="space-y-1.5">
              {examSubmissions
                .sort((a, b) => b.scores.totalScore - a.scores.totalScore)
                .slice(0, 3)
                .map((sub, i) => {
                  const rank = getGradeRank(sub.scores.totalScore);
                  return (
                    <div
                      key={sub.id}
                      onClick={() => onViewStudentReport(sub)}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-4 text-xs font-bold text-slate-400">#{i + 1}</span>
                        <span className="text-xs font-bold text-slate-900">{sub.studentName}</span>
                        <span className="text-[10px] text-slate-500">SBD: {sub.sbd}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-blue-700">{sub.scores.totalScore}đ</span>
                        <span className={`text-[10px] px-2 py-0.2 rounded-full font-bold border ${rank.badgeClass}`}>
                          {rank.rank}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
