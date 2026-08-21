import NextAuth, { type NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";

const config: NextAuthConfig = {
  providers: [GitHub],
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ profile }) {
      const email = profile?.email;
      if (!email) return false;
      return email === process.env.ADMIN_EMAIL;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(config);
