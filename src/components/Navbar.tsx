import React from 'react';
import { 
  BarChart3, 
  Camera, 
  BookOpen, 
  Users, 
  FileDown, 
  PenTool, 
  Award,
  Sparkles
} from 'lucide-react';

export type ActiveTab = 'dashboard' | 'scanner' | 'exams' | 'students' | 'online-test';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  examCount: number;
  gradedCount: number;
  totalStudents: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  examCount,
  gradedCount,
  totalStudents,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & App Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-rose-600 flex items-center justify-center text-white shadow-md shadow-indigo-100 ring-2 ring-blue-100">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 tracking-tight text-lg">
                  EduScan <span className="text-blue-600">2025</span>
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                  Chuẩn BGD&ĐT
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Hệ thống chấm trắc nghiệm & phân tích ma trận năng lực
              </p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-blue-50 text-blue-700 shadow-xs ring-1 ring-blue-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden md:inline">Tổng quan & Phân tích</span>
              <span className="md:hidden">Tổng quan</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('scanner')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'scanner'
                  ? 'bg-rose-50 text-rose-700 shadow-xs ring-1 ring-rose-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Camera className="w-4 h-4 text-rose-600" />
              <span className="font-bold">Quét ảnh chấm thi</span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('exams')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'exams'
                  ? 'bg-blue-50 text-blue-700 shadow-xs ring-1 ring-blue-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden md:inline">Đề thi & Ma trận</span>
              <span className="md:hidden">Đề thi</span>
              <span className="ml-0.5 px-1.5 py-0.2 bg-slate-200 text-slate-700 text-[10px] rounded-full font-bold">
                {examCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('students')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'students'
                  ? 'bg-blue-50 text-blue-700 shadow-xs ring-1 ring-blue-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Users className="w-4 h-4" />
              <span className="hidden md:inline">Sổ điểm lớp</span>
              <span className="md:hidden">Sổ điểm</span>
              <span className="ml-0.5 px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[10px] rounded-full font-bold">
                {gradedCount}/{totalStudents}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('online-test')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'online-test'
                  ? 'bg-amber-50 text-amber-700 shadow-xs ring-1 ring-amber-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <PenTool className="w-4 h-4" />
              <span className="hidden md:inline">Thi trực tuyến</span>
              <span className="md:hidden">Thi online</span>
            </button>
          </nav>

          {/* Quick Download Official PDF */}
          <div className="hidden lg:flex items-center gap-2">
            <a
              href="/assets/aistudio/Phi_u_TNTL_2025_TNMaker_f1ed3d93.pdf"
              download="Phieu_Tra_Loi_Trac_Nghiem_2025_BGD.pdf"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition-colors shadow-2xs"
            >
              <FileDown className="w-3.5 h-3.5 text-blue-600" />
              <span>Tải Phiếu Mẫu 2025 (PDF)</span>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};
