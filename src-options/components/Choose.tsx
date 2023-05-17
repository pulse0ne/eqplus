import { useCallback, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import Icon from './Icon';

const ChooseWrapper = styled.div<{disabled?: boolean, show: boolean}>`
  cursor: deafult;
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: 0.3em 0 0.3em 0.75em;
  border-radius: 4px;
  position: relative;
  background-color: ${({ theme }) => theme.colors.background};
  transition: all ${({ theme }) => theme.misc.transition};
  filter: ${({ disabled }) => disabled ? 'brightness(125%)' : null};
  border-color: ${({ show }) => show ? 'transparent' : null};
`;

const ChooseDisplay = styled.div`
  display: flex;
  align-items: center;
`;

const ChoosePopup = styled.div`
  position: absolute;
  padding: 2px;
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  z-index: 999;
  box-shadow: ${({ theme }) => theme.misc.boxShadow};
`;

const ChooseOption = styled.div`
  padding: 0.25em 0;
  text-align: center;

  &:hover {
    background-color: ${({ theme }) => theme.colors.accentPrimary};
    color: ${({ theme }) => theme.colors.background};
  }
`;

export type ChooseOption = {
  icon?: string,
  text?: string,
  title?: string,
  value: string
};

type ChooseProps = {
  selected: ChooseOption,
  options: ChooseOption[],
  direction?: 'down'|'up',
  disabled?: boolean,
  onSelected: (value: ChooseOption) => void
};

function Choose({
  selected,
  options,
  direction = 'down',
  disabled = false,
  onSelected
}: ChooseProps) {
  const [ show, setShow ] = useState(false);
  const chooseRef = useRef<HTMLDivElement>(null);

  const optionSelected = useCallback((option: ChooseOption) => {
    if (disabled) return;
    onSelected(option);
    setShow(false);
  }, [disabled, onSelected]);

  const popupStyle = useMemo(() => {
    const s: React.CSSProperties = {
      left: 0,
      width: '100%',
      textAlign: (options.length && options[0].icon) ? 'center' : 'left'
    };
    if (direction === 'up') {
      s.bottom = 0;
    } else {
      s.top = 0;
    }
    return s;
  }, [options, direction]);

  return (
    <ChooseWrapper show={show} disabled={disabled}>
      <ChooseDisplay onClick={() => !disabled && setShow(ov => !ov)}>
        {selected.icon && <i className={selected.icon}></i>}
        {selected.text && <span>{selected.text}</span>}
        <Icon glyph="arrow_drop_down" />
      </ChooseDisplay>
      {show && <ChoosePopup style={popupStyle} ref={chooseRef}>
        {options.map(opt => (
          <ChooseOption key={opt.value} className="option" onClick={() => optionSelected(opt)} title={opt.title}>
            {opt.icon && <i className={opt.icon}></i>}
            {opt.text && <span>{opt.text}</span>}
          </ChooseOption>
        ))}
      </ChoosePopup>}
    </ChooseWrapper>
  );
}

export default Choose;
