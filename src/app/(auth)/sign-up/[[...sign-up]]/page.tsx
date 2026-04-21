import { redirect } from "next/navigation";

type SignUpPageProps = {
  searchParams?: Promise<{
    redirect?: string;
  }>;
};

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const params = (await searchParams) ?? {};
  const redirectParam = params.redirect
    ? `?redirect=${encodeURIComponent(params.redirect)}`
    : "";

  redirect(`/register${redirectParam}`);
}
