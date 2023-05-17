import styled from 'styled-components';
import Logo from '../components/Logo';
import ViewWrapper from './ViewWrapper';

const FancyLink = styled.a`
  color: ${({ theme }) => theme.colors.accentPrimary};
  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.accentPrimary};
    border-radius: 4px;
  }
`;

function About () {
  return (
    <ViewWrapper>
      <Logo size={128} />
      <p>
        eq+ is and always will be <FancyLink href="https://github.com/pulse0ne/eqplus" target="_blank" rel="noreferrer">open source</FancyLink>. I welcome feedback and feature requests.
      </p>
      <p>
        - Tyler
      </p>
    </ViewWrapper>
  );
}

export default About;
