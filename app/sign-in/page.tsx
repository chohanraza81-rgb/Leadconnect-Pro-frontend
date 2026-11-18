// app/sign-in/page.tsx
import { SignIn } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950">
      <SignIn
        appearance={{
          baseTheme: dark,
          variables: {
            colorPrimary: "#4f46e5",
            colorBackground: "#18181b",
            colorForeground: "#ffffff",            // 👈 colorText replaced
            colorMutedForeground: "#a1a1aa",       // 👈 colorTextSecondary replaced
            colorInput: "#27272a",                 // 👈 colorInputBackground replaced
            colorInputForeground: "#ffffff",       // 👈 colorInputText replaced
          },
        }}
      />
    </div>
  );
}
