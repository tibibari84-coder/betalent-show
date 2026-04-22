export type ProductArea = "workspace" | "account" | "internal";

export type ProductPageKey =
  | "app"
  | "discovery"
  | "profile"
  | "creator"
  | "uploads"
  | "submissions"
  | "settings";

export type ProductPageDefinition = {
  key: ProductPageKey;
  href: string;
  label: string;
  short: string;
  note: string;
  area: ProductArea;
  role: string;
};

export const productPages: ProductPageDefinition[] = [
  {
    key: "app",
    href: "/app",
    label: "Home",
    short: "Hm",
    note: "Now",
    area: "workspace",
    role: "Creator home / current state / next actions",
  },
  {
    key: "discovery",
    href: "/app/discovery",
    label: "Discover",
    short: "Ds",
    note: "Feed",
    area: "workspace",
    role: "Short-performance discovery feed",
  },
  {
    key: "creator",
    href: "/app/creator",
    label: "Creator",
    short: "Cr",
    note: "Control",
    area: "workspace",
    role: "Creator status + creator configuration",
  },
  {
    key: "uploads",
    href: "/app/uploads",
    label: "Uploads",
    short: "Up",
    note: "Media",
    area: "workspace",
    role: "Media workspace",
  },
  {
    key: "submissions",
    href: "/app/submissions",
    label: "Submits",
    short: "Sb",
    note: "Entries",
    area: "workspace",
    role: "Competition workspace",
  },
  {
    key: "profile",
    href: "/app/profile",
    label: "Profile",
    short: "Pf",
    note: "Identity",
    area: "account",
    role: "Identity editing",
  },
  {
    key: "settings",
    href: "/app/settings",
    label: "Settings",
    short: "St",
    note: "Account",
    area: "account",
    role: "Account/system controls",
  },
];

export const workspaceNavItems = productPages.filter((page) => page.area === "workspace");
export const accountNavItems = productPages.filter((page) => page.area === "account");
