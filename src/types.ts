export type Language = 'vi' | 'en';
export type Localized = { vi: string; en: string };

export type Archetype =
  | 'underpayment' | 'unfair_dismissal' | 'sham_contracting'
  | 'workplace_injury' | 'discrimination' | 'sexual_harassment' | 'bullying';

export interface CaseFile {
  id: string;
  createdAt: string;
  language: Language;
  source: 'street' | 'agent';
  status: 'draft' | 'submitted' | 'assigned' | 'contacted' | 'closed';
  profile: {
    visaSubclass?: '500' | '482' | '485' | '417' | '462' | 'PALM' | 'bridging' | 'PR' | 'citizen' | 'other' | 'prefer_not_say';
    industry?: string;
    role?: string;
    tenureMonths?: number;
    stillEmployed?: boolean;
    employerSizeUnder15?: boolean;
    suburb?: string;
    ageBand?: string;
  };
  flags: Array<{
    archetype: Archetype;
    confidence: 'strong' | 'possible';
    signals: string[];
    sourceNpc?: string;
  }>;
  detail: {
    underpayment?: {
      rateOrCashPerShift?: string;
      paidCash?: boolean;
      payslips?: 'always' | 'sometimes' | 'never';
      hoursBand?: string;
      unpaidTrial?: boolean;
      unpaidTimeAroundShift?: boolean;
      deductions?: string[];
      superPaid?: 'yes' | 'no' | 'unknown';
      penaltyRates?: 'yes' | 'no' | 'unknown';
    };
    shamContracting?: {
      toldToGetABN?: boolean;
      whoSetsHours?: string;
      ownTools?: boolean;
      canSendSubstitute?: boolean;
      invoices?: boolean;
      worksForOthers?: boolean;
    };
    workplaceInjury?: {
      what?: string;
      whenISO?: string;
      reportedTo?: string;
      sawDoctor?: boolean;
      workersCompLodged?: boolean;
      paidWhileOff?: boolean;
      pressuredNotToReport?: boolean;
      hoursCutSince?: boolean;
    };
    dismissal?: {
      howItEnded?: 'told_to_go' | 'hours_cut_to_zero' | 'forced_resign' | 'other';
      reasonGiven?: string;
      inWriting?: boolean;
      whatHappenedBefore?: string;
    };
    discrimination?: { attribute?: string; whatChanged?: string; othersTreatedDifferently?: boolean };
    harassment?: {
      whatHappened?: string;
      byWhom?: 'employer' | 'coworker' | 'customer' | 'other';
      ongoing?: boolean;
      witnesses?: boolean;
      reportedToAnyone?: boolean;
    };
    bullying?: { behaviour?: string; repeated?: boolean; byWhom?: string; witnesses?: boolean };
  };
  narrative: Localized;
  evidenceHeld: {
    payslips?: boolean;
    rosters?: boolean;
    bankStatements?: boolean;
    messagesFromEmployer?: boolean;
    photos?: boolean;
    witnessNames?: boolean;
    contract?: boolean;
    notes?: string;
  };
  othersAffected?: boolean;
  readiness: 'ready_now' | 'not_yet' | 'information_only';
  contactSafety: {
    preferredChannel?: 'phone' | 'sms' | 'email' | 'zalo' | 'messenger';
    safeToCall?: boolean;
    safeToLeaveVoicemail?: boolean;
    safeToEmail?: boolean;
    bestTimeOfDay?: string;
    notes?: string;
  };
  emergencyContact?: {
    name?: string;
    relationship?: string;
    phone?: string;
    mayWeContact?: boolean;
    language?: Language | 'other';
  };
  contact?: { name?: string; phone?: string; email?: string };
  employer?: { name?: string; address?: string };
  consent: { shareWithRMWC: boolean; storeAnonymisedStats: boolean; timestampISO: string };
  assignment?: { caseworkerId?: string; caseworkerName?: string; assignedAtISO?: string };
}

export function createCaseFile(language: Language, source: CaseFile['source']): CaseFile {
  return {
    id: `RMWC-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
    createdAt: new Date().toISOString(),
    language,
    source,
    status: 'draft',
    profile: {},
    flags: [],
    detail: {},
    narrative: { vi: '', en: '' },
    evidenceHeld: {},
    readiness: 'information_only',
    contactSafety: {},
    consent: { shareWithRMWC: false, storeAnonymisedStats: false, timestampISO: '' },
  };
}

export interface Choice {
  id: string;
  text: Localized;
  next: string;
  trust?: number;
  recordEvidence?: boolean;
}

export interface StoryNode {
  id: string;
  text: Localized;
  choices?: Choice[];
  next?: string;
  kind?: 'dialogue' | 'artifact' | 'reflection';
  speaker?: string;
}

export interface Resident {
  id: string;
  name: string;
  age: number;
  role: Localized;
  subtitle: Localized;
  archetype: Archetype;
  image: string;
  location: Localized;
  intro: Localized;
  warning?: Localized;
  needsReturn?: boolean;
  nodes: Record<string, StoryNode>;
  start: string;
  epilogue: { kept: Localized; missed: Localized };
}
