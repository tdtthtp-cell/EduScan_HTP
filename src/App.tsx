/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { ScannerView } from './components/ScannerView';
import { ExamsManagerView } from './components/ExamsManagerView';
import { StudentsGradebookView } from './components/StudentsGradebookView';
import { OnlineTestView } from './components/OnlineTestView';
import { StudentDetailReportModal } from './components/StudentDetailReportModal';
import { Exam, Student, ExamSubmission } from './types/exam';
import { SAMPLE_EXAMS, INITIAL_STUDENTS, createInitialSubmissions } from './data/mockData';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [exams, setExams] = useState<Exam[]>(SAMPLE_EXAMS);
  const [currentExam, setCurrentExam] = useState<Exam>(SAMPLE_EXAMS[0]);
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [submissions, setSubmissions] = useState<ExamSubmission[]>(createInitialSubmissions());
  const [selectedReportSubmission, setSelectedReportSubmission] = useState<ExamSubmission | null>(null);

  // Save or update an exam submission (e.g. from Scanner or Online Test)
  const handleSaveSubmission = (newSubmission: ExamSubmission) => {
    setSubmissions((prev) => {
      const existingIdx = prev.findIndex(
        (s) => s.examId === newSubmission.examId && s.sbd === newSubmission.sbd
      );
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = newSubmission;
        return copy;
      }
      return [newSubmission, ...prev];
    });

    // If student isn't yet in roster, automatically add them!
    setStudents((prev) => {
      const exists = prev.some((s) => s.sbd === newSubmission.sbd);
      if (!exists) {
        const newStudent: Student = {
          id: `hs-${newSubmission.sbd}`,
          sbd: newSubmission.sbd,
          name: newSubmission.studentName,
          className: newSubmission.className || '12A1',
          gender: 'Nam',
          dob: '01/01/2007',
        };
        return [...prev, newStudent];
      }
      return prev;
    });
  };

  // Add new exam
  const handleCreateExam = (newExam: Exam) => {
    setExams((prev) => [newExam, ...prev]);
    setCurrentExam(newExam);
  };

  const gradedForCurrentExam = submissions.filter((s) => s.examId === currentExam.id).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        examCount={exams.length}
        gradedCount={gradedForCurrentExam}
        totalStudents={students.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            currentExam={currentExam}
            exams={exams}
            onSelectExam={setCurrentExam}
            submissions={submissions}
            students={students}
            onNavigateToScanner={() => setActiveTab('scanner')}
            onNavigateToStudents={() => setActiveTab('students')}
            onViewStudentReport={(sub) => setSelectedReportSubmission(sub)}
          />
        )}

        {activeTab === 'scanner' && (
          <ScannerView
            currentExam={currentExam}
            students={students}
            onSaveSubmission={handleSaveSubmission}
            onViewStudentReport={(sub) => setSelectedReportSubmission(sub)}
          />
        )}

        {activeTab === 'exams' && (
          <ExamsManagerView
            exams={exams}
            currentExam={currentExam}
            onSelectExam={setCurrentExam}
            onCreateExam={handleCreateExam}
          />
        )}

        {activeTab === 'students' && (
          <StudentsGradebookView
            currentExam={currentExam}
            students={students}
            submissions={submissions}
            onViewStudentReport={(sub) => setSelectedReportSubmission(sub)}
            onNavigateToScanner={() => setActiveTab('scanner')}
          />
        )}

        {activeTab === 'online-test' && (
          <OnlineTestView
            currentExam={currentExam}
            students={students}
            onSaveSubmission={handleSaveSubmission}
            onViewStudentReport={(sub) => setSelectedReportSubmission(sub)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            <span className="font-bold text-slate-700">EduScan 2025</span> — Phần mềm Quét & Chấm Trắc Nghiệm Phiếu Mẫu Chuẩn Bộ GD&ĐT
          </p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Định dạng thi mới 2025</span>
            <span>•</span>
            <span>Trắc nghiệm Đúng/Sai 4 mức</span>
            <span>•</span>
            <a
              href="/assets/aistudio/Phi_u_TNTL_2025_TNMaker_f1ed3d93.pdf"
              download
              className="text-blue-600 hover:underline font-semibold"
            >
              Tải phiếu PDF mẫu
            </a>
          </div>
        </div>
      </footer>

      {/* Modal: Detailed Student Grade Report */}
      <StudentDetailReportModal
        submission={selectedReportSubmission}
        onClose={() => setSelectedReportSubmission(null)}
      />
    </div>
  );
}
