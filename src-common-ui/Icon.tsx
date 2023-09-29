import { DetailedHTMLProps, HTMLAttributes } from 'react';
import { useTheme } from 'styled-components';

export type IconProps = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
  glyph: string,
  size?: number
};

function Icon ({
  glyph,
  size = 16,
  onClick,
  style,
  className
}: IconProps) {
  return (
    <i
      className={`eqplus ${glyph} themed ${className ?? 'text'}`}
      style={{ fontSize: `${size}px`, ...style }}
      onClick={onClick}
    />
  );
}

export type IconButtonProps = IconProps & { disabled?: boolean };

function IconButton({
  glyph,
  size = 16,
  onClick,
  style,
  disabled = false
}: IconButtonProps) {
  const theme = useTheme();
  return (
    <Icon
      glyph={glyph}
      size={size}
      onClick={onClick}
      style={{
        color: disabled ? theme.colors.disabled : theme.colors.accentPrimary,
        cursor: disabled ? 'default' : 'pointer',
        ...style
      }}
      className="accentPrimary disabled"
    />
  );
}

export { Icon, IconButton };
