import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { signOut } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

export default function BlockedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Доступ ограничен</CardTitle>
          <CardDescription>
            Аккаунт компании деактивирован. Обратитесь к администратору для активации тарифа.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={signOut}>
            <Button type="submit" variant="outline">
              Выйти
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
