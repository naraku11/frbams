import React from 'react';
import Svg, { Circle, Ellipse, Path, Rect } from 'react-native-svg';

interface IconProps { size?: number; color?: string; strokeWidth?: number; }

const icon = (
  content: (c: string, sw: number) => React.ReactNode,
) => ({ size = 24, color = 'currentColor', strokeWidth = 1.8 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {content(color, strokeWidth)}
  </Svg>
);

const sharedProps = (color: string, sw: number) => ({
  stroke: color, strokeWidth: sw, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
});

export const HomeIcon = icon((c, sw) => (
  <>
    <Path d="M3 11.5L12 4l9 7.5" {...sharedProps(c, sw)} />
    <Path d="M5 10v10h14V10" {...sharedProps(c, sw)} />
  </>
));

export const CalIcon = icon((c, sw) => (
  <>
    <Rect x="3" y="5" width="18" height="16" rx="2" {...sharedProps(c, sw)} />
    <Path d="M3 9h18M8 3v4M16 3v4" {...sharedProps(c, sw)} />
  </>
));

export const FaceIcon = icon((c, sw) => (
  <>
    <Circle cx="12" cy="12" r="9" {...sharedProps(c, sw)} />
    <Circle cx="9" cy="10" r="0.6" fill={c} {...sharedProps(c, sw)} />
    <Circle cx="15" cy="10" r="0.6" fill={c} {...sharedProps(c, sw)} />
    <Path d="M9 15c1 1 4 1 6 0" {...sharedProps(c, sw)} />
  </>
));

export const LogIcon = icon((c, sw) => (
  <>
    <Rect x="4" y="3" width="16" height="18" rx="2" {...sharedProps(c, sw)} />
    <Path d="M8 8h8M8 12h8M8 16h5" {...sharedProps(c, sw)} />
  </>
));

export const UsersIcon = icon((c, sw) => (
  <>
    <Circle cx="9" cy="8" r="3.5" {...sharedProps(c, sw)} />
    <Path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" {...sharedProps(c, sw)} />
    <Circle cx="17" cy="9" r="2.5" {...sharedProps(c, sw)} />
    <Path d="M21 19c0-2.5-1.8-4.5-4-4.5" {...sharedProps(c, sw)} />
  </>
));

export const CheckIcon = icon((c, sw) => (
  <Path d="M5 12l5 5L20 7" {...sharedProps(c, sw)} />
));

export const ArrowIcon = icon((c, sw) => (
  <Path d="M5 12h14M13 6l6 6-6 6" {...sharedProps(c, sw)} />
));

export const XIcon = icon((c, sw) => (
  <Path d="M6 6l12 12M18 6L6 18" {...sharedProps(c, sw)} />
));

export const LocationIcon = icon((c, sw) => (
  <>
    <Path d="M12 21s-7-7.5-7-12a7 7 0 1 1 14 0c0 4.5-7 12-7 12z" {...sharedProps(c, sw)} />
    <Circle cx="12" cy="9" r="2.5" {...sharedProps(c, sw)} />
  </>
));

export const WifiOffIcon = icon((c, sw) => (
  <>
    <Path d="M2 9a16 16 0 0 1 20 0M5 13a11 11 0 0 1 5-3" {...sharedProps(c, sw)} />
    <Path d="M21 4 L3 22" {...sharedProps(c, sw)} />
  </>
));

export const ClockIcon = icon((c, sw) => (
  <>
    <Circle cx="12" cy="12" r="9" {...sharedProps(c, sw)} />
    <Path d="M12 8v5l3 2" {...sharedProps(c, sw)} />
  </>
));

export const BellIcon = icon((c, sw) => (
  <>
    <Path d="M6 8a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6" {...sharedProps(c, sw)} />
    <Path d="M10 19a2 2 0 0 0 4 0" {...sharedProps(c, sw)} />
  </>
));

export const LeaveIcon = icon((c, sw) => (
  <Path d="M9 4h6v4l3-1v3l-3-1v8l-3-2-3 2V9L6 10V7l3 1z" {...sharedProps(c, sw)} />
));

export const ChevronRightIcon = icon((c, sw) => (
  <Path d="M9 18l6-6-6-6" {...sharedProps(c, sw)} />
));

export const ScanFaceIcon = ({ size = 64, color = '#fff' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    {/* Corner brackets */}
    <Path d="M8 20 L8 8 L20 8" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M44 8 L56 8 L56 20" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M56 44 L56 56 L44 56" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M20 56 L8 56 L8 44" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    {/* Face */}
    <Ellipse cx="32" cy="30" rx="12" ry="14" stroke={color} strokeWidth="2" opacity={0.5}/>
    <Circle cx="27" cy="27" r="1.5" fill={color} opacity={0.8}/>
    <Circle cx="37" cy="27" r="1.5" fill={color} opacity={0.8}/>
    <Path d="M27 35c2 2 8 2 10 0" stroke={color} strokeWidth="2" strokeLinecap="round" opacity={0.8}/>
  </Svg>
);
