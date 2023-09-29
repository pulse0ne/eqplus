import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  * {
    box-sizing: border-box;
  }

  #root,
  body,
  html {
    width: 800px;
    height: 600px;
    margin: 0;
    padding: 0;
    font-family: 'Open Sans', sans-serif;
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
    overscroll-behavior: none;
  }
`;

export default GlobalStyles;