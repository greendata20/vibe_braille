// Unicode Braille 패턴 정의 (U+2800-U+28FF)
// 점자는 8점 시스템이지만 일반적으로 6점을 사용
// 각 점의 번호: 1 4
//             2 5  
//             3 6
//             7 8

export interface BraillePattern {
  char: string;
  unicode: string; // 유니코드 점자 문자
  dots: number[]; // 점자 점 번호 배열
}

export class BrailleConverter {
  // 점자 점 번호를 유니코드 점자 문자로 변환
  static dotsToUnicode(dots: number[]): string {
    let code = 0x2800;
    
    // 각 점의 비트 위치에 따라 유니코드 값 계산
    for (const dot of dots) {
      switch (dot) {
        case 1: code += 0x01; break;
        case 2: code += 0x02; break;
        case 3: code += 0x04; break;
        case 4: code += 0x08; break;
        case 5: code += 0x10; break;
        case 6: code += 0x20; break;
        case 7: code += 0x40; break;
        case 8: code += 0x80; break;
      }
    }
    
    return String.fromCharCode(code);
  }
  
  // 텍스트가 주로 어떤 언어인지 감지
  static detectLanguage(text: string): 'korean' | 'english' | 'japanese' | 'mixed' {
    const koreanPattern = /[가-힣]/;
    const japanesePattern = /[\u3040-\u309F\u30A0-\u30FF]/; // 히라가나(3040-309F) + 가타카나(30A0-30FF)
    const englishPattern = /[a-zA-Z]/;
    
    const hasKorean = koreanPattern.test(text);
    const hasJapanese = japanesePattern.test(text);
    const hasEnglish = englishPattern.test(text);
    
    const count = [hasKorean, hasJapanese, hasEnglish].filter(Boolean).length;
    
    if (count > 1) return 'mixed';
    if (hasKorean) return 'korean';
    if (hasJapanese) return 'japanese';
    if (hasEnglish) return 'english';
    
    return 'english'; // 기본값
  }
  
  // 메인 변환 함수
  static convertToBraille(text: string, language?: 'korean' | 'english' | 'japanese'): BraillePattern[] {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const detectedLang = language || this.detectLanguage(text);
    const result: BraillePattern[] = [];
    
    for (const char of text) {
      // 공백 처리
      if (char === ' ' || char === '\t') {
        result.push({
          char: char,
          unicode: ' ',
          dots: []
        });
        continue;
      }
      
      // 줄바꿈 처리
      if (char === '\n') {
        result.push({
          char: char,
          unicode: '\n',
          dots: []
        });
        continue;
      }
      
      let pattern: BraillePattern | null = null;
      
      // 한글 처리
      if (/[가-힣]/.test(char)) {
        pattern = this.convertKoreanChar(char);
      }
      // 일본어 처리
      else if (/[\u3040-\u309F\u30A0-\u30FF]/.test(char)) {
        pattern = this.convertJapaneseChar(char);
      }
      // 영어 및 숫자 처리
      else if (/[a-zA-Z0-9]/.test(char)) {
        pattern = this.convertEnglishChar(char);
      }
      // 구두점 처리
      else {
        pattern = this.convertPunctuation(char);
      }
      
      if (pattern) {
        result.push(pattern);
      } else {
        // 변환할 수 없는 문자는 물음표로 표시
        result.push({
          char: char,
          unicode: this.dotsToUnicode([2, 6]),
          dots: [2, 6]
        });
      }
    }
    
    return result;
  }
  
  // 한글 점자 변환 (간략화된 버전)
  private static convertKoreanChar(char: string): BraillePattern | null {
    // 한글 점자 매핑 테이블 (일부만 구현)
    const koreanBrailleMap: Record<string, number[]> = {
      // 자음
      'ㄱ': [1, 4],
      'ㄴ': [1, 4, 5],
      'ㄷ': [2, 4],
      'ㄹ': [5],
      'ㅁ': [1, 5],
      'ㅂ': [1, 2],
      'ㅅ': [6],
      'ㅇ': [1, 2, 4, 5, 6],
      'ㅈ': [4],
      'ㅊ': [5, 6],
      'ㅋ': [1, 2, 5],
      'ㅌ': [1, 2, 5, 6],
      'ㅍ': [1, 4, 5, 6],
      'ㅎ': [2, 5, 6],
      
      // 모음
      'ㅏ': [1, 2, 6],
      'ㅑ': [3, 4, 5],
      'ㅓ': [2, 3, 4],
      'ㅕ': [1, 3, 6],
      'ㅗ': [1, 3, 6],
      'ㅛ': [3, 4, 6],
      'ㅜ': [1, 3, 4],
      'ㅠ': [1, 3, 4, 6],
      'ㅡ': [2, 4, 6],
      'ㅣ': [1, 3, 5],
      
      // 일부 글자 (실제로는 자음+모음+받침 분해 필요)
      '안': [1, 2, 4, 5, 6], // 예시
      '녕': [1, 4, 5, 1, 2, 6], // 예시
      '하': [2, 5, 6, 1, 2, 6], // 예시
      '세': [6, 2, 3, 4], // 예시
      '요': [3, 4, 6] // 예시
    };
    
    const dots = koreanBrailleMap[char];
    if (dots) {
      return {
        char,
        unicode: this.dotsToUnicode(dots),
        dots
      };
    }
    
    return null;
  }
  
  // 영어 점자 변환 (Grade 1)
  private static convertEnglishChar(char: string): BraillePattern | null {
    const englishBrailleMap: Record<string, number[]> = {
      'a': [1], 'b': [1, 2], 'c': [1, 4], 'd': [1, 4, 5], 'e': [1, 5],
      'f': [1, 2, 4], 'g': [1, 2, 4, 5], 'h': [1, 2, 5], 'i': [2, 4], 'j': [2, 4, 5],
      'k': [1, 3], 'l': [1, 2, 3], 'm': [1, 3, 4], 'n': [1, 3, 4, 5], 'o': [1, 3, 5],
      'p': [1, 2, 3, 4], 'q': [1, 2, 3, 4, 5], 'r': [1, 2, 3, 5], 's': [2, 3, 4], 't': [2, 3, 4, 5],
      'u': [1, 3, 6], 'v': [1, 2, 3, 6], 'w': [2, 4, 5, 6], 'x': [1, 3, 4, 6], 'y': [1, 3, 4, 5, 6],
      'z': [1, 3, 5, 6],
      
      // 대문자 (앞에 대문자 기호 6점 붙임)
      'A': [6, 1], 'B': [6, 1, 2], 'C': [6, 1, 4], 'D': [6, 1, 4, 5], 'E': [6, 1, 5],
      'F': [6, 1, 2, 4], 'G': [6, 1, 2, 4, 5], 'H': [6, 1, 2, 5], 'I': [6, 2, 4], 'J': [6, 2, 4, 5],
      'K': [6, 1, 3], 'L': [6, 1, 2, 3], 'M': [6, 1, 3, 4], 'N': [6, 1, 3, 4, 5], 'O': [6, 1, 3, 5],
      'P': [6, 1, 2, 3, 4], 'Q': [6, 1, 2, 3, 4, 5], 'R': [6, 1, 2, 3, 5], 'S': [6, 2, 3, 4], 'T': [6, 2, 3, 4, 5],
      'U': [6, 1, 3, 6], 'V': [6, 1, 2, 3, 6], 'W': [6, 2, 4, 5, 6], 'X': [6, 1, 3, 4, 6], 'Y': [6, 1, 3, 4, 5, 6],
      'Z': [6, 1, 3, 5, 6],
      
      // 숫자 (앞에 숫자 기호 3,4,5,6점 붙임)
      '1': [3, 4, 5, 6, 1], '2': [3, 4, 5, 6, 1, 2], '3': [3, 4, 5, 6, 1, 4], '4': [3, 4, 5, 6, 1, 4, 5], '5': [3, 4, 5, 6, 1, 5],
      '6': [3, 4, 5, 6, 1, 2, 4], '7': [3, 4, 5, 6, 1, 2, 4, 5], '8': [3, 4, 5, 6, 1, 2, 5], '9': [3, 4, 5, 6, 2, 4], '0': [3, 4, 5, 6, 2, 4, 5]
    };
    
    const dots = englishBrailleMap[char];
    if (dots) {
      return {
        char,
        unicode: this.dotsToUnicode(dots),
        dots
      };
    }
    
    return null;
  }
  
  // 일본어 점자 변환 (간략화된 버전)
  private static convertJapaneseChar(char: string): BraillePattern | null {
    const japaneseBrailleMap: Record<string, number[]> = {
      // 히라가나
      'あ': [1], 'い': [1, 2], 'う': [1, 4], 'え': [1, 2, 4], 'お': [2, 4],
      'か': [1, 6], 'き': [1, 2, 6], 'く': [1, 4, 6], 'け': [1, 2, 4, 6], 'こ': [2, 4, 6],
      'さ': [1, 5, 6], 'し': [1, 2, 5, 6], 'す': [1, 4, 5, 6], 'せ': [1, 2, 4, 5, 6], 'そ': [2, 4, 5, 6],
      'た': [1, 3, 6], 'ち': [1, 2, 3, 6], 'つ': [1, 3, 4, 6], 'て': [1, 2, 3, 4, 6], 'と': [2, 3, 4, 6],
      'な': [1, 3, 5, 6], 'に': [1, 2, 3, 5, 6], 'ぬ': [1, 3, 4, 5, 6], 'ね': [1, 2, 3, 4, 5, 6], 'の': [2, 3, 4, 5, 6],
      'は': [1, 3], 'ひ': [1, 2, 3], 'ふ': [1, 3, 4], 'へ': [1, 2, 3, 4], 'ほ': [2, 3, 4],
      'ま': [1, 3, 5], 'み': [1, 2, 3, 5], 'む': [1, 3, 4, 5], 'め': [1, 2, 3, 4, 5], 'も': [2, 3, 4, 5],
      'や': [3, 4], 'ゆ': [3, 4, 6], 'よ': [3, 4, 5],
      'ら': [1, 5], 'り': [1, 2, 5], 'る': [1, 4, 5], 'れ': [1, 2, 4, 5], 'ろ': [2, 4, 5],
      'わ': [3], 'ん': [3, 5, 6],
      
      // 가타카나
      'ア': [1], 'イ': [1, 2], 'ウ': [1, 4], 'エ': [1, 2, 4], 'オ': [2, 4],
      'カ': [1, 6], 'キ': [1, 2, 6], 'ク': [1, 4, 6], 'ケ': [1, 2, 4, 6], 'コ': [2, 4, 6]
    };
    
    const dots = japaneseBrailleMap[char];
    if (dots) {
      return {
        char,
        unicode: this.dotsToUnicode(dots),
        dots
      };
    }
    
    return null;
  }
  
  // 구두점 변환
  private static convertPunctuation(char: string): BraillePattern | null {
    const punctuationMap: Record<string, number[]> = {
      '.': [2, 5, 6],
      ',': [2],
      '?': [2, 6],
      '!': [2, 3, 5],
      ':': [2, 5],
      ';': [2, 3],
      '-': [3, 6],
      '(': [2, 3, 6],
      ')': [3, 5, 6],
      '"': [2, 3, 6],
      "'": [3]
    };
    
    const dots = punctuationMap[char];
    if (dots) {
      return {
        char,
        unicode: this.dotsToUnicode(dots),
        dots
      };
    }
    
    return null;
  }
}