import { useLocation } from 'react-router-dom';
import { VBox } from '../components/FlexBox';

function ViewWrapper ({ children }: React.PropsWithChildren) {
  const location = useLocation();
  const label = location.pathname === '/' ? 'EQUALIZER' : location.pathname.replaceAll('/', '').toUpperCase();
  return (
    <VBox>
      <h1>{label}</h1>
      {children}
    </VBox>
  );
}

export default ViewWrapper;
