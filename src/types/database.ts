export type ClientStatus = "lead" | "active" | "inactive" | "churned";
export type ClientSegment = "vip" | "regular" | "low_value" | "unsegmented";
export type DealStage =
  | "lead"
  | "qualified"
  | "proposal"
  | "negotiation"
  | "won"
  | "lost";
export type TaskStatus = "todo" | "in_progress" | "done" | "canceled";
export type TaskPriority = "low" | "medium" | "high";
export type TaskEntityType = "client" | "deal" | "employee" | "product" | "none";
export type InteractionType =
  | "note"
  | "call"
  | "email"
  | "meeting"
  | "deal"
  | "import";

export type Client = {
  id: string;
  company_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: ClientStatus;
  source: string | null;
  total_purchases: number;
  segment: ClientSegment;
  notes: string | null;
  metadata: Record<string, unknown>;
  duplicate_of: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type ClientInteraction = {
  id: string;
  company_id: string;
  client_id: string;
  type: InteractionType;
  title: string | null;
  content: string | null;
  created_by: string | null;
  created_at: string;
};

export type Deal = {
  id: string;
  company_id: string;
  client_id: string;
  title: string;
  stage: DealStage;
  amount: number | null;
  currency: string;
  expected_close_date: string | null;
  assigned_to: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  clients?: { name: string } | null;
};

export type Task = {
  id: string;
  company_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  assignee_id: string | null;
  entity_type: TaskEntityType;
  entity_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type CategoryType = "income" | "expense";

export type BankAccount = {
  id: string;
  company_id: string;
  name: string;
  currency: string;
  created_at: string;
};

export type TransactionCategory = {
  id: string;
  company_id: string;
  name: string;
  type: CategoryType;
  is_system: boolean;
  created_at: string;
};

export type Transaction = {
  id: string;
  company_id: string;
  bank_account_id: string | null;
  category_id: string | null;
  amount: number;
  currency: string;
  description: string;
  transaction_date: string;
  import_ref: string | null;
  ai_categorized: boolean;
  ai_confidence: number | null;
  metadata: Record<string, unknown>;
  created_at: string;
  bank_accounts?: { name: string } | null;
  transaction_categories?: { name: string; type: CategoryType } | null;
};

export type FinanceSummary = {
  income: number;
  expense: number;
  balance: number;
  currency: string;
  byCategory: Array<{
    categoryId: string | null;
    categoryName: string;
    type: CategoryType | "unknown";
    total: number;
  }>;
  periodFrom: string;
  periodTo: string;
};

export type ParsedStatementRow = {
  date: string;
  amount: number;
  description: string;
  importRef: string;
};

export type ProductType = "product" | "service";
export type ProductStatus = "active" | "archived";

export type Product = {
  id: string;
  company_id: string;
  name: string;
  type: ProductType;
  sku: string | null;
  cost: number | null;
  price: number | null;
  margin_percent: number | null;
  description: string | null;
  status: ProductStatus;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type EmployeeStatus = "active" | "inactive";

export type Employee = {
  id: string;
  company_id: string;
  user_id: string | null;
  full_name: string;
  position: string | null;
  department: string | null;
  hire_date: string | null;
  status: EmployeeStatus;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type EmployeeKpi = {
  id: string;
  company_id: string;
  employee_id: string;
  period: string;
  metric_key: string;
  metric_label: string;
  value: number;
  target: number | null;
  created_at: string;
};

export type PerformanceRow = {
  employee: Employee;
  kpis: EmployeeKpi[];
  efficiency: number | null;
};

export type Competitor = {
  id: string;
  company_id: string;
  name: string;
  website: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type CompetitorItem = {
  id: string;
  company_id: string;
  competitor_id: string;
  product_name: string;
  price: number;
  currency: string;
  notes: string | null;
  recorded_at: string;
  created_at: string;
  competitors?: { name: string } | null;
};

export type ComparisonRow = {
  productName: string;
  ourPrice: number | null;
  ourProductId: string | null;
  competitorPrices: Array<{
    competitorId: string;
    competitorName: string;
    price: number | null;
    currency: string;
    itemId: string | null;
  }>;
};

export type PricingScenario = {
  id: string;
  company_id: string;
  product_id: string | null;
  cost: number;
  margin_percent: number;
  calculated_price: number;
  ai_recommended_price: number | null;
  ai_reasoning: string | null;
  competitor_context: Record<string, unknown> | null;
  created_by: string | null;
  created_at: string;
  products?: { name: string } | null;
};

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

export type SelectOption = {
  value: string;
  label: string;
};

export type FieldType =
  | "text"
  | "email"
  | "number"
  | "textarea"
  | "select"
  | "date"
  | "hidden";

export type FieldConfig = {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: SelectOption[];
  placeholder?: string;
  hiddenInForm?: boolean;
  hiddenInTable?: boolean;
  readOnly?: boolean;
};

export type FilterConfig = {
  key: string;
  label: string;
  options: SelectOption[];
};

export type ColumnConfig<T> = {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
};

export type CrudActionResult = {
  error?: string;
  success?: boolean;
};

export type CrudFilters = Record<string, string | undefined>;

export type ChatRole = "user" | "assistant" | "system" | "tool";

export type ChatConversation = {
  id: string;
  company_id: string;
  user_id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
};

export type ChatMessage = {
  id: string;
  conversation_id: string;
  role: ChatRole;
  content: string | null;
  tool_calls: Record<string, unknown> | null;
  tool_results: Record<string, unknown> | null;
  created_at: string;
};

export type AgentActionStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "executed"
  | "failed";
