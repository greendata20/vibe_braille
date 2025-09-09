import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import BrailleConverter from './components/BrailleConverterSimple';

// 접근성을 고려한 테마 설정
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontSize: 16, // 기본 폰트 크기 증가 (접근성)
    h1: {
      fontSize: '2.5rem',
    },
    h2: {
      fontSize: '2rem',
    },
    h3: {
      fontSize: '1.75rem',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.9rem',
      lineHeight: 1.5,
    },
  },
  components: {
    // 버튼 접근성 향상
    MuiButton: {
      styleOverrides: {
        root: {
          minHeight: 44, // 터치 대상 최소 크기
          fontSize: '1rem',
          fontWeight: 500,
        },
      },
    },
    // 텍스트 필드 접근성 향상
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputBase-root': {
            fontSize: '1rem',
            minHeight: 44,
          },
        },
      },
    },
    // 포커스 표시 개선
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderWidth: 3,
          },
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="App">
        <BrailleConverter />
      </div>
    </ThemeProvider>
  );
}

export default App;
