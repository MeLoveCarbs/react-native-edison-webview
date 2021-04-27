import "./index.html";

export const InjectScriptName = {
  SetHTML: "setHTML",
  SetDarkMode: "setDarkMode",
  SetPreviewMode: "setPreviewMode",
} as const;

export const EventName = {
  IsMounted: "isMounted",
  HeightChange: "heightChange",
  ClickLink: "clickLink",
} as const;
