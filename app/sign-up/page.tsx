// app/sign-up/page.tsx
import { SignUp } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950">
      <SignUp
        appearance={{
          baseTheme: dark,
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
