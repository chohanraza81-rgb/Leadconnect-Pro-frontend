// app/sign-in/page.tsx
import { SignIn } from "@clerk/nextjs";
import { dark } from "@clerk/ui/themes";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950">
      <SignIn
        appearance={{
          theme: dark,                     // 👈 baseTheme → theme
          variables: {
            colorPrimary: "#4f46e5",
            colorBackground: "#18181b",
            colorForeground: "#ffffff",
            colorMutedForeground: "#a1a1aa",
            colorInput: "#27272a",
            colorInputForeground: "#ffffff",
          },
        }}
      />
    </div>
  );
}
