import { signUp } from "@/app/actions/auth";
import { AuthForm } from "@/components/auth/auth-form";

export default function RegisterPage() {
  return <AuthForm mode="register" action={signUp} />;
}
