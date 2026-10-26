import React from 'react';
import { Check, X } from 'lucide-react';

interface OfficialSheetVisualizerProps {
  sbd: string;
  examCode: string;
  studentName?: string;
  examTitle?: string;
  part1Answers: Record<number, 'A' | 'B' | 'C' | 'D' | null>;
  part2Answers: Record<number, { a?: boolean | null; b?: boolean | null; c?: boolean | null; d?: boolean | null }>;
  part3Answers: Record<number, string | null>;
  correctAnswers?: {
    part1?: Record<number, 'A' | 'B' | 'C' | 'D'>;
    part2?: Record<number, { a: boolean; b: boolean; c: boolean; d: boolean }>;
    part3?: Record<number, string>;
  };
  interactive?: boolean;
  onPart1Change?: (qNum: number, choice: 'A' | 'B' | 'C' | 'D') => void;
  onPart2Change?: (qNum: number, subItem: 'a' | 'b' | 'c' | 'd', val: boolean) => void;
  onPart3Change?: (qNum: number, val: string) => void;
  onSbdChange?: (sbd: string) => void;
  onExamCodeChange?: (code: string) => void;
  maxPart1Questions?: number;
  maxPart2Questions?: number;
  maxPart3Questions?: number;
}

export const OfficialSheetVisualizer: React.FC<OfficialSheetVisualizerProps> = ({
  sbd = '010201',
  examCode = '101',
  studentName = 'Nguyễn Văn An',
  examTitle = 'Khảo sát Năng lực Môn Toán 2025',
  part1Answers,
  part2Answers,
  part3Answers,
  correctAnswers,
  interactive = false,
  onPart1Change,
  onPart2Change,
  onPart3Change,
  maxPart1Questions = 40,
  maxPart2Questions = 8,
  maxPart3Questions = 6,
}) => {
  // Pad SBD to 6 digits
  const paddedSbd = (sbd || '000000').padStart(6, '0').slice(-6);
  const paddedCode = (examCode || '000').padStart(3, '0').slice(-3);

  return (
    <div className="bg-white border-2 border-slate-700 shadow-xl rounded-md p-4 sm:p-6 text-slate-800 font-sans text-xs max-w-4xl mx-auto selection:bg-rose-100 relative">
      {/* 4 OMR Corner Alignment Markers */}
      <div className="absolute top-2 left-2 w-4 h-4 bg-black"></div>
      <div className="absolute top-2 right-2 w-4 h-4 bg-black"></div>
      <div className="absolute bottom-2 left-2 w-4 h-4 bg-black"></div>
      <div className="absolute bottom-2 right-2 w-4 h-4 bg-black"></div>

      {/* Header */}
      <div className="text-center border-b-2 border-slate-800 pb-3 mb-4">
        <h2 className="text-base sm:text-lg font-black tracking-wider uppercase text-slate-900">
          PHIẾU TRẢ LỜI TRẮC NGHIỆM
        </h2>
        <p className="text-[11px] font-bold text-rose-700 tracking-wide">
          (Mẫu chuẩn 2025 - Theo quy định cấu trúc mới của Bộ Giáo dục và Đào tạo)
        </p>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-5 pb-3 border-b border-dashed border-slate-300">
        {/* Left: General student info */}
        <div className="md:col-span-7 space-y-1.5 border border-slate-300 p-2.5 rounded bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 w-24">Kỳ thi / Bài thi:</span>
            <span className="font-bold text-slate-900">{examTitle}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 w-24">Họ tên thí sinh:</span>
            <span className="font-bold text-blue-900 uppercase">{studentName || '................................'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 w-24">Phòng thi số:</span>
            <span className="font-medium">P.104 - Hội đồng THPT Quốc Gia</span>
          </div>
          <div className="text-[10px] text-slate-500 italic mt-1">
            * Chú ý: Thí sinh giữ phiếu phẳng, tô tròn đậm ô lựa chọn, không gập mép.
          </div>
        </div>

        {/* Center: Mục 7 - Số báo danh (6 cột) */}
        <div className="md:col-span-3 border border-slate-400 p-2 rounded bg-white text-center">
          <div className="font-bold text-[11px] text-slate-900 mb-1 border-b pb-0.5">
            7. Số báo danh
          </div>
          {/* Numbers box */}
          <div className="grid grid-cols-6 gap-0.5 mb-1.5 font-mono font-bold text-slate-900 text-xs">
            {paddedSbd.split('').map((char, idx) => (
              <div key={idx} className="border border-slate-400 h-5 flex items-center justify-center bg-slate-100">
                {char}
              </div>
            ))}
          </div>
          {/* Bubble Grid 0-9 */}
          <div className="space-y-0.5">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((rowDigit) => (
              <div key={rowDigit} className="flex items-center justify-between px-1">
                <span className="text-[9px] font-mono w-2 text-slate-500">{rowDigit}</span>
                <div className="grid grid-cols-6 gap-1">
                  {paddedSbd.split('').map((char, colIdx) => {
                    const isFilled = parseInt(char, 10) === rowDigit;
                    return (
                      <div
                        key={colIdx}
                        className={`w-3.5 h-3.5 rounded-full border border-slate-500 flex items-center justify-center text-[8px] font-bold ${
                          isFilled ? 'bg-slate-900 text-white' : 'bg-white text-slate-400'
                        }`}
                      >
                        {isFilled ? '●' : rowDigit}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Mục 8 - Mã đề thi (3 cột) */}
        <div className="md:col-span-2 border border-slate-400 p-2 rounded bg-white text-center">
          <div className="font-bold text-[11px] text-slate-900 mb-1 border-b pb-0.5">
            8. Mã đề thi
          </div>
          {/* Numbers box */}
          <div className="grid grid-cols-3 gap-0.5 mb-1.5 font-mono font-bold text-slate-900 text-xs">
            {paddedCode.split('').map((char, idx) => (
              <div key={idx} className="border border-slate-400 h-5 flex items-center justify-center bg-slate-100">
                {char}
              </div>
            ))}
          </div>
          {/* Bubble Grid 0-9 */}
          <div className="space-y-0.5">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((rowDigit) => (
              <div key={rowDigit} className="flex items-center justify-between px-1">
                <span className="text-[9px] font-mono w-2 text-slate-500">{rowDigit}</span>
                <div className="grid grid-cols-3 gap-1">
                  {paddedCode.split('').map((char, colIdx) => {
                    const isFilled = parseInt(char, 10) === rowDigit;
                    return (
                      <div
                        key={colIdx}
                        className={`w-3.5 h-3.5 rounded-full border border-slate-500 flex items-center justify-center text-[8px] font-bold ${
                          isFilled ? 'bg-slate-900 text-white' : 'bg-white text-slate-400'
                        }`}
                      >
                        {isFilled ? '●' : rowDigit}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION I: Trắc nghiệm 4 lựa chọn (A, B, C, D) */}
      <div className="mb-6">
        <div className="flex items-center justify-between bg-slate-800 text-white px-3 py-1 rounded-t">
          <span className="font-bold text-xs uppercase tracking-wider">
            PHẦN I: Câu trắc nghiệm nhiều phương án lựa chọn (A, B, C, D)
          </span>
          <span className="text-[10px] text-slate-300">Tối đa 40 câu</span>
        </div>
        <div className="border border-slate-300 rounded-b p-3 bg-slate-50/30">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {[0, 10, 20, 30].map((offset) => (
              <div key={offset} className="space-y-1">
                <div className="grid grid-cols-5 text-center font-bold text-[10px] text-slate-500 pb-0.5 border-b">
                  <span>Câu</span>
                  <span>A</span>
                  <span>B</span>
                  <span>C</span>
                  <span>D</span>
                </div>
                {Array.from({ length: 10 }).map((_, i) => {
                  const qNum = offset + i + 1;
                  if (qNum > maxPart1Questions) return null;

                  const studentChoice = part1Answers?.[qNum] || null;
                  const correctChoice = correctAnswers?.part1?.[qNum];
                  const hasKey = correctChoice !== undefined;
                  const isCorrect = studentChoice === correctChoice;

                  return (
                    <div key={qNum} className="grid grid-cols-5 items-center text-center py-0.5">
                      <span className="font-bold text-slate-700 text-[11px] flex items-center justify-center gap-0.5">
                        {qNum}
                        {hasKey && studentChoice && (
                          isCorrect ? (
                            <Check className="w-2.5 h-2.5 text-emerald-600 inline" />
                          ) : (
                            <X className="w-2.5 h-2.5 text-rose-600 inline" />
                          )
                        )}
                      </span>
                      {(['A', 'B', 'C', 'D'] as const).map((choice) => {
                        const isSelected = studentChoice === choice;
                        const isCorrectBubble = hasKey && correctChoice === choice;

                        let bubbleStyle = 'border-slate-400 bg-white text-slate-600 hover:border-slate-800';
                        if (isSelected) {
                          if (hasKey) {
                            bubbleStyle = isCorrect ? 'bg-emerald-600 border-emerald-700 text-white shadow-sm' : 'bg-rose-600 border-rose-700 text-white shadow-sm';
                          } else {
                            bubbleStyle = 'bg-slate-900 border-slate-900 text-white';
                          }
                        } else if (hasKey && isCorrectBubble) {
                          bubbleStyle = 'bg-emerald-100 border-emerald-400 text-emerald-800 font-black ring-1 ring-emerald-500';
                        }

                        return (
                          <button
                            key={choice}
                            type="button"
                            disabled={!interactive}
                            onClick={() => onPart1Change?.(qNum, choice)}
                            className={`w-4 h-4 mx-auto rounded-full border text-[9px] font-semibold flex items-center justify-center transition-all ${bubbleStyle} ${
                              interactive ? 'cursor-pointer' : 'cursor-default'
                            }`}
                          >
                            {isSelected ? '●' : choice}
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION II: Trắc nghiệm Đúng / Sai (a, b, c, d) */}
      <div className="mb-6">
        <div className="flex items-center justify-between bg-slate-800 text-white px-3 py-1 rounded-t">
          <span className="font-bold text-xs uppercase tracking-wider">
            PHẦN II: Câu trắc nghiệm Đúng / Sai (Thí sinh chọn Đúng hoặc Sai cho mỗi ý a, b, c, d)
          </span>
          <span className="text-[10px] text-amber-300 font-medium">Quy tắc tính điểm BGD: 0.1 - 0.25 - 0.5 - 1.0đ</span>
        </div>
        <div className="border border-slate-300 rounded-b p-3 bg-slate-50/30">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {Array.from({ length: Math.min(8, maxPart2Questions) }).map((_, idx) => {
              const qNum = idx + 1;
              const ansObj = part2Answers?.[qNum] || {};
              const keyObj = correctAnswers?.part2?.[qNum];

              return (
                <div key={qNum} className="border border-slate-300 rounded p-2 bg-white shadow-xs">
                  <div className="font-bold text-[11px] text-slate-800 border-b pb-1 mb-1.5 flex justify-between">
                    <span>Câu {qNum}</span>
                    <span className="text-[9px] text-slate-500">Đúng / Sai</span>
                  </div>
                  <div className="space-y-1">
                    {(['a', 'b', 'c', 'd'] as const).map((sub) => {
                      const currentVal = ansObj[sub];
                      const correctVal = keyObj?.[sub];
                      const hasKey = correctVal !== undefined;

                      return (
                        <div key={sub} className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-slate-700 uppercase w-4">{sub})</span>
                          <div className="flex items-center gap-2">
                            {/* Nút Đúng */}
                            <button
                              type="button"
                              disabled={!interactive}
                              onClick={() => onPart2Change?.(qNum, sub, true)}
                              className={`px-2 py-0.5 rounded-full border text-[9px] font-bold flex items-center gap-0.5 ${
                                currentVal === true
                                  ? hasKey && correctVal === true
                                    ? 'bg-emerald-600 text-white border-emerald-700'
                                    : hasKey && correctVal === false
                                    ? 'bg-rose-600 text-white border-rose-700'
                                    : 'bg-slate-900 text-white border-slate-900'
                                  : hasKey && correctVal === true
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-400 font-bold'
                                  : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                              } ${interactive ? 'cursor-pointer' : 'cursor-default'}`}
                            >
                              Đúng
                            </button>
                            {/* Nút Sai */}
                            <button
                              type="button"
                              disabled={!interactive}
                              onClick={() => onPart2Change?.(qNum, sub, false)}
                              className={`px-2 py-0.5 rounded-full border text-[9px] font-bold flex items-center gap-0.5 ${
                                currentVal === false
                                  ? hasKey && correctVal === false
                                    ? 'bg-emerald-600 text-white border-emerald-700'
                                    : hasKey && correctVal === true
                                    ? 'bg-rose-600 text-white border-rose-700'
                                    : 'bg-slate-900 text-white border-slate-900'
                                  : hasKey && correctVal === false
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-400 font-bold'
                                  : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                              } ${interactive ? 'cursor-pointer' : 'cursor-default'}`}
                            >
                              Sai
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECTION III: Trắc nghiệm Trả lời ngắn (Đầy đủ lưới ô tô 4 cột chuẩn BGD 2025) */}
      <div>
        <div className="flex items-center justify-between bg-slate-800 text-white px-3 py-1 rounded-t">
          <span className="font-bold text-xs uppercase tracking-wider">
            PHẦN III: Câu trắc nghiệm dạng Trả lời ngắn (Tô các ô số và ký tự theo từng cột)
          </span>
          <span className="text-[10px] text-amber-300 font-medium">Lưới 4 cột: dấu (-), dấu (,), và số 0 - 9</span>
        </div>
        <div className="border border-slate-300 rounded-b p-3 bg-slate-50/30">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {Array.from({ length: Math.min(6, maxPart3Questions) }).map((_, idx) => {
              const qNum = idx + 1;
              const studentVal = part3Answers?.[qNum] || '';
              const correctVal = correctAnswers?.part3?.[qNum];
              const hasKey = correctVal !== undefined;
              const isMatch = hasKey && studentVal && (
                studentVal.trim().replace(/,/g, '.') === correctVal.trim().replace(/,/g, '.')
              );

              // Parse studentVal into 4 column characters
              const rawChars = (studentVal || '').replace(/\./g, ',').split('');
              const colChars = [rawChars[0] || '', rawChars[1] || '', rawChars[2] || '', rawChars[3] || ''];

              const handleColClick = (colIdx: number, symbol: string) => {
                if (!interactive) return;
                const newCols = [...colChars];
                if (newCols[colIdx] === symbol) {
                  newCols[colIdx] = ''; // unselect if clicked again
                } else {
                  newCols[colIdx] = symbol; // select symbol
                }
                const newVal = newCols.join('').trim();
                onPart3Change?.(qNum, newVal);
              };

              return (
                <div key={qNum} className="border border-slate-300 rounded-lg p-2 bg-white text-center shadow-2xs">
                  {/* Question Header */}
                  <div className="font-bold text-[11px] text-slate-900 mb-1 border-b pb-0.5 flex items-center justify-between">
                    <span className="text-blue-900">Câu {qNum}</span>
                    {hasKey && studentVal && (
                      isMatch ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <X className="w-3.5 h-3.5 text-rose-600" />
                      )
                    )}
                  </div>

                  {/* Top 4 Write-In Character Boxes */}
                  <div className="grid grid-cols-4 gap-0.5 mb-1.5 font-mono font-bold text-slate-900 text-xs">
                    {[0, 1, 2, 3].map((colIdx) => (
                      <div
                        key={colIdx}
                        className={`h-6 border flex items-center justify-center rounded-xs transition-colors ${
                          colChars[colIdx]
                            ? hasKey
                              ? isMatch
                                ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                                : 'bg-rose-50 border-rose-500 text-rose-800'
                              : 'bg-slate-100 border-slate-400 text-slate-900'
                            : 'bg-white border-slate-300 text-slate-400'
                        }`}
                      >
                        {colChars[colIdx] || ''}
                      </div>
                    ))}
                  </div>

                  {/* 4-Column Bubble Shading Matrix (Chuẩn BGD 2025) */}
                  <div className="space-y-0.5 border-t border-slate-200 pt-1">
                    {/* Row 1: Sign (-) for Column 0, empty for others */}
                    <div className="grid grid-cols-4 gap-0.5 items-center">
                      <button
                        type="button"
                        disabled={!interactive}
                        onClick={() => handleColClick(0, '-')}
                        title="Dấu âm (-)"
                        className={`w-3.5 h-3.5 mx-auto rounded-full border text-[9px] font-bold flex items-center justify-center transition-all ${
                          colChars[0] === '-'
                            ? hasKey
                              ? isMatch
                                ? 'bg-emerald-600 text-white border-emerald-700'
                                : 'bg-rose-600 text-white border-rose-700'
                              : 'bg-slate-900 text-white border-slate-900'
                            : 'border-slate-400 text-slate-600 hover:border-slate-700 bg-white'
                        } ${interactive ? 'cursor-pointer' : 'cursor-default'}`}
                      >
                        {colChars[0] === '-' ? '●' : '-'}
                      </button>
                      <div className="w-3.5 h-3.5 mx-auto"></div>
                      <div className="w-3.5 h-3.5 mx-auto"></div>
                      <div className="w-3.5 h-3.5 mx-auto"></div>
                    </div>

                    {/* Row 2: Comma (,) for all 4 columns */}
                    <div className="grid grid-cols-4 gap-0.5 items-center">
                      {[0, 1, 2, 3].map((colIdx) => {
                        const isShaded = colChars[colIdx] === ',';
                        return (
                          <button
                            key={colIdx}
                            type="button"
                            disabled={!interactive}
                            onClick={() => handleColClick(colIdx, ',')}
                            title="Dấu phẩy (,)"
                            className={`w-3.5 h-3.5 mx-auto rounded-full border text-[9px] font-bold flex items-center justify-center transition-all ${
                              isShaded
                                ? hasKey
                                  ? isMatch
                                    ? 'bg-emerald-600 text-white border-emerald-700'
                                    : 'bg-rose-600 text-white border-rose-700'
                                  : 'bg-slate-900 text-white border-slate-900'
                                : 'border-slate-400 text-slate-600 hover:border-slate-700 bg-white'
                            } ${interactive ? 'cursor-pointer' : 'cursor-default'}`}
                          >
                            {isShaded ? '●' : ','}
                          </button>
                        );
                      })}
                    </div>

                    {/* Rows 3..12: Digits 0 through 9 for all 4 columns */}
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => {
                      const digitStr = String(digit);
                      return (
                        <div key={digit} className="grid grid-cols-4 gap-0.5 items-center">
                          {[0, 1, 2, 3].map((colIdx) => {
                            const isShaded = colChars[colIdx] === digitStr;
                            return (
                              <button
                                key={colIdx}
                                type="button"
                                disabled={!interactive}
                                onClick={() => handleColClick(colIdx, digitStr)}
                                title={`Cột ${colIdx + 1} - Số ${digit}`}
                                className={`w-3.5 h-3.5 mx-auto rounded-full border text-[8px] font-bold flex items-center justify-center transition-all ${
                                  isShaded
                                    ? hasKey
                                      ? isMatch
                                        ? 'bg-emerald-600 text-white border-emerald-700'
                                        : 'bg-rose-600 text-white border-rose-700'
                                      : 'bg-slate-900 text-white border-slate-900'
                                    : 'border-slate-300 text-slate-500 hover:border-slate-600 bg-white'
                                } ${interactive ? 'cursor-pointer' : 'cursor-default'}`}
                              >
                                {isShaded ? '●' : digit}
                              </button>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>

                  {/* Summary Answer Footer */}
                  <div className="mt-2 pt-1 border-t border-slate-100 text-[10px]">
                    <div className="font-mono font-bold text-slate-700 truncate">
                      {studentVal ? `Tô: ${studentVal}` : <span className="text-slate-400 italic font-normal">Chưa tô</span>}
                    </div>
                    {hasKey && (
                      <div className="text-[9px] text-slate-500 mt-0.5">
                        Đ/A: <span className="font-bold text-emerald-700">{correctVal}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
