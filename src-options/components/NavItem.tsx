import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import Icon from './Icon';
import { HBox } from './FlexBox';

const RootNavLink = styled(NavLink)`
  text-decoration: none;
  color: ${({ theme }) => theme.colors.textPrimary};
  padding: 8px;
  border-radius: 4px;
  border: 2px solid transparent;

  &.active{
    background: ${({ theme }) => theme.colors.accentPrimary};
    color: ${({ theme }) => theme.colors.background};
  }

  &:hover {
    border: 2px solid ${({ theme }) => theme.colors.accentPrimary};
  }

  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.accentPrimary};
    outline-offset: -2px;
  }
`;

const NavLabel = styled.span`
  font-weight: bold;
  margin-left: 8px;
  text-transform: uppercase;
`;

export type NavItemProps = {
  label: string,
  glyph: string,
  path: string
};

function NavItem ({
  label,
  glyph,
  path
}: NavItemProps) {
  return (
    <RootNavLink to={path}>
      <HBox alignItems="center">
        <Icon glyph={glyph} />
        <NavLabel>{label}</NavLabel>
      </HBox>
    </RootNavLink>
  );
}

export default NavItem;
