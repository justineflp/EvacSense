import React from 'react';

function IconShell({ size = 20, title, children, viewBox = '0 0 24 24', ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden={title ? undefined : 'true'}
      role={title ? 'img' : 'presentation'}
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

export function EvacSenseMark({ size = 56 }) {
  return (
    <IconShell size={size} viewBox="0 0 96 96" title="EvacSense logo">
      <defs>
        <linearGradient id="evacsense-brand-shield" x1="16" y1="10" x2="78" y2="86" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0F4C81" />
          <stop offset="100%" stopColor="#0A2342" />
        </linearGradient>
        <linearGradient id="evacsense-brand-path" x1="20" y1="52" x2="60" y2="86" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#23C7E8" />
          <stop offset="100%" stopColor="#00B8D9" />
        </linearGradient>
      </defs>
      <path
        d="M48 8L76 20V47C76 65.5 64.2 79.7 48 88C31.8 79.7 20 65.5 20 47V20L48 8Z"
        stroke="url(#evacsense-brand-shield)"
        strokeWidth="6"
        strokeLinejoin="round"
      />
      <path
        d="M48 23C38.1 23 29.7 29.4 26 38"
        stroke="#1E88E5"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M48 33C42 33 36.9 36.7 34.6 42"
        stroke="#1E88E5"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M48 54C44.1 54 41 50.9 41 47C41 43.1 44.1 40 48 40C51.9 40 55 43.1 55 47C55 50.9 51.9 54 48 54Z"
        fill="#1E88E5"
      />
      <path
        d="M29 66C33.8 60.7 40.2 58.3 47.5 58.3C54.7 58.3 60.4 60.2 66 65.2C68.9 67.7 70.8 70.5 72.4 73.5L48 88C41.2 84.6 35.3 79.8 31.1 73.5C29.2 70.7 28.4 68.4 29 66Z"
        fill="url(#evacsense-brand-path)"
      />
      <path
        d="M65.2 53.2L69 57L77 49"
        stroke="#18A058"
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="69" cy="56" r="8.5" fill="#18A058" opacity="0.15" />
    </IconShell>
  );
}

export function KeyIcon(props) {
  return (
    <IconShell {...props}>
      <circle cx="9.5" cy="14.5" r="3.5" stroke="currentColor" strokeWidth="2" />
      <path d="M12.5 14.5H21L18.5 17H16.5V19H14.5V21H12.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16.5 14.5V17.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </IconShell>
  );
}

export function StandbyIcon(props) {
  return (
    <IconShell {...props}>
      <path d="M12 3V9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M7.2 5.2A8 8 0 1 0 16.8 5.2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="14" r="1.6" fill="currentColor" />
    </IconShell>
  );
}

export function PlayIcon(props) {
  return (
    <IconShell {...props}>
      <path d="M9 7L18 12L9 17V7Z" fill="currentColor" />
    </IconShell>
  );
}

export function StopIcon(props) {
  return (
    <IconShell {...props}>
      <rect x="7" y="7" width="10" height="10" rx="2" fill="currentColor" />
    </IconShell>
  );
}

export function ChartIcon(props) {
  return (
    <IconShell {...props}>
      <path d="M5 19V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M5 19H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 15L12 11L15 13L19 8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="8" cy="15" r="1.2" fill="currentColor" />
      <circle cx="12" cy="11" r="1.2" fill="currentColor" />
      <circle cx="15" cy="13" r="1.2" fill="currentColor" />
      <circle cx="19" cy="8" r="1.2" fill="currentColor" />
    </IconShell>
  );
}

export function ReportIcon(props) {
  return (
    <IconShell {...props}>
      <path d="M7 3H15L19 7V21H7V3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M15 3V7H19" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M10 11H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 15H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 8H12.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </IconShell>
  );
}

export function BuildingIcon(props) {
  return (
    <IconShell {...props}>
      <path d="M4 20H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <rect x="6" y="5" width="12" height="15" rx="1.5" stroke="currentColor" strokeWidth="2" />
      <path d="M10 20V16H14V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M9 8H11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M13 8H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M9 11H11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M13 11H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </IconShell>
  );
}

export function WarningIcon(props) {
  return (
    <IconShell {...props}>
      <path d="M12 4L22 20H2L12 4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M12 9V13" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="12" cy="16.5" r="1.3" fill="currentColor" />
    </IconShell>
  );
}

export function RefreshIcon(props) {
  return (
    <IconShell {...props}>
      <path d="M20 12a8 8 0 0 0-13.5-5.7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M6 5.5V9H9.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 12a8 8 0 0 0 13.5 5.7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M18 18.5V15H14.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </IconShell>
  );
}

export function ClipboardIcon(props) {
  return (
    <IconShell {...props}>
      <path d="M9 4H15C15.55 4 16 4.45 16 5V6H8V5C8 4.45 8.45 4 9 4Z" stroke="currentColor" strokeWidth="2" />
      <path d="M7 6H17V20H7V6Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M10 10H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 13H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 16H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </IconShell>
  );
}

export function LinkIcon(props) {
  return (
    <IconShell {...props}>
      <path d="M8.5 15.5L6.5 17.5C5.1 18.9 5.1 21.1 6.5 22.5C7.9 23.9 10.1 23.9 11.5 22.5L13.5 20.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15.5 8.5L17.5 6.5C18.9 5.1 21.1 5.1 22.5 6.5C23.9 7.9 23.9 10.1 22.5 11.5L20.5 13.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 15L15 9" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </IconShell>
  );
}

export function DownloadIcon(props) {
  return (
    <IconShell {...props}>
      <path d="M12 4V14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M8 10L12 14L16 10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 18H19" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </IconShell>
  );
}

export function PrintIcon(props) {
  return (
    <IconShell {...props}>
      <path d="M7 9V4H17V9" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <rect x="5" y="9" width="14" height="8" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M8 15H16V20H8V15Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M8.5 12H8.5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </IconShell>
  );
}

export function LocationIcon(props) {
  return (
    <IconShell {...props}>
      <path d="M12 21C12 21 6 15.6 6 11C6 7.7 8.7 5 12 5C15.3 5 18 7.7 18 11C18 15.6 12 21 12 21Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="12" cy="11" r="2.2" fill="currentColor" />
    </IconShell>
  );
}

export function DistressIcon(props) {
  return (
    <IconShell {...props}>
      <path d="M12 3V8" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M7.2 5.2A8 8 0 0 0 4 11.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M16.8 5.2A8 8 0 0 1 20 11.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M12 13V13.1" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" />
      <circle cx="12" cy="18" r="1.2" fill="currentColor" />
    </IconShell>
  );
}

export function DotIcon(props) {
  return (
    <IconShell {...props} viewBox="0 0 8 8">
      <circle cx="4" cy="4" r="3" fill="currentColor" />
    </IconShell>
  );
}
