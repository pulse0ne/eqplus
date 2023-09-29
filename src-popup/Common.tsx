import styled from 'styled-components';

const IndicatorLayer = styled.div`
  z-index: 999;
  position: absolute;
  right: 0;
  top: 0;
  left: 0;
  bottom: 0;
`;

const TextOverflowClip = styled.div`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: clip;
`;

export {
  IndicatorLayer,
  TextOverflowClip
};
