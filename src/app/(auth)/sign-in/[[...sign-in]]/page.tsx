import { redirect } from "next/navigation";

type SignInPageProps = {
  searchParams?: Promise<{
    redirect?: string;
  }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = (await searchParams) ?? {};
  const redirectParam = params.redirect
    ? `?redirect=${encodeURIComponent(params.redirect)}`
    : "";

  redirect(`/login${redirectParam}`);
}
