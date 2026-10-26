import { CognitiveLevel, ExamQuestion, QuestionGradeResult, TopicCompetencyResult, LevelCompetencyResult, QuestionPart1Config, QuestionPart2Config, QuestionPart3Config } from '../types/exam';

/**
 * Standard BGD 2025 Scoring Calculation
 * Part II Rule:
 * - 1 sub-item correct: 0.10 pt
 * - 2 sub-items correct: 0.25 pt
 * - 3 sub-items correct: 0.50 pt
 * - 4 sub-items correct: 1.00 pt
 * - 0 correct: 0.00 pt
 */
export function calculatePart2Score(
  studentAnswer: { a?: boolean | null; b?: boolean | null; c?: boolean | null; d?: boolean | null },
  correctAnswer: { a: boolean; b: boolean; c: boolean; d: boolean },
  maxScore = 1.0
): { score: number; correctItemsCount: number; details: string } {
  let correctItemsCount = 0;
  const keys: ('a' | 'b' | 'c' | 'd')[] = ['a', 'b', 'c', 'd'];

  keys.forEach((key) => {
    if (studentAnswer && studentAnswer[key] !== null && studentAnswer[key] !== undefined) {
      if (studentAnswer[key] === correctAnswer[key]) {
        correctItemsCount++;
      }
    }
  });

  let score = 0;
  if (correctItemsCount === 1) score = 0.1;
  else if (correctItemsCount === 2) score = 0.25;
  else if (correctItemsCount === 3) score = 0.5;
  else if (correctItemsCount === 4) score = 1.0;

  // Scale if maxScore is customized
  const scaledScore = Number(((score / 1.0) * maxScore).toFixed(2));

  return {
    score: scaledScore,
    correctItemsCount,
    details: `Đúng ${correctItemsCount}/4 ý (${scaledScore}đ)`,
  };
}

/**
 * Normalize short answer string:
 * - replace comma with period (e.g. "12,5" -> "12.5")
 * - trim whitespace
 * - compare numeric values if both valid numbers, or exact trimmed string
 */
export function isPart3AnswerCorrect(studentVal: string | null | undefined, correctVal: string): boolean {
  if (!studentVal || typeof studentVal !== 'string') return false;

  const cleanStudent = studentVal.trim().replace(/,/g, '.').replace(/\s+/g, '');
  const cleanCorrect = correctVal.trim().replace(/,/g, '.').replace(/\s+/g, '');

  if (cleanStudent === cleanCorrect) return true;

  const numStudent = parseFloat(cleanStudent);
  const numCorrect = parseFloat(cleanCorrect);

  if (!isNaN(numStudent) && !isNaN(numCorrect)) {
    return Math.abs(numStudent - numCorrect) < 0.001;
  }

  return cleanStudent.toLowerCase() === cleanCorrect.toLowerCase();
}

export function gradeExamSubmission(
  questions: ExamQuestion[],
  rawAnswers: {
    part1: Record<number, 'A' | 'B' | 'C' | 'D' | null>;
    part2: Record<number, { a?: boolean | null; b?: boolean | null; c?: boolean | null; d?: boolean | null }>;
    part3: Record<number, string | null>;
  }
) {
  let part1Score = 0;
  let part2Score = 0;
  let part3Score = 0;

  const questionResults: QuestionGradeResult[] = [];
  const topicMap: Record<string, { total: number; correct: number; earned: number; max: number }> = {};
  const levelMap: Record<CognitiveLevel, { total: number; correct: number; earned: number; max: number }> = {
    recognition: { total: 0, correct: 0, earned: 0, max: 0 },
    comprehension: { total: 0, correct: 0, earned: 0, max: 0 },
    application: { total: 0, correct: 0, earned: 0, max: 0 },
    advanced_application: { total: 0, correct: 0, earned: 0, max: 0 },
  };

  questions.forEach((q) => {
    // Init topic if not present
    if (!topicMap[q.topic]) {
      topicMap[q.topic] = { total: 0, correct: 0, earned: 0, max: 0 };
    }

    topicMap[q.topic].total += 1;
    topicMap[q.topic].max += q.maxScore;

    levelMap[q.cognitiveLevel].total += 1;
    levelMap[q.cognitiveLevel].max += q.maxScore;

    if (q.part === 1) {
      const q1 = q as QuestionPart1Config;
      const studentAns = rawAnswers.part1?.[q.number] || null;
      const isCorrect = studentAns === q1.correctAnswer;
      const score = isCorrect ? q1.maxScore : 0;
      part1Score += score;

      if (isCorrect) {
        topicMap[q.topic].correct += 1;
        levelMap[q.cognitiveLevel].correct += 1;
      }
      topicMap[q.topic].earned += score;
      levelMap[q.cognitiveLevel].earned += score;

      questionResults.push({
        questionNumber: q.number,
        part: 1,
        topic: q.topic,
        cognitiveLevel: q.cognitiveLevel,
        studentAnswer: studentAns,
        correctAnswer: q1.correctAnswer,
        scoreEarned: score,
        maxScore: q1.maxScore,
        isCorrect: isCorrect,
        details: isCorrect ? 'Đúng' : studentAns ? `Sai (chọn ${studentAns})` : 'Chưa tô',
      });
    } else if (q.part === 2) {
      const q2 = q as QuestionPart2Config;
      const studentAns = rawAnswers.part2?.[q.number] || {};
      const { score, correctItemsCount, details } = calculatePart2Score(studentAns, q2.correctAnswer, q2.maxScore);
      part2Score += score;

      const isFullyCorrect = correctItemsCount === 4;
      const isPartial = correctItemsCount > 0 && correctItemsCount < 4;

      if (isFullyCorrect) {
        topicMap[q.topic].correct += 1;
        levelMap[q.cognitiveLevel].correct += 1;
      } else if (isPartial) {
        topicMap[q.topic].correct += correctItemsCount / 4;
        levelMap[q.cognitiveLevel].correct += correctItemsCount / 4;
      }
      topicMap[q.topic].earned += score;
      levelMap[q.cognitiveLevel].earned += score;

      questionResults.push({
        questionNumber: q.number,
        part: 2,
        topic: q.topic,
        cognitiveLevel: q.cognitiveLevel,
        studentAnswer: studentAns,
        correctAnswer: q2.correctAnswer,
        scoreEarned: score,
        maxScore: q2.maxScore,
        isCorrect: isFullyCorrect ? true : isPartial ? 'partial' : false,
        details,
      });
    } else if (q.part === 3) {
      const q3 = q as QuestionPart3Config;
      const studentAns = rawAnswers.part3?.[q.number] || null;
      const isCorrect = isPart3AnswerCorrect(studentAns, q3.correctAnswer);
      const score = isCorrect ? q3.maxScore : 0;
      part3Score += score;

      if (isCorrect) {
        topicMap[q.topic].correct += 1;
        levelMap[q.cognitiveLevel].correct += 1;
      }
      topicMap[q.topic].earned += score;
      levelMap[q.cognitiveLevel].earned += score;

      questionResults.push({
        questionNumber: q.number,
        part: 3,
        topic: q.topic,
        cognitiveLevel: q.cognitiveLevel,
        studentAnswer: studentAns,
        correctAnswer: q3.correctAnswer,
        scoreEarned: score,
        maxScore: q3.maxScore,
        isCorrect,
        details: isCorrect ? 'Đúng' : studentAns ? `Sai (nhập ${studentAns})` : 'Chưa tô',
      });
    }
  });

  const totalScore = Number((part1Score + part2Score + part3Score).toFixed(2));

  // Build topic competencies
  const topicCompetencies: Record<string, TopicCompetencyResult> = {};
  Object.keys(topicMap).forEach((topic) => {
    const data = topicMap[topic];
    topicCompetencies[topic] = {
      topic,
      totalQuestions: data.total,
      correctCount: Number(data.correct.toFixed(1)),
      scoreEarned: Number(data.earned.toFixed(2)),
      maxScore: Number(data.max.toFixed(2)),
      percentage: data.max > 0 ? Math.round((data.earned / data.max) * 100) : 0,
    };
  });

  // Build level competencies
  const levelCompetencies: Record<CognitiveLevel, LevelCompetencyResult> = {
    recognition: {
      level: 'recognition',
      label: 'Nhận biết',
      totalQuestions: levelMap.recognition.total,
      correctCount: Number(levelMap.recognition.correct.toFixed(1)),
      scoreEarned: Number(levelMap.recognition.earned.toFixed(2)),
      maxScore: Number(levelMap.recognition.max.toFixed(2)),
      percentage: levelMap.recognition.max > 0 ? Math.round((levelMap.recognition.earned / levelMap.recognition.max) * 100) : 0,
    },
    comprehension: {
      level: 'comprehension',
      label: 'Thông hiểu',
      totalQuestions: levelMap.comprehension.total,
      correctCount: Number(levelMap.comprehension.correct.toFixed(1)),
      scoreEarned: Number(levelMap.comprehension.earned.toFixed(2)),
      maxScore: Number(levelMap.comprehension.max.toFixed(2)),
      percentage: levelMap.comprehension.max > 0 ? Math.round((levelMap.comprehension.earned / levelMap.comprehension.max) * 100) : 0,
    },
    application: {
      level: 'application',
      label: 'Vận dụng',
      totalQuestions: levelMap.application.total,
      correctCount: Number(levelMap.application.correct.toFixed(1)),
      scoreEarned: Number(levelMap.application.earned.toFixed(2)),
      maxScore: Number(levelMap.application.max.toFixed(2)),
      percentage: levelMap.application.max > 0 ? Math.round((levelMap.application.earned / levelMap.application.max) * 100) : 0,
    },
    advanced_application: {
      level: 'advanced_application',
      label: 'Vận dụng cao',
      totalQuestions: levelMap.advanced_application.total,
      correctCount: Number(levelMap.advanced_application.correct.toFixed(1)),
      scoreEarned: Number(levelMap.advanced_application.earned.toFixed(2)),
      maxScore: Number(levelMap.advanced_application.max.toFixed(2)),
      percentage: levelMap.advanced_application.max > 0 ? Math.round((levelMap.advanced_application.earned / levelMap.advanced_application.max) * 100) : 0,
    },
  };

  return {
    scores: {
      part1Score: Number(part1Score.toFixed(2)),
      part2Score: Number(part2Score.toFixed(2)),
      part3Score: Number(part3Score.toFixed(2)),
      totalScore,
    },
    questionResults,
    topicCompetencies,
    levelCompetencies,
  };
}

export function getGradeRank(score: number): { rank: string; color: string; badgeClass: string } {
  if (score >= 9.0) return { rank: 'Xuất sắc', color: 'text-emerald-700', badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
  if (score >= 8.0) return { rank: 'Giỏi', color: 'text-blue-700', badgeClass: 'bg-blue-100 text-blue-800 border-blue-300' };
  if (score >= 6.5) return { rank: 'Khá', color: 'text-cyan-700', badgeClass: 'bg-cyan-100 text-cyan-800 border-cyan-300' };
  if (score >= 5.0) return { rank: 'Trung bình', color: 'text-amber-700', badgeClass: 'bg-amber-100 text-amber-800 border-amber-300' };
  return { rank: 'Cần cố gắng', color: 'text-rose-700', badgeClass: 'bg-rose-100 text-rose-800 border-rose-300' };
}
