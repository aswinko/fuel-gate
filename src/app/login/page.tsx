import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserAuthForm } from "@/components/user-auth-form"
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/layout/NavBar";

export default async function LoginPage() {
    // if user is logged in redirect to home page
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    if (!error || data?.user) {
      redirect("/");
    }
  
  return (
    <>
      <Navbar />
      <div className="flex min-h-screen flex-col">
        <main className="flex-1 flex items-center justify-center p-4 md:p-8">
          <Card className="mx-auto max-w-sm w-full">
            <CardHeader>
              <CardTitle className="text-2xl">Log in</CardTitle>
              <CardDescription>Enter your credentials to access your account</CardDescription>
            </CardHeader>
            <CardContent>
              <UserAuthForm />
            </CardContent>
            {/* <CardFooter className="flex justify-center">
              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="underline text-green-600">
                  Sign up
                </Link>
              </div>
            </CardFooter> */}
          </Card>
        </main>
      </div>
    </>

  )
}