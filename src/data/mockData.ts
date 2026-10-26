import { Exam, Student, ExamSubmission } from '../types/exam';
import { gradeExamSubmission } from '../utils/scoring';

export const INITIAL_STUDENTS: Student[] = [
  { id: 'hs-1', sbd: '010201', name: 'Nguyễn Văn An', className: '12A1', gender: 'Nam', dob: '15/03/2007', email: 'an.nv@edu.vn' },
  { id: 'hs-2', sbd: '010202', name: 'Trần Thị Bình', className: '12A1', gender: 'Nữ', dob: '22/07/2007', email: 'binh.tt@edu.vn' },
  { id: 'hs-3', sbd: '010203', name: 'Lê Hoàng Cường', className: '12A1', gender: 'Nam', dob: '04/11/2007', email: 'cuong.lh@edu.vn' },
  { id: 'hs-4', sbd: '010204', name: 'Phạm Minh Dũng', className: '12A1', gender: 'Nam', dob: '19/01/2007', email: 'dung.pm@edu.vn' },
  { id: 'hs-5', sbd: '010205', name: 'Vũ Hải Dương', className: '12A1', gender: 'Nam', dob: '12/08/2007', email: 'duong.vh@edu.vn' },
  { id: 'hs-6', sbd: '010206', name: 'Đỗ Quỳnh Giang', className: '12A1', gender: 'Nữ', dob: '30/05/2007', email: 'giang.dq@edu.vn' },
  { id: 'hs-7', sbd: '010207', name: 'Hoàng Quốc Hưng', className: '12A1', gender: 'Nam', dob: '17/09/2007', email: 'hung.hq@edu.vn' },
  { id: 'hs-8', sbd: '010208', name: 'Bùi Thu Hà', className: '12A1', gender: 'Nữ', dob: '08/02/2007', email: 'ha.bt@edu.vn' },
  { id: 'hs-9', sbd: '010209', name: 'Ngô Trọng Khang', className: '12A1', gender: 'Nam', dob: '25/06/2007', email: 'khang.nt@edu.vn' },
  { id: 'hs-10', sbd: '010210', name: 'Đặng Mai Lan', className: '12A1', gender: 'Nữ', dob: '14/12/2007', email: 'lan.dm@edu.vn' },
  { id: 'hs-11', sbd: '010211', name: 'Phan Gia Minh', className: '12A1', gender: 'Nam', dob: '03/04/2007', email: 'minh.pg@edu.vn' },
  { id: 'hs-12', sbd: '010212', name: 'Trịnh Bảo Ngọc', className: '12A1', gender: 'Nữ', dob: '29/10/2007', email: 'ngoc.tb@edu.vn' },
  { id: 'hs-13', sbd: '010213', name: 'Lương Tuấn Phong', className: '12A1', gender: 'Nam', dob: '11/05/2007', email: 'phong.lt@edu.vn' },
  { id: 'hs-14', sbd: '010214', name: 'Dương Thúy Quỳnh', className: '12A1', gender: 'Nữ', dob: '09/09/2007', email: 'quynh.dt@edu.vn' },
  { id: 'hs-15', sbd: '010215', name: 'Võ Minh Quân', className: '12A1', gender: 'Nam', dob: '21/01/2007', email: 'quan.vm@edu.vn' },
  { id: 'hs-16', sbd: '010216', name: 'Tạ Thanh Sơn', className: '12A1', gender: 'Nam', dob: '18/08/2007', email: 'son.tt@edu.vn' },
  { id: 'hs-17', sbd: '010217', name: 'Lâm Khánh Thi', className: '12A1', gender: 'Nữ', dob: '02/12/2007', email: 'thi.lk@edu.vn' },
  { id: 'hs-18', sbd: '010218', name: 'Nguyễn Đức Trọng', className: '12A1', gender: 'Nam', dob: '10/06/2007', email: 'trong.nd@edu.vn' },
  { id: 'hs-19', sbd: '010219', name: 'Đoàn Phương Uyên', className: '12A1', gender: 'Nữ', dob: '27/03/2007', email: 'uyen.dp@edu.vn' },
  { id: 'hs-20', sbd: '010220', name: 'Phùng Triệu Vy', className: '12A1', gender: 'Nữ', dob: '05/07/2007', email: 'vy.pt@edu.vn' },
  { id: 'hs-21', sbd: '010221', name: 'Bạch Đình Vũ', className: '12A1', gender: 'Nam', dob: '16/11/2007', email: 'vu.bd@edu.vn' },
  { id: 'hs-22', sbd: '010222', name: 'Hồ Cẩm Tú', className: '12A1', gender: 'Nữ', dob: '23/04/2007', email: 'tu.hc@edu.vn' },
  { id: 'hs-23', sbd: '010223', name: 'Mai Thế Vinh', className: '12A1', gender: 'Nam', dob: '13/02/2007', email: 'vinh.mt@edu.vn' },
  { id: 'hs-24', sbd: '010224', name: 'Đinh Hồng Xuân', className: '12A1', gender: 'Nữ', dob: '01/09/2007', email: 'xuan.dh@edu.vn' },
  { id: 'hs-25', sbd: '010225', name: 'Chu Khải Yên', className: '12A1', gender: 'Nam', dob: '19/10/2007', email: 'yen.ck@edu.vn' },
];

export const SAMPLE_EXAMS: Exam[] = [
  {
    id: 'exam-toan-2025',
    title: 'Khảo sát Năng lực Môn Toán - Chuẩn Cấu trúc BGD 2025',
    subject: 'Toán học',
    grade: 12,
    academicYear: '2024 - 2025',
    durationMinutes: 90,
    totalScore: 10.0,
    codes: ['101', '102'],
    scoringRuleDescription: 'Phần I: 12 câu trắc nghiệm (0.25đ/câu = 3.0đ). Phần II: 4 câu Đúng/Sai (1.0đ/câu = 4.0đ, theo thang 0.1 - 0.25 - 0.5 - 1.0). Phần III: 6 câu trả lời ngắn (0.5đ/câu = 3.0đ).',
    matrix: [
      { topic: 'Đạo hàm & Ứng dụng khảo sát hàm số', recognitionCount: 4, comprehensionCount: 3, applicationCount: 2, advancedCount: 1, totalScore: 3.5 },
      { topic: 'Toạ độ trong không gian Oxyz', recognitionCount: 3, comprehensionCount: 2, applicationCount: 2, advancedCount: 1, totalScore: 2.75 },
      { topic: 'Xác suất có điều kiện & Thống kê', recognitionCount: 2, comprehensionCount: 2, applicationCount: 1, advancedCount: 1, totalScore: 2.0 },
      { topic: 'Nguyên hàm & Tích phân thực tế', recognitionCount: 2, comprehensionCount: 1, applicationCount: 1, advancedCount: 0, totalScore: 1.75 },
    ],
    questionsByCode: {
      '101': [
        // PHẦN I: 12 câu đơn (0.25đ / câu)
        { number: 1, part: 1, topic: 'Đạo hàm & Ứng dụng khảo sát hàm số', cognitiveLevel: 'recognition', maxScore: 0.25, correctAnswer: 'A' },
        { number: 2, part: 1, topic: 'Đạo hàm & Ứng dụng khảo sát hàm số', cognitiveLevel: 'recognition', maxScore: 0.25, correctAnswer: 'B' },
        { number: 3, part: 1, topic: 'Toạ độ trong không gian Oxyz', cognitiveLevel: 'recognition', maxScore: 0.25, correctAnswer: 'C' },
        { number: 4, part: 1, topic: 'Toạ độ trong không gian Oxyz', cognitiveLevel: 'recognition', maxScore: 0.25, correctAnswer: 'D' },
        { number: 5, part: 1, topic: 'Xác suất có điều kiện & Thống kê', cognitiveLevel: 'recognition', maxScore: 0.25, correctAnswer: 'B' },
        { number: 6, part: 1, topic: 'Nguyên hàm & Tích phân thực tế', cognitiveLevel: 'recognition', maxScore: 0.25, correctAnswer: 'A' },
        { number: 7, part: 1, topic: 'Đạo hàm & Ứng dụng khảo sát hàm số', cognitiveLevel: 'comprehension', maxScore: 0.25, correctAnswer: 'C' },
        { number: 8, part: 1, topic: 'Đạo hàm & Ứng dụng khảo sát hàm số', cognitiveLevel: 'comprehension', maxScore: 0.25, correctAnswer: 'D' },
        { number: 9, part: 1, topic: 'Toạ độ trong không gian Oxyz', cognitiveLevel: 'comprehension', maxScore: 0.25, correctAnswer: 'A' },
        { number: 10, part: 1, topic: 'Xác suất có điều kiện & Thống kê', cognitiveLevel: 'comprehension', maxScore: 0.25, correctAnswer: 'C' },
        { number: 11, part: 1, topic: 'Nguyên hàm & Tích phân thực tế', cognitiveLevel: 'comprehension', maxScore: 0.25, correctAnswer: 'B' },
        { number: 12, part: 1, topic: 'Toạ độ trong không gian Oxyz', cognitiveLevel: 'comprehension', maxScore: 0.25, correctAnswer: 'D' },

        // PHẦN II: 4 câu Đúng/Sai (1.0đ / câu)
        {
          number: 1,
          part: 2,
          topic: 'Đạo hàm & Ứng dụng khảo sát hàm số',
          cognitiveLevel: 'application',
          maxScore: 1.0,
          correctAnswer: { a: true, b: false, c: true, d: false },
        },
        {
          number: 2,
          part: 2,
          topic: 'Toạ độ trong không gian Oxyz',
          cognitiveLevel: 'application',
          maxScore: 1.0,
          correctAnswer: { a: false, b: true, c: true, d: false },
        },
        {
          number: 3,
          part: 2,
          topic: 'Xác suất có điều kiện & Thống kê',
          cognitiveLevel: 'application',
          maxScore: 1.0,
          correctAnswer: { a: true, b: true, c: false, d: true },
        },
        {
          number: 4,
          part: 2,
          topic: 'Đạo hàm & Ứng dụng khảo sát hàm số',
          cognitiveLevel: 'advanced_application',
          maxScore: 1.0,
          correctAnswer: { a: false, b: false, c: true, d: true },
        },

        // PHẦN III: 6 câu trả lời ngắn (0.5đ / câu)
        { number: 1, part: 3, topic: 'Đạo hàm & Ứng dụng khảo sát hàm số', cognitiveLevel: 'comprehension', maxScore: 0.5, correctAnswer: '12' },
        { number: 2, part: 3, topic: 'Toạ độ trong không gian Oxyz', cognitiveLevel: 'application', maxScore: 0.5, correctAnswer: '4.5' },
        { number: 3, part: 3, topic: 'Xác suất có điều kiện & Thống kê', cognitiveLevel: 'application', maxScore: 0.5, correctAnswer: '0.75' },
        { number: 4, part: 3, topic: 'Nguyên hàm & Tích phân thực tế', cognitiveLevel: 'application', maxScore: 0.5, correctAnswer: '125' },
        { number: 5, part: 3, topic: 'Toạ độ trong không gian Oxyz', cognitiveLevel: 'advanced_application', maxScore: 0.5, correctAnswer: '-2.4' },
        { number: 6, part: 3, topic: 'Đạo hàm & Ứng dụng khảo sát hàm số', cognitiveLevel: 'advanced_application', maxScore: 0.5, correctAnswer: '36' },
      ],
      '102': [
        { number: 1, part: 1, topic: 'Đạo hàm & Ứng dụng khảo sát hàm số', cognitiveLevel: 'recognition', maxScore: 0.25, correctAnswer: 'C' },
        { number: 2, part: 1, topic: 'Đạo hàm & Ứng dụng khảo sát hàm số', cognitiveLevel: 'recognition', maxScore: 0.25, correctAnswer: 'A' },
        { number: 3, part: 1, topic: 'Toạ độ trong không gian Oxyz', cognitiveLevel: 'recognition', maxScore: 0.25, correctAnswer: 'D' },
        { number: 4, part: 1, topic: 'Toạ độ trong không gian Oxyz', cognitiveLevel: 'recognition', maxScore: 0.25, correctAnswer: 'B' },
        { number: 5, part: 1, topic: 'Xác suất có điều kiện & Thống kê', cognitiveLevel: 'recognition', maxScore: 0.25, correctAnswer: 'A' },
        { number: 6, part: 1, topic: 'Nguyên hàm & Tích phân thực tế', cognitiveLevel: 'recognition', maxScore: 0.25, correctAnswer: 'C' },
        { number: 7, part: 1, topic: 'Đạo hàm & Ứng dụng khảo sát hàm số', cognitiveLevel: 'comprehension', maxScore: 0.25, correctAnswer: 'B' },
        { number: 8, part: 1, topic: 'Đạo hàm & Ứng dụng khảo sát hàm số', cognitiveLevel: 'comprehension', maxScore: 0.25, correctAnswer: 'A' },
        { number: 9, part: 1, topic: 'Toạ độ trong không gian Oxyz', cognitiveLevel: 'comprehension', maxScore: 0.25, correctAnswer: 'C' },
        { number: 10, part: 1, topic: 'Xác suất có điều kiện & Thống kê', cognitiveLevel: 'comprehension', maxScore: 0.25, correctAnswer: 'D' },
        { number: 11, part: 1, topic: 'Nguyên hàm & Tích phân thực tế', cognitiveLevel: 'comprehension', maxScore: 0.25, correctAnswer: 'A' },
        { number: 12, part: 1, topic: 'Toạ độ trong không gian Oxyz', cognitiveLevel: 'comprehension', maxScore: 0.25, correctAnswer: 'C' },

        {
          number: 1,
          part: 2,
          topic: 'Toạ độ trong không gian Oxyz',
          cognitiveLevel: 'application',
          maxScore: 1.0,
          correctAnswer: { a: true, b: true, c: false, d: false },
        },
        {
          number: 2,
          part: 2,
          topic: 'Đạo hàm & Ứng dụng khảo sát hàm số',
          cognitiveLevel: 'application',
          maxScore: 1.0,
          correctAnswer: { a: false, b: true, c: false, d: true },
        },
        {
          number: 3,
          part: 2,
          topic: 'Xác suất có điều kiện & Thống kê',
          cognitiveLevel: 'application',
          maxScore: 1.0,
          correctAnswer: { a: true, b: false, c: true, d: true },
        },
        {
          number: 4,
          part: 2,
          topic: 'Đạo hàm & Ứng dụng khảo sát hàm số',
          cognitiveLevel: 'advanced_application',
          maxScore: 1.0,
          correctAnswer: { a: true, b: false, c: false, d: true },
        },

        { number: 1, part: 3, topic: 'Đạo hàm & Ứng dụng khảo sát hàm số', cognitiveLevel: 'comprehension', maxScore: 0.5, correctAnswer: '18' },
        { number: 2, part: 3, topic: 'Toạ độ trong không gian Oxyz', cognitiveLevel: 'application', maxScore: 0.5, correctAnswer: '-3.5' },
        { number: 3, part: 3, topic: 'Xác suất có điều kiện & Thống kê', cognitiveLevel: 'application', maxScore: 0.5, correctAnswer: '0.45' },
        { number: 4, part: 3, topic: 'Nguyên hàm & Tích phân thực tế', cognitiveLevel: 'application', maxScore: 0.5, correctAnswer: '80' },
        { number: 5, part: 3, topic: 'Toạ độ trong không gian Oxyz', cognitiveLevel: 'advanced_application', maxScore: 0.5, correctAnswer: '6.25' },
        { number: 6, part: 3, topic: 'Đạo hàm & Ứng dụng khảo sát hàm số', cognitiveLevel: 'advanced_application', maxScore: 0.5, correctAnswer: '-14' },
      ],
    },
  },
  {
    id: 'exam-vatly-2025',
    title: 'Đề Thi Thử Tốt Nghiệp THPT - Môn Vật Lí 2025',
    subject: 'Vật lí',
    grade: 12,
    academicYear: '2024 - 2025',
    durationMinutes: 50,
    totalScore: 10.0,
    codes: ['201'],
    scoringRuleDescription: 'Phần I: 18 câu trắc nghiệm (0.25đ/câu = 4.5đ). Phần II: 4 câu Đúng/Sai (1.0đ/câu = 4.0đ). Phần III: 6 câu trả lời ngắn (0.25đ/câu = 1.5đ).',
    matrix: [
      { topic: 'Vật lí nhiệt & Khí lý tưởng', recognitionCount: 6, comprehensionCount: 4, applicationCount: 2, advancedCount: 1, totalScore: 4.5 },
      { topic: 'Từ trường & Cảm ứng điện từ', recognitionCount: 5, comprehensionCount: 3, applicationCount: 2, advancedCount: 1, totalScore: 3.5 },
      { topic: 'Vật lí hạt nhân & Phóng xạ', recognitionCount: 3, comprehensionCount: 2, applicationCount: 1, advancedCount: 1, totalScore: 2.0 },
    ],
    questionsByCode: {
      '201': [
        { number: 1, part: 1, topic: 'Vật lí nhiệt & Khí lý tưởng', cognitiveLevel: 'recognition', maxScore: 0.25, correctAnswer: 'A' },
        { number: 2, part: 1, topic: 'Vật lí nhiệt & Khí lý tưởng', cognitiveLevel: 'recognition', maxScore: 0.25, correctAnswer: 'C' },
        { number: 3, part: 1, topic: 'Từ trường & Cảm ứng điện từ', cognitiveLevel: 'recognition', maxScore: 0.25, correctAnswer: 'B' },
        { number: 4, part: 1, topic: 'Từ trường & Cảm ứng điện từ', cognitiveLevel: 'recognition', maxScore: 0.25, correctAnswer: 'D' },
        { number: 5, part: 1, topic: 'Vật lí hạt nhân & Phóng xạ', cognitiveLevel: 'recognition', maxScore: 0.25, correctAnswer: 'A' },
        { number: 6, part: 1, topic: 'Vật lí nhiệt & Khí lý tưởng', cognitiveLevel: 'comprehension', maxScore: 0.25, correctAnswer: 'B' },
        { number: 7, part: 1, topic: 'Từ trường & Cảm ứng điện từ', cognitiveLevel: 'comprehension', maxScore: 0.25, correctAnswer: 'C' },
        { number: 8, part: 1, topic: 'Vật lí hạt nhân & Phóng xạ', cognitiveLevel: 'comprehension', maxScore: 0.25, correctAnswer: 'A' },
        {
          number: 1,
          part: 2,
          topic: 'Vật lí nhiệt & Khí lý tưởng',
          cognitiveLevel: 'application',
          maxScore: 1.0,
          correctAnswer: { a: true, b: false, c: true, d: true },
        },
        {
          number: 2,
          part: 2,
          topic: 'Từ trường & Cảm ứng điện từ',
          cognitiveLevel: 'application',
          maxScore: 1.0,
          correctAnswer: { a: false, b: true, c: false, d: true },
        },
        { number: 1, part: 3, topic: 'Vật lí nhiệt & Khí lý tưởng', cognitiveLevel: 'application', maxScore: 0.5, correctAnswer: '300' },
        { number: 2, part: 3, topic: 'Từ trường & Cảm ứng điện từ', cognitiveLevel: 'advanced_application', maxScore: 0.5, correctAnswer: '0.04' },
      ],
    },
  },
];

// Pre-generate 16 realistic submissions for 12A1 students so the teacher has instant analytics
export function createInitialSubmissions(): ExamSubmission[] {
  const exam = SAMPLE_EXAMS[0];
  const questions101 = exam.questionsByCode['101'];
  const questions102 = exam.questionsByCode['102'];

  const submissions: ExamSubmission[] = [];

  const studentScoreProfiles = [
    { sbd: '010201', code: '101', skill: 0.95 }, // Nguyễn Văn An
    { sbd: '010202', code: '101', skill: 0.88 }, // Trần Thị Bình
    { sbd: '010203', code: '102', skill: 0.72 }, // Lê Hoàng Cường
    { sbd: '010204', code: '101', skill: 0.65 }, // Phạm Minh Dũng
    { sbd: '010205', code: '102', skill: 0.45 }, // Vũ Hải Dương
    { sbd: '010206', code: '101', skill: 0.92 }, // Đỗ Quỳnh Giang
    { sbd: '010207', code: '102', skill: 0.82 }, // Hoàng Quốc Hưng
    { sbd: '010208', code: '101', skill: 0.78 }, // Bùi Thu Hà
    { sbd: '010209', code: '102', skill: 0.58 }, // Ngô Trọng Khang
    { sbd: '010210', code: '101', skill: 0.85 }, // Đặng Mai Lan
    { sbd: '010211', code: '102', skill: 0.94 }, // Phan Gia Minh
    { sbd: '010212', code: '101', skill: 0.70 }, // Trịnh Bảo Ngọc
    { sbd: '010213', code: '102', skill: 0.52 }, // Lương Tuấn Phong
    { sbd: '010214', code: '101', skill: 0.89 }, // Dương Thúy Quỳnh
    { sbd: '010215', code: '102', skill: 0.62 }, // Võ Minh Quân
    { sbd: '010216', code: '101', skill: 0.40 }, // Tạ Thanh Sơn
  ];

  studentScoreProfiles.forEach((profile, idx) => {
    const student = INITIAL_STUDENTS.find((s) => s.sbd === profile.sbd);
    if (!student) return;

    const questions = profile.code === '101' ? questions101 : questions102;
    const rawAnswers: any = {
      part1: {},
      part2: {},
      part3: {},
    };

    questions.forEach((q) => {
      const isLucky = Math.random() < profile.skill;
      if (q.part === 1) {
        if (isLucky) {
          rawAnswers.part1[q.number] = q.correctAnswer;
        } else {
          const opts: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];
          const wrongs = opts.filter((o) => o !== q.correctAnswer);
          rawAnswers.part1[q.number] = wrongs[Math.floor(Math.random() * wrongs.length)];
        }
      } else if (q.part === 2) {
        const ca = q.correctAnswer;
        rawAnswers.part2[q.number] = {
          a: Math.random() < profile.skill ? ca.a : !ca.a,
          b: Math.random() < profile.skill ? ca.b : !ca.b,
          c: Math.random() < profile.skill ? ca.c : !ca.c,
          d: Math.random() < profile.skill ? ca.d : !ca.d,
        };
      } else if (q.part === 3) {
        if (isLucky) {
          rawAnswers.part3[q.number] = q.correctAnswer;
        } else {
          rawAnswers.part3[q.number] = Math.random() > 0.5 ? '0' : null;
        }
      }
    });

    const grading = gradeExamSubmission(questions, rawAnswers);

    submissions.push({
      id: `sub-${profile.sbd}`,
      examId: exam.id,
      examTitle: exam.title,
      sbd: student.sbd,
      examCode: profile.code,
      studentName: student.name,
      className: student.className,
      scannedAt: `26/10/2026 ${8 + Math.floor(idx / 4)}:${10 + (idx % 4) * 12}`,
      imagePreviewUrl: '/assets/aistudio/Phi_u_TNTL_2025_TNMaker_f1ed3d93.pdf',
      rawAnswers,
      scores: grading.scores,
      questionResults: grading.questionResults,
      topicCompetencies: grading.topicCompetencies,
      levelCompetencies: grading.levelCompetencies,
      scanNotes: [
        'Nhận diện mã đề và số báo danh tự động thành công (độ tin cậy 99.2%).',
        'Tất cả các ô tô chuẩn vạch căn chỉnh BGD.',
      ],
      aiPedagogicalAdvice: `Học sinh ${student.name} có điểm mạnh ở phần nhận biết và thông hiểu (${grading.levelCompetencies.recognition.percentage}% và ${grading.levelCompetencies.comprehension.percentage}%). Cần rèn luyện thêm kỹ năng xử lý dạng câu hỏi trắc nghiệm Đúng/Sai ở chuyên đề hình học Oxyz và các bài toán thực tế tích phân.`,
    });
  });

  return submissions;
}
