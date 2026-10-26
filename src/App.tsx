/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
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
  
  // Persistent exams saved with customizable matrices and questions
  const [exams, setExams] = useState<Exam[]>(() => {
    try {
      const saved = localStorage.getItem('eduscan_saved_exams');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load exams from localStorage', e);
    }
    return SAMPLE_EXAMS;
  });

  const [currentExam, setCurrentExam] = useState<Exam>(() => exams[0] || SAMPLE_EXAMS[0]);

  // Sync exams to localStorage whenever updated
  useEffect(() => {
    try {
      localStorage.setItem('eduscan_saved_exams', JSON.stringify(exams));
    } catch (e) {
      console.warn('Failed to save exams to localStorage', e);
    }
  }, [exams]);

  // Persistent students roster saved from keyboard/batch before grading
  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem('eduscan_saved_students');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load students from localStorage', e);
    }
    return INITIAL_STUDENTS;
  });

  // Persistent exam submissions
  const [submissions, setSubmissions] = useState<ExamSubmission[]>(() => {
    try {
      const saved = localStorage.getItem('eduscan_saved_submissions');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load submissions from localStorage', e);
    }
    return createInitialSubmissions();
  });

  const [selectedReportSubmission, setSelectedReportSubmission] = useState<ExamSubmission | null>(null);

  // Sync students to localStorage whenever updated
  useEffect(() => {
    try {
      localStorage.setItem('eduscan_saved_students', JSON.stringify(students));
    } catch (e) {
      console.warn('Failed to save students to localStorage', e);
    }
  }, [students]);

  // Sync submissions to localStorage whenever updated
  useEffect(() => {
    try {
      localStorage.setItem('eduscan_saved_submissions', JSON.stringify(submissions));
    } catch (e) {
      console.warn('Failed to save submissions to localStorage', e);
    }
  }, [submissions]);

  // Add individual student from keyboard
  const handleAddStudent = (newStudent: Student) => {
    setStudents((prev) => [newStudent, ...prev]);
  };

  // Add batch students from keyboard / Excel paste
  const handleBatchAddStudents = (newStudents: Student[]) => {
    setStudents((prev) => {
      const existingKeys = new Set(
        prev.map((s) => `${s.sbd}-${s.className}-${s.academicYear}`)
      );
      const toAdd = newStudents.filter(
        (s) => !existingKeys.has(`${s.sbd}-${s.className}-${s.academicYear}`)
      );
      return [...toAdd, ...prev];
    });
  };

  // Delete single student
  const handleDeleteStudent = (studentId: string) => {
    const targetStudent = students.find((s) => s.id === studentId);
    setStudents((prev) => prev.filter((s) => s.id !== studentId));
    if (targetStudent) {
      setSubmissions((prev) =>
        prev.filter(
          (sub) =>
            !(
              sub.sbd === targetStudent.sbd &&
              sub.className === targetStudent.className &&
              sub.academicYear === targetStudent.academicYear
            )
        )
      );
    }
  };

  // Delete multiple students in batch
  const handleDeleteMultipleStudents = (studentIds: string[]) => {
    const idSet = new Set(studentIds);
    const targetStudents = students.filter((s) => idSet.has(s.id));
    const targetKeys = new Set(
      targetStudents.map((s) => `${s.sbd}-${s.className}-${s.academicYear}`)
    );

    setStudents((prev) => prev.filter((s) => !idSet.has(s.id)));
    setSubmissions((prev) =>
      prev.filter(
        (sub) => !targetKeys.has(`${sub.sbd}-${sub.className}-${sub.academicYear}`)
      )
    );
  };

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

    // If student isn't yet in roster, automatically add them to the roster!
    setStudents((prev) => {
      const exists = prev.some(
        (s) =>
          s.sbd === newSubmission.sbd &&
          s.className === newSubmission.className &&
          s.academicYear === newSubmission.academicYear
      );
      if (!exists) {
        const newStudent: Student = {
          id: `hs-${newSubmission.sbd}-${Date.now()}`,
          sbd: newSubmission.sbd,
          name: newSubmission.studentName,
          className: newSubmission.className || '12A1',
          academicYear: newSubmission.academicYear || currentExam.academicYear || '2024 - 2025',
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

  // Update existing exam (Matrix, general info, answer keys)
  const handleUpdateExam = (updatedExam: Exam) => {
    setExams((prev) => prev.map((ex) => (ex.id === updatedExam.id ? updatedExam : ex)));
    if (currentExam.id === updatedExam.id) {
      setCurrentExam(updatedExam);
    }
  };

  // Delete exam
  const handleDeleteExam = (examId: string) => {
    if (exams.length <= 1) {
      alert('Hệ thống cần lưu lại ít nhất 1 đề thi!');
      return;
    }
    setExams((prev) => prev.filter((ex) => ex.id !== examId));
    if (currentExam.id === examId) {
      const remaining = exams.filter((ex) => ex.id !== examId);
      if (remaining.length > 0) {
        setCurrentExam(remaining[0]);
      }
    }
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
            onNavigateToStudents={() => setActiveTab('students')}
            onAddStudent={handleAddStudent}
            onBatchAddStudents={handleBatchAddStudents}
          />
        )}

        {activeTab === 'exams' && (
          <ExamsManagerView
            exams={exams}
            currentExam={currentExam}
            onSelectExam={setCurrentExam}
            onCreateExam={handleCreateExam}
            onUpdateExam={handleUpdateExam}
            onDeleteExam={handleDeleteExam}
          />
        )}

        {activeTab === 'students' && (
          <StudentsGradebookView
            currentExam={currentExam}
            students={students}
            submissions={submissions}
            onAddStudent={handleAddStudent}
            onBatchAddStudents={handleBatchAddStudents}
            onDeleteStudent={handleDeleteStudent}
            onDeleteMultipleStudents={handleDeleteMultipleStudents}
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
            <span className="font-bold text-slate-700">EduScan</span> — Phần mềm Quét & Chấm Trắc Nghiệm Phiếu Mẫu Chuẩn Bộ GD&ĐT
          </p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Định dạng thi mới</span>
            <span>•</span>
            <span>Trắc nghiệm Đúng/Sai 4 mức</span>
            <span>•</span>
            <a
              href="/assets/aistudio/Phi_u_TNTL_2025_TNMaker_f1ed3d93.pdf"
              download="Phieu_Tra_Loi_Trac_Nghiem_2025_BGD.pdf"
              className="text-blue-600 hover:underline font-semibold"
            >
              Tải phiếu PDF mẫu A4
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
