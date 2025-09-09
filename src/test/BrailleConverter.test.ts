import { BrailleConverter } from '../converters/BrailleConverter';

// 점자 변환 테스트
describe('BrailleConverter', () => {
  
  // 언어 감지 테스트
  describe('detectLanguage', () => {
    test('should detect Korean', () => {
      expect(BrailleConverter.detectLanguage('안녕하세요')).toBe('korean');
    });

    test('should detect English', () => {
      expect(BrailleConverter.detectLanguage('Hello World')).toBe('english');
    });

    test('should detect Japanese', () => {
      expect(BrailleConverter.detectLanguage('こんにちは')).toBe('japanese');
    });

    test('should detect mixed languages', () => {
      expect(BrailleConverter.detectLanguage('Hello 안녕')).toBe('mixed');
    });
  });

  // 점자 변환 테스트
  describe('convertToBraille', () => {
    test('should convert simple English text', () => {
      const result = BrailleConverter.convertToBraille('a');
      expect(result).toHaveLength(1);
      expect(result[0].char).toBe('a');
      expect(result[0].dots).toEqual([1]);
    });

    test('should convert simple Korean text', () => {
      const result = BrailleConverter.convertToBraille('안');
      expect(result).toHaveLength(1);
      expect(result[0].char).toBe('안');
      // 한글 점자 매핑에 따른 점 패턴 검증
      expect(result[0].dots.length).toBeGreaterThan(0);
    });

    test('should handle spaces', () => {
      const result = BrailleConverter.convertToBraille('a b');
      expect(result).toHaveLength(3);
      expect(result[1].char).toBe(' ');
      expect(result[1].dots).toEqual([]);
    });

    test('should handle newlines', () => {
      const result = BrailleConverter.convertToBraille('a\nb');
      expect(result).toHaveLength(3);
      expect(result[1].char).toBe('\n');
      expect(result[1].unicode).toBe('\n');
    });

    test('should handle punctuation', () => {
      const result = BrailleConverter.convertToBraille('Hello!');
      expect(result).toHaveLength(6);
      expect(result[5].char).toBe('!');
      expect(result[5].dots).toEqual([2, 3, 5]);
    });
  });

  // 점 번호를 유니코드로 변환 테스트
  describe('dotsToUnicode', () => {
    test('should convert dots to unicode', () => {
      // 점 1번은 유니코드 점자 패턴 ⠁
      expect(BrailleConverter.dotsToUnicode([1])).toBe('⠁');
      // 점 1,2번은 유니코드 점자 패턴 ⠃
      expect(BrailleConverter.dotsToUnicode([1, 2])).toBe('⠃');
    });

    test('should handle empty dots array', () => {
      expect(BrailleConverter.dotsToUnicode([])).toBe('⠀');
    });
  });

});

// 점자 렌더러 기본 테스트
describe('BrailleRenderer basic functions', () => {
  
  test('should be importable', () => {
    const { BrailleRenderer } = require('../converters/BrailleRenderer');
    expect(BrailleRenderer).toBeDefined();
  });

});

// 통합 테스트 예시
describe('Integration Tests', () => {
  
  test('Korean text conversion and rendering', () => {
    const text = '안녕';
    const patterns = BrailleConverter.convertToBraille(text, 'korean');
    
    expect(patterns.length).toBeGreaterThan(0);
    patterns.forEach(pattern => {
      expect(pattern.char).toBeDefined();
      expect(pattern.unicode).toBeDefined();
      expect(pattern.dots).toBeDefined();
    });
  });

  test('English text conversion and rendering', () => {
    const text = 'hello';
    const patterns = BrailleConverter.convertToBraille(text, 'english');
    
    expect(patterns).toHaveLength(5);
    expect(patterns[0].char).toBe('h');
    expect(patterns[0].dots).toEqual([1, 2, 5]);
  });

  test('Mixed language text handling', () => {
    const text = 'Hello 안녕 World';
    const patterns = BrailleConverter.convertToBraille(text);
    
    expect(patterns.length).toBeGreaterThan(0);
    
    // 공백과 문자가 모두 포함되어 있는지 확인
    const hasSpaces = patterns.some(p => p.char === ' ');
    expect(hasSpaces).toBe(true);
  });

});

// 접근성 기능 테스트
describe('Accessibility Features', () => {
  
  test('should provide alternative text descriptions', () => {
    const patterns = BrailleConverter.convertToBraille('a');
    const pattern = patterns[0];
    
    expect(pattern.char).toBe('a');
    expect(pattern.unicode).toBe('⠁');
    expect(pattern.dots).toEqual([1]);
    
    // 점자 패턴에 대한 설명을 생성할 수 있는지 확인
    const description = `문자 '${pattern.char}'는 점자 패턴 ${pattern.dots.join(', ')}번 점으로 표현됩니다.`;
    expect(description).toBeDefined();
  });

  test('should handle invalid characters gracefully', () => {
    // 변환할 수 없는 특수 문자 테스트
    const patterns = BrailleConverter.convertToBraille('∑∫∆');
    
    patterns.forEach(pattern => {
      // 변환할 수 없는 문자는 물음표 패턴으로 표시
      if (pattern.dots.length > 0) {
        expect(pattern.dots).toBeDefined();
        expect(pattern.unicode).toBeDefined();
      }
    });
  });

});