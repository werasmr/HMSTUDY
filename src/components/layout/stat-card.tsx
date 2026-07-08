import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatCardProps = {
  title: string;
  description?: string;
  value: React.ReactNode;
  icon?: LucideIcon;
  tone?: "default" | "success" | "danger" | "primary";
};

const toneStyles = {
  default: {
    card: "border-border/70",
    icon: "bg-muted text-muted-foreground",
    value: "text-foreground",
  },
  primary: {
    card: "border-primary/20 bg-primary/[0.03]",
    icon: "bg-primary/10 text-primary",
    value: "text-foreground",
  },
  success: {
    card: "border-emerald-200/80 bg-emerald-50/50",
    icon: "bg-emerald-100 text-emerald-700",
    value: "text-emerald-700",
  },
  danger: {
    card: "border-red-200/80 bg-red-50/50",
    icon: "bg-red-100 text-red-700",
    value: "text-red-700",
  },
} as const;

export function StatCard({
  title,
  description,
  value,
  icon: Icon,
  tone = "default",
}: StatCardProps) {
  const styles = toneStyles[tone];

  return (
    <Card className={cn("transition-shadow hover:shadow-md", styles.card)}>
      <CardHeader className="flex flex-row items-start justify-between gap-3 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {Icon && (
          <div className={cn("rounded-lg p-2", styles.icon)}>
            <Icon className="h-4 w-4" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <p className={cn("text-2xl font-bold tracking-tight", styles.value)}>{value}</p>
      </CardContent>
    </Card>
  );
}
