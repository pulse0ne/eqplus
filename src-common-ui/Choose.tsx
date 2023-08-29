import styled from 'styled-components';

export const NativeSelect = styled.select`
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: 0.3em;
  border-radius: 4px;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.textPrimary};
  min-width: 100px;
  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.accentPrimary};
    outline-offset: -2px;
  }
`;
