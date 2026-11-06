export interface AirlineOffice {
  id: string;
  name: string; // e.g. "Bozeman Office in United States"
  city: string; // e.g. "Bozeman"
  country: string; // e.g. "United States"
  phone?: string;
  address?: string;
  airportCode?: string;
}

export interface AirlineItem {
  id: string;
  name: string;
  code?: string;
  primaryColor?: string;
  accentColor?: string;
  offices: AirlineOffice[];
  selected?: boolean;
}

export interface CustomLinkItem {
  id: string;
  label: string;
  url: string;
}

export interface SocialLinks {
  website?: string;
  supportUrl?: string;
  whatsapp?: string;
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  youtube?: string;
  customLinks?: CustomLinkItem[];
}

export interface PostSections {
  urgentCalloutTitle: string;
  urgentCalloutDesc: string;
  overviewPara1: string;
  overviewPara2: string;
  officeHours: string;
  officeAddress: string;
  servicesList: string[];
  faqs: { question: string; answer: string }[];
  disputeSteps?: { stepNumber: number; title: string; instruction: string }[];
  compensationTable?: { event: string; right: string; action: string }[];
}

export interface BloggerSubSettings {
  labels: string[];
  permalinkSlug: string;
  searchDescription: string;
  location: {
    name: string;
    lat: number;
    lng: number;
    span?: string;
  };
  readerComments: 'ALLOW' | 'DONT_ALLOW_SHOW_EXISTING' | 'DONT_ALLOW_HIDE_EXISTING';
  customRobotTags: {
    index: boolean;
    follow: boolean;
    noarchive: boolean;
    maxSnippet: boolean;
    maxImagePreview: boolean;
  };
  authorityLinks: {
    dotComplaintUrl: string;
    airlineOfficialUrl: string;
    internalDirectoryUrl: string;
  };
}

export interface GeneratedPost {
  id: string;
  airlineName: string;
  officeName: string;
  city: string;
  country: string;
  title: string;
  slug: string;
  tfnNumber: string;
  keyword: string;
  htmlContent: string;
  imageUrl: string;
  status: 'Draft' | 'Ready' | 'Publishing' | 'Published' | 'Error';
  publishedUrl?: string;
  labels: string[];
  socialLinks?: SocialLinks;
  sections?: PostSections;
  bloggerSettings?: BloggerSubSettings;
  verified?: boolean;
}
