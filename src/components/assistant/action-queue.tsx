"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { approveAgentAction, rejectAgentAction } from "@/app/actions/agent-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { AgentAction } from "@/types/database";

type ActionQueueProps = {
  actions: AgentAction[];
};

export function ActionQueue({ actions }: ActionQueueProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (actions.length === 0) return null;

  async function handleApprove(id: string) {
    const result = await approveAgentAction(id);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Действие выполнено");
    startTransition(() => router.refresh());
  }

  async function handleReject(id: string) {
    const result = await rejectAgentAction(id);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Действие отклонено");
    startTransition(() => router.refresh());
  }

  return (
    <Card className="border-amber-200/80 bg-amber-50/40">
      <CardHeader>
        <CardTitle className="text-base">Ожидают подтверждения</CardTitle>
        <CardDescription>
          AI предложил действия — одобрите или отклоните
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.map((action) => (
          <div
            key={action.id}
            className="flex flex-col gap-3 rounded-xl border bg-background p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="text-sm font-medium">{action.preview ?? action.action_type}</p>
              <p className="text-xs text-muted-foreground">{action.action_type}</p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => void handleApprove(action.id)}
                disabled={pending}
              >
                <Check className="mr-1 h-4 w-4" />
                Одобрить
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => void handleReject(action.id)}
                disabled={pending}
              >
                <X className="mr-1 h-4 w-4" />
                Отклонить
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
