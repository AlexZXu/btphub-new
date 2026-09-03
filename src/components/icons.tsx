// Stroke icons lifted from the design canvas (24px grid).
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function base(size: number, props: Omit<IconProps, "size">, children: React.ReactNode) {
  const { stroke = "black", strokeWidth = 1.5, ...rest } = props;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const HomeIcon = ({ size = 24, ...p }: IconProps) =>
  base(size, p, <><path d="M3 11l9-8 9 8" /><path d="M5 9.5V21h14V9.5" /></>);

export const BookmarkIcon = ({ size = 24, ...p }: IconProps) =>
  base(size, p, <path d="M6 3h13v18l-6.5-4L6 21V3z" />);

export const PencilIcon = ({ size = 24, ...p }: IconProps) =>
  base(size, p, <><path d="M4 20l1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L8 19l-4 1z" /><path d="M14.5 6.5l3 3" /></>);

export const BellIcon = ({ size = 24, ...p }: IconProps) =>
  base(size, p, <><path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6z" /><path d="M10 19a2 2 0 0 0 4 0" /></>);

export const CalendarIcon = ({ size = 24, ...p }: IconProps) =>
  base(size, p, <><rect x="3.5" y="5" width="17" height="16" rx="2" /><path d="M8 2.5V7M16 2.5V7" /></>);

export const PersonIcon = ({ size = 24, ...p }: IconProps) =>
  base(size, p, <><circle cx="12" cy="8" r="3.5" /><path d="M4.5 21c.8-4 3.8-6 7.5-6s6.7 2 7.5 6" /></>);

export const GearIcon = ({ size = 24, ...p }: IconProps) =>
  base(size, p, <><circle cx="12" cy="12" r="3" /><path d="M12 2.8l1 2.6 2.7-.6 1 2.5 2.6 1-.6 2.7 2 1.9-2 1.9.6 2.7-2.6 1-1 2.5-2.7-.6-1 2.6-1-2.6-2.7.6-1-2.5-2.6-1 .6-2.7-2-1.9 2-1.9-.6-2.7 2.6-1 1-2.5 2.7.6 1-2.6z" /></>);

export const OpenIcon = ({ size = 19, ...p }: IconProps) =>
  base(size, { strokeWidth: 2, ...p }, <path d="M14 4h6v6M20 4l-9 9M9 5H5v14h14v-4" />);

export const PeopleIcon = ({ size = 24, ...p }: IconProps) =>
  base(size, p, <><circle cx="9" cy="8" r="3" /><path d="M3 20c.7-3.4 3-5 6-5s5.3 1.6 6 5" /><circle cx="17" cy="9" r="2.4" /><path d="M15.8 15.2c2.7.2 4.6 1.7 5.2 4.8" /></>);

export const ListIcon = ({ size = 24, ...p }: IconProps) =>
  base(size, p, <><path d="M8 6h13M8 12h13M8 18h13" /><path d="M3.5 6h.5M3.5 12h.5M3.5 18h.5" /></>);

export const CloseIcon = ({ size = 20, ...p }: IconProps) =>
  base(size, { stroke: "#1a1a1a", strokeWidth: 2, ...p }, <path d="M6 6l12 12M18 6L6 18" />);

export const EyeIcon = ({ size = 24, ...p }: IconProps) =>
  base(size, { stroke: "#363636", strokeWidth: 1.7, ...p }, <><path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12z" /><circle cx="12" cy="12" r="2.8" /></>);

export const EyeOffIcon = ({ size = 24, ...p }: IconProps) =>
  base(size, { stroke: "currentColor", strokeWidth: 1.7, ...p }, <><path d="M3 3l18 18" /><path d="M10.6 5.1A10.9 10.9 0 0 1 12 5c6.5 0 10 7 10 7a17.6 17.6 0 0 1-2.7 3.6M6.6 6.6C3.7 8.6 2 12 2 12s3.5 6.5 10 6.5c1.5 0 2.9-.35 4.1-.9" /><path d="M9.9 9.9a2.8 2.8 0 0 0 4 4" /></>);

export const CheckSmallIcon = ({ size = 14, ...p }: IconProps) =>
  base(size, { stroke: "currentColor", strokeWidth: 2.2, ...p }, <path d="M4.5 12.5l4.5 4.5 10-11" />);

export const DotIcon = ({ size = 14, ...p }: IconProps) =>
  base(size, { stroke: "currentColor", strokeWidth: 2, ...p }, <circle cx="12" cy="12" r="4" />);

export const ChevronDownIcon = ({ size = 10, ...p }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 10 10" fill="none" stroke="#8C8C8C" strokeWidth={1.5} {...p}>
    <path d="M2 3.5l3 3 3-3" />
  </svg>
);

export const CheckCircleIcon = ({ size = 200, ...p }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="#A4B083" {...p}>
    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
    <path d="m10.97 4.97-.02.022-3.473 4.425-2.093-2.094a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05" />
  </svg>
);

export const HandshakeIcon = ({ size = 170, ...p }: IconProps) =>
  base(size, { stroke: "#3a3a3a", strokeWidth: 0.9, ...p }, <><path d="M8.5 6.5h8a5 5 0 0 1 5 5V17h-13" /><path d="M3.5 17v-5.5a5 5 0 0 1 5-5 5 5 0 0 1 5 5V17h-10z" /><path d="M6 21v-4M18 6.5V4h2.5" /><path d="M10 11.5h2" /></>);

export const CareIcon = ({ size = 60, ...p }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="white" {...p}>
    <circle cx="9" cy="6.5" r="2.6" />
    <circle cx="17" cy="8" r="2.1" />
    <path d="M4.5 21v-6c0-2.5 2-4.4 4.5-4.4s4.5 1.9 4.5 4.4v6h-9z" />
    <path d="M14.8 21v-4.6c0-1.9 1-3.3 2.7-3.3 1.6 0 2.7 1.4 2.7 3.3V21h-5.4z" />
  </svg>
);

export const JobsIcon = ({ size = 60, ...p }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="white" {...p}>
    <path d="M12 2.5a4 4 0 0 1 4 4c0 2.2-1.8 4-4 4s-4-1.8-4-4a4 4 0 0 1 4-4z" />
    <path d="M4 21.5v-2c0-3 3.6-5 8-5s8 2 8 5v2H4z" />
  </svg>
);
