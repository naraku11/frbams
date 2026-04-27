// icons.jsx — minimal stroke icon set
import React from 'react'

export const Ico = ({ children, size = 16, stroke = 1.6 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0, display:"block"}}>
    {children}
  </svg>
);

export const I = {
  Home:    (p) => <Ico {...p}><path d="M3 11.5L12 4l9 7.5"/><path d="M5 10v10h14V10"/></Ico>,
  Camera:  (p) => <Ico {...p}><rect x="3" y="6" width="18" height="14" rx="2"/><circle cx="12" cy="13" r="4"/><path d="M8 6l1.5-2h5L16 6"/></Ico>,
  Users:   (p) => <Ico {...p}><circle cx="9" cy="8" r="3.5"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.5"/><path d="M21 19c0-2.5-1.8-4.5-4-4.5"/></Ico>,
  Log:     (p) => <Ico {...p}><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></Ico>,
  Chart:   (p) => <Ico {...p}><path d="M4 20V10"/><path d="M10 20V4"/><path d="M16 20v-7"/><path d="M22 20H2"/></Ico>,
  Bell:    (p) => <Ico {...p}><path d="M6 8a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6"/><path d="M10 19a2 2 0 0 0 4 0"/></Ico>,
  Settings:(p) => <Ico {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5h0a1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></Ico>,
  Search:  (p) => <Ico {...p}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></Ico>,
  Plus:    (p) => <Ico {...p}><path d="M12 5v14M5 12h14"/></Ico>,
  Check:   (p) => <Ico {...p}><path d="M5 12l5 5L20 7"/></Ico>,
  X:       (p) => <Ico {...p}><path d="M6 6l12 12M18 6L6 18"/></Ico>,
  Arrow:   (p) => <Ico {...p}><path d="M5 12h14M13 6l6 6-6 6"/></Ico>,
  Down:    (p) => <Ico {...p}><path d="M6 9l6 6 6-6"/></Ico>,
  Filter:  (p) => <Ico {...p}><path d="M3 5h18l-7 9v6l-4-2v-4z"/></Ico>,
  Export:  (p) => <Ico {...p}><path d="M12 16V4M7 9l5-5 5 5"/><path d="M5 20h14"/></Ico>,
  Cal:     (p) => <Ico {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></Ico>,
  Leave:   (p) => <Ico {...p}><path d="M9 4h6v4l3-1v3l-3-1v8l-3-2-3 2V9L6 10V7l3 1z"/></Ico>,
  Dot:     (p) => <Ico {...p}><circle cx="12" cy="12" r="4" fill="currentColor"/></Ico>,
  Sun:     (p) => <Ico {...p}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></Ico>,
  Moon:    (p) => <Ico {...p}><path d="M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z"/></Ico>,
  Wifi:    (p) => <Ico {...p}><path d="M2 9a16 16 0 0 1 20 0"/><path d="M5 13a11 11 0 0 1 14 0"/><path d="M9 17a6 6 0 0 1 6 0"/><circle cx="12" cy="20" r="0.5" fill="currentColor"/></Ico>,
  Battery: (p) => <Ico {...p}><rect x="3" y="8" width="16" height="8" rx="1.5"/><path d="M21 11v2"/><rect x="5" y="10" width="10" height="4" fill="currentColor" stroke="none"/></Ico>,
  Lock:    (p) => <Ico {...p}><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></Ico>,
  Face:    (p) => <Ico {...p}><circle cx="12" cy="12" r="9"/><circle cx="9" cy="10" r="0.6" fill="currentColor"/><circle cx="15" cy="10" r="0.6" fill="currentColor"/><path d="M9 15c1 1 4 1 6 0"/></Ico>,
  Sparkle: (p) => <Ico {...p}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.5 5.5l2.8 2.8M15.7 15.7l2.8 2.8M5.5 18.5l2.8-2.8M15.7 8.3l2.8-2.8"/></Ico>,
};
