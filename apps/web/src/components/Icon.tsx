import type { ComponentType, SVGProps } from "react";

type IconProps = Omit<
  SVGProps<SVGSVGElement>,
  "children" | "width" | "height" | "aria-label" | "aria-hidden" | "role"
> & {
  component: ComponentType<SVGProps<SVGSVGElement>>;
  size?: number;
  label?: string;
};

export default function Icon({
  component: SvgIcon,
  size = 24,
  label,
  ...props
}: IconProps) {
  return (
    <SvgIcon
      fill="currentColor"
      {...props}
      width={size}
      height={size}
      focusable="false"
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? "img" : undefined}
    />
  );
}
