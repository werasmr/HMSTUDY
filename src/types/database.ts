export type CompanyPlan = "free" | "starter" | "pro";
export type MemberRole = "owner" | "employee";
export type MemberStatus = "active" | "invited" | "disabled";

export type CompanySettings = {
  currency: string;
  timezone: string;
  segment_thresholds: {
    vip: number;
    regular: number;
    low_value: number;
  };
};

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type Company = {
  id: string;
  name: string;
  slug: string;
  plan: CompanyPlan;
  is_active: boolean;
  settings: CompanySettings;
  created_at: string;
  updated_at: string;
};

export type CompanyMember = {
  id: string;
  company_id: string;
  user_id: string | null;
  role: MemberRole;
  status: MemberStatus;
  invited_email: string | null;
  created_at: string;
};

export type UserContext = {
  profile: Profile;
  company: Company;
  membership: CompanyMember;
};
