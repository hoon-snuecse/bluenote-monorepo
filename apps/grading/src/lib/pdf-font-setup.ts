import { Font } from '@react-pdf/renderer';

/**
 * PDF 생성을 위한 한글 폰트 등록
 * Noto Sans KR 폰트를 로컬 파일에서 로드하여 등록합니다.
 */
export function registerKoreanFonts() {
  try {
    Font.register({
      family: 'NotoSansKR',
      fonts: [
        {
          src: '/fonts/NotoSansKR-Regular.ttf',
          fontWeight: 400,
        },
        {
          src: '/fonts/NotoSansKR-Medium.ttf',
          fontWeight: 500,
        },
        {
          src: '/fonts/NotoSansKR-Bold.ttf',
          fontWeight: 700,
        },
      ],
    });

    console.log('✅ Korean fonts registered successfully (Noto Sans KR)');
    return true;
  } catch (error) {
    console.error('❌ Font registration failed:', error);
    console.error('Please ensure font files exist in /public/fonts/');

    // Fallback: Google Fonts CDN
    console.warn('⚠️ Attempting to use fallback CDN fonts...');
    try {
      Font.register({
        family: 'NotoSansKR',
        fonts: [
          {
            src: 'https://fonts.gstatic.com/s/notosanskr/v36/PbykFmXiEBPT4ITbgNA5Cgm20xz64px_1hVWr0wuPNGmlQNMEfD4.ttf',
            fontWeight: 400,
          },
          {
            src: 'https://fonts.gstatic.com/s/notosanskr/v36/PbykFmXiEBPT4ITbgNA5Cgm20xz64px_1hVWr0wuPNGmlQNMEfD4.ttf',
            fontWeight: 500,
          },
          {
            src: 'https://fonts.gstatic.com/s/notosanskr/v36/PbykFmXiEBPT4ITbgNA5Cgm20xz64px_1hVWr0xuPNGmlQNMEfD4.ttf',
            fontWeight: 700,
          },
        ],
      });
      console.log('✅ Fallback CDN fonts registered');
      return true;
    } catch (fallbackError) {
      console.error('❌ Fallback font registration also failed:', fallbackError);
      return false;
    }
  }
}

/**
 * 한글 폰트 렌더링 테스트
 * 다양한 한글 조합과 특수문자를 테스트합니다.
 */
export function testKoreanFontRendering() {
  const testStrings = [
    '가나다라마바사아자차카타파하',
    'ㄱㄴㄷㄹㅁㅂㅅㅇㅈㅊㅋㅌㅍㅎ',
    'ㅏㅑㅓㅕㅗㅛㅜㅠㅡㅣ',
    'ㄲㄸㅃㅆㅉ',  // 쌍자음
    '똠방각하 쓱싹쓱싹 빠직빠직',  // 복잡한 조합
    '①②③④⑤ ㈜ ※ ★ ◆ ● ■',  // 특수문자
    '논증적 글쓰기 평가 보고서',
    '주장의 명확성, 근거의 타당성, 논리적 구조, 설득력 있는 표현',
    '매우 우수, 우수, 보통, 미흡',
  ];

  console.log('=== Testing Korean Font Support ===');
  testStrings.forEach((str, index) => {
    console.log(`${index + 1}. ${str}`);
  });
  console.log('===================================');

  return testStrings;
}

/**
 * PDF 날짜 포맷 유틸리티
 * @param date Date 객체
 * @returns 한글 형식의 날짜 문자열 (예: 2025년 1월 28일)
 */
export function formatDateKorean(date: Date): string {
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * PDF 날짜시간 포맷 유틸리티
 * @param date Date 객체
 * @returns 한글 형식의 날짜시간 문자열 (예: 2025년 1월 28일 오후 2:30)
 */
export function formatDateTimeKorean(date: Date): string {
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
