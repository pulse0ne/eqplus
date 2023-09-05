
export type IconProps = {
  glyph: string,
  size?: number
};

function Icon ({
  glyph,
  size = 16
}: IconProps) {
  return (
    <i className={`eqplus ${glyph}`} style={{ fontSize: `${size}px` }}></i>
  );
}

export { Icon };
