// next-auth.d.ts
import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    roles?: string[]; // Add roles property to the User type
  }

  interface Session {
    user: User; // Ensure that the user in the session contains the extended User type
  }

  interface JWT {
    id: string;   // Ensure id is included in the JWT type
    email: string;
    roles?: string[]; // Add roles to the JWT token
  }
}
