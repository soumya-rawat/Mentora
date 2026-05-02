// Extend NextAuth types
import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      onboardingComplete: boolean;
    };
  }

  interface User {
    onboardingComplete?: boolean;
  }
}
