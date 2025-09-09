import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  CardActions,
  Switch,
  FormControlLabel,
  Slider,
  Alert,
  Chip,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  Download,
  Clear,
  Settings,
  Accessibility,
  Info,
  VolumeUp
} from '@mui/icons-material';
import { BrailleConverter as Converter, BraillePattern } from '../converters/BrailleConverter';
import { BrailleRenderer, RenderOptions } from '../converters/BrailleRenderer';

interface BrailleConverterProps {}

const BrailleConverter: React.FC<BrailleConverterProps> = () => {
  const [inputText, setInputText] = useState('');
  const [language, setLanguage] = useState<'auto' | 'korean' | 'english' | 'japanese'>('auto');
  const [braillePatterns, setBraillePatterns] = useState<BraillePattern[]>([]);
  const [detectedLanguage, setDetectedLanguage] = useState<string>('');
  
  // 렌더링 옵션
  const [renderOptions, setRenderOptions] = useState<RenderOptions>({
    cellWidth: 40,
    cellHeight: 60,
    dotRadius: 3,
    dotSpacing: 8,
    lineSpacing: 20,
    margin: 20,
    backgroundColor: '#ffffff',
    dotColor: '#000000',
    showGrid: false,
    gridColor: '#e0e0e0'
  });
  
  const [showSettings, setShowSettings] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string>('');

  // 텍스트 변환 실행
  useEffect(() => {
    if (inputText.trim()) {
      try {
        const selectedLang = language === 'auto' ? undefined : language;
        const patterns = Converter.convertToBraille(inputText, selectedLang);
        setBraillePatterns(patterns);
        
        if (language === 'auto') {
          const detected = Converter.detectLanguage(inputText);
          setDetectedLanguage(detected);
        }
        
        setError('');
        
        // 캔버스 렌더링
        setTimeout(() => {
          if (canvasRef.current) {
            BrailleRenderer.renderToCanvas(patterns, canvasRef.current, renderOptions);
          }
        }, 100);
        
      } catch (err) {
        setError('점자 변환 중 오류가 발생했습니다.');
        console.error('Braille conversion error:', err);
      }
    } else {
      setBraillePatterns([]);
      setDetectedLanguage('');
      setError('');
    }
  }, [inputText, language, renderOptions]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(event.target.value);
  };

  const handleLanguageChange = (event: any) => {
    setLanguage(event.target.value);
  };

  const handleClear = () => {
    setInputText('');
    setBraillePatterns([]);
    setDetectedLanguage('');
    setError('');
  };

  const handleDownloadPNG = () => {
    if (canvasRef.current) {
      BrailleRenderer.canvasToDownload(canvasRef.current, 'braille-output', 'png');
    }
  };

  const handleDownloadSVG = () => {
    if (braillePatterns.length > 0) {
      const svgString = BrailleRenderer.renderToSVG(braillePatterns, renderOptions);
      BrailleRenderer.svgToDownload(svgString, 'braille-output');
    }
  };

  const handleRenderOptionChange = (option: keyof RenderOptions) => (event: any, value?: any) => {
    setRenderOptions(prev => ({
      ...prev,
      [option]: value !== undefined ? value : event.target.value
    }));
  };

  // 브라우저 음성 읽기 (접근성 기능)
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'korean' ? 'ko-KR' : 
                      language === 'japanese' ? 'ja-JP' : 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* 헤더 */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom
          sx={{ 
            fontWeight: 'bold',
            color: 'primary.main',
            mb: 2
          }}
        >
          <Accessibility sx={{ fontSize: '1.2em', mr: 2, verticalAlign: 'middle' }} />
          점자 변환기
        </Typography>
        <Typography 
          variant="h6" 
          color="text.secondary"
          sx={{ mb: 3 }}
        >
          한글, 영어, 일본어 텍스트를 표준 점자로 변환합니다
        </Typography>
        
        {/* 접근성 정보 */}
        <Alert 
          severity="info" 
          sx={{ 
            mt: 2, 
            textAlign: 'left',
            '& .MuiAlert-message': { width: '100%' }
          }}
        >
          <Typography variant="body2">
            <strong>접근성 안내:</strong> 이 도구는 스크린 리더와 완전히 호환됩니다. 
            Tab 키로 탐색하고, 음성 읽기 버튼으로 텍스트를 들을 수 있습니다.
          </Typography>
        </Alert>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {/* 입력 섹션 */}
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 45%' } }}>
          <Paper 
            elevation={2} 
            sx={{ p: 3 }}
            role="region"
            aria-labelledby="input-section-title"
          >
            <Typography 
              id="input-section-title"
              variant="h5" 
              component="h2" 
              gutterBottom
              sx={{ display: 'flex', alignItems: 'center', mb: 3 }}
            >
              텍스트 입력
              <Tooltip title="입력한 텍스트 음성으로 듣기">
                <IconButton 
                  onClick={() => speakText(inputText)}
                  disabled={!inputText.trim()}
                  aria-label="입력 텍스트 음성으로 듣기"
                  sx={{ ml: 1 }}
                >
                  <VolumeUp />
                </IconButton>
              </Tooltip>
            </Typography>

            <TextField
              id="text-input"
              label="변환할 텍스트를 입력하세요"
              multiline
              rows={8}
              fullWidth
              value={inputText}
              onChange={handleInputChange}
              placeholder="예: 안녕하세요, Hello, こんにちは"
              helperText="한글, 영어, 일본어를 지원합니다"
              sx={{ mb: 3 }}
              inputProps={{
                'aria-describedby': 'input-help-text',
                maxLength: 5000
              }}
            />

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel id="language-select-label">언어 선택</InputLabel>
              <Select
                labelId="language-select-label"
                id="language-select"
                value={language}
                label="언어 선택"
                onChange={handleLanguageChange}
                aria-describedby="language-help-text"
              >
                <MenuItem value="auto">자동 감지</MenuItem>
                <MenuItem value="korean">한국어</MenuItem>
                <MenuItem value="english">영어</MenuItem>
                <MenuItem value="japanese">일본어</MenuItem>
              </Select>
              <Typography 
                id="language-help-text"
                variant="caption" 
                color="text.secondary"
                sx={{ mt: 1 }}
              >
                {detectedLanguage && language === 'auto' && 
                  `감지된 언어: ${detectedLanguage}`}
              </Typography>
            </FormControl>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                startIcon={<Clear />}
                onClick={handleClear}
                disabled={!inputText.trim()}
                aria-label="입력 텍스트 지우기"
              >
                지우기
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<Settings />}
                onClick={() => setShowSettings(!showSettings)}
                aria-label="렌더링 설정 열기/닫기"
                aria-expanded={showSettings}
                aria-controls="settings-panel"
              >
                설정
              </Button>
            </Box>
          </Paper>
        </Box>

        {/* 출력 섹션 */}
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 45%' } }}>
          <Paper 
            elevation={2} 
            sx={{ p: 3 }}
            role="region"
            aria-labelledby="output-section-title"
          >
            <Typography 
              id="output-section-title"
              variant="h5" 
              component="h2" 
              gutterBottom
              sx={{ mb: 3 }}
            >
              점자 출력
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {braillePatterns.length > 0 && (
              <>
                {/* 점자 유니코드 텍스트 */}
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>
                      점자 텍스트 (유니코드):
                    </Typography>
                    <Typography 
                      variant="h4" 
                      component="div"
                      sx={{ 
                        fontFamily: 'monospace',
                        letterSpacing: '0.1em',
                        lineHeight: 1.5,
                        wordBreak: 'break-all',
                        border: '1px solid #e0e0e0',
                        p: 2,
                        backgroundColor: '#f9f9f9',
                        minHeight: '60px'
                      }}
                      aria-label="생성된 점자 텍스트"
                      role="textbox"
                      tabIndex={0}
                    >
                      {braillePatterns.map((pattern, index) => pattern.unicode).join('')}
                    </Typography>
                  </CardContent>
                </Card>

                {/* 점자 이미지 */}
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>
                      점자 이미지:
                    </Typography>
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        justifyContent: 'center',
                        border: '1px solid #e0e0e0',
                        backgroundColor: renderOptions.backgroundColor,
                        p: 2,
                        borderRadius: 1
                      }}
                    >
                      <canvas
                        ref={canvasRef}
                        style={{ 
                          maxWidth: '100%',
                          height: 'auto',
                          border: '1px solid #ddd'
                        }}
                        aria-label="점자 이미지 출력"
                        role="img"
                      />
                    </Box>
                  </CardContent>
                  
                  <CardActions sx={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Button
                        variant="contained"
                        startIcon={<Download />}
                        onClick={handleDownloadPNG}
                        size="small"
                        aria-label="점자 이미지를 PNG 파일로 다운로드"
                      >
                        PNG 다운로드
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<Download />}
                        onClick={handleDownloadSVG}
                        size="small"
                        aria-label="점자 이미지를 SVG 파일로 다운로드"
                      >
                        SVG 다운로드
                      </Button>
                    </Box>
                    
                    <Chip
                      icon={<Info />}
                      label={`${braillePatterns.filter(p => p.dots.length > 0).length}개 문자 변환됨`}
                      size="small"
                      variant="outlined"
                    />
                  </CardActions>
                </Card>
              </>
            )}

            {braillePatterns.length === 0 && !error && (
              <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
                <Typography variant="body1">
                  텍스트를 입력하면 점자로 변환됩니다
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>
      </Box>

      {/* 설정 패널 */}
      {showSettings && (
        <Paper 
          elevation={2} 
          sx={{ p: 3, mt: 3 }}
          id="settings-panel"
          role="region"
          aria-labelledby="settings-title"
        >
          <Typography 
            id="settings-title"
            variant="h5" 
            component="h2" 
            gutterBottom
          >
            렌더링 설정
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 300px' } }}>
              <Typography gutterBottom>셀 크기</Typography>
              <Typography variant="caption" color="text.secondary">너비</Typography>
              <Slider
                value={renderOptions.cellWidth}
                min={20}
                max={80}
                onChange={handleRenderOptionChange('cellWidth')}
                aria-label="점자 셀 너비"
                valueLabelDisplay="auto"
              />
              <Typography variant="caption" color="text.secondary">높이</Typography>
              <Slider
                value={renderOptions.cellHeight}
                min={30}
                max={120}
                onChange={handleRenderOptionChange('cellHeight')}
                aria-label="점자 셀 높이"
                valueLabelDisplay="auto"
              />
            </Box>

            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 300px' } }}>
              <Typography gutterBottom>점 설정</Typography>
              <Typography variant="caption" color="text.secondary">점 크기</Typography>
              <Slider
                value={renderOptions.dotRadius}
                min={1}
                max={8}
                onChange={handleRenderOptionChange('dotRadius')}
                aria-label="점자 점 크기"
                valueLabelDisplay="auto"
              />
              <Typography variant="caption" color="text.secondary">줄 간격</Typography>
              <Slider
                value={renderOptions.lineSpacing}
                min={5}
                max={50}
                onChange={handleRenderOptionChange('lineSpacing')}
                aria-label="줄 간격"
                valueLabelDisplay="auto"
              />
            </Box>

            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 300px' } }}>
              <Typography gutterBottom>기타</Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={renderOptions.showGrid}
                    onChange={(e) => handleRenderOptionChange('showGrid')(e, e.target.checked)}
                    aria-label="격자 표시 여부"
                  />
                }
                label="격자 표시"
              />
              <Box sx={{ mt: 2 }}>
                <TextField
                  label="배경색"
                  type="color"
                  value={renderOptions.backgroundColor}
                  onChange={handleRenderOptionChange('backgroundColor')}
                  size="small"
                  sx={{ mr: 1 }}
                  inputProps={{ 'aria-label': '배경색 선택' }}
                />
                <TextField
                  label="점 색상"
                  type="color"
                  value={renderOptions.dotColor}
                  onChange={handleRenderOptionChange('dotColor')}
                  size="small"
                  inputProps={{ 'aria-label': '점 색상 선택' }}
                />
              </Box>
            </Box>
          </Box>
        </Paper>
      )}
    </Container>
  );
};

export default BrailleConverter;