import styled from 'styled-components';

const Button = styled.button`
  border: none;
  border-radius: 4px;
  box-shadow: ${({ theme }) => theme.misc.boxShadow};
  padding: 6px 10px;
  background-color: ${({ theme }) => theme.colors.accentSecondary};
`;

const ToggleButton = styled(Button)<{ active: boolean }>`
  background-color: ${({ theme, active }) => active ? theme.colors.accentPrimary : theme.colors.accentSecondary};
`;

export { Button, ToggleButton };
