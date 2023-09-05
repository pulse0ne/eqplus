import { useLocation } from 'react-router-dom';
import { HBox, HSpacer, Logo } from '../../src-common-ui';
import styled, { useTheme } from 'styled-components';

const HeaderWrapper = styled(HBox)`
  background-color: ${({ theme }) => theme.colors.surface};
  padding-left: 8px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

function Header() {
  const location = useLocation();
  const { colors } = useTheme();
  const label = location.pathname === '/' ? 'EQUALIZER' : location.pathname.replaceAll('/', '').toUpperCase();
  return (
    <HeaderWrapper alignItems="center">
      <Logo size={32} fill={colors.textPrimary} />
      <HSpacer size={8} />
      <h1>{label}</h1>
    </HeaderWrapper>
  );
}

export default Header;
