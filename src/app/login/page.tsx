import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { GoogleButton } from "@/components/ui/google-button";
import { LoginForm } from "@/components/auth/login-form";

export default function Login({
  searchParams,
}: {
  searchParams: { message: string; returnUrl?: string };
}) {
  const signIn = async (formData: FormData) => {
    "use server";

    const origin = headers().get("origin");
    const email = formData.get("email") as string;
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${origin}/auth/callback?returnUrl=${searchParams.returnUrl}`,
      },
    });

    if (error) {
      return redirect(`/login?message=Could not send magic link&returnUrl=${searchParams.returnUrl}`);
    }

    return redirect(`/login?message=Check email to continue sign in process&returnUrl=${searchParams.returnUrl}`);
  };

  const signInWithGoogle = async () => {
    "use server";
    
    const origin = headers().get("origin");
    const supabase = createClient();
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${origin}/auth/callback?returnUrl=${searchParams.returnUrl}`,
      },
    });

    if (error) {
      return redirect(`/login?message=Could not authenticate with Google&returnUrl=${searchParams.returnUrl}`);
    }

    return redirect(data?.url || '/dashboard');
  };

  return (
    <div 
      className="flex min-h-screen relative"
      style={{
        backgroundImage: 'url("/images/gradient_bg.svg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="w-full max-w-[1600px] mx-auto relative px-4 md:px-8">
        <div className="absolute left-8 top-8">
          <Image
            src="/images/veer-logo.svg"
            alt="Veer Logo"
            width={240}
            height={80}
            priority
          />
        </div>

        <div className="max-w-[1100px] mx-auto">
          <div className="grid w-full h-screen grid-cols-1 gap-20 md:grid-cols-2 place-content-center">
            <div className="flex flex-col justify-center space-y-4">
              <h1 className="text-6xl font-bold leading-tight lg:text-7xl">
                <span className="text-white [text-shadow:_0_1px_3px_#46296b52]">Ready. Set.</span>{' '}
                <span className="text-rose-600">Optimize.</span>
              </h1>
              <p className="max-w-md text-lg font-medium text-white [text-shadow:_0_1px_3px_#46296b52]">
                Veer is the first all-in-one platform that optimizes your schedules, routes, and staffing simultaneously.
              </p>
            </div>

            <div className="flex items-center justify-center">
              <Card className="w-full max-w-[420px]">
                <CardHeader className="pb-4">
                  <CardTitle className="text-[32px] text-[#46296B] mb-2">Sign in</CardTitle>
                  <p className="text-base text-muted-foreground">
                    Don't have an account?{' '}
                    <Link href="/signup" className="text-sky-500 hover:text-sky-700 font-semibold">
                      Sign up
                    </Link>
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <GoogleButton 
                    onClick={signInWithGoogle}
                  />
                  
                  <div className="relative py-6">
                    <div className="absolute inset-0 flex items-center">
                      <Separator />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Or continue with email
                      </span>
                    </div>
                  </div>

                  <LoginForm 
                    signInAction={signIn}
                    message={searchParams?.message}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
