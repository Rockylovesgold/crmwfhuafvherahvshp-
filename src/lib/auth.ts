import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { timingSafeEqual } from "node:crypto";
import { z } from "zod";

const credentialSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const allowedUsers = [
  {
    id: "1",
    username: process.env.AUTH_USER_1_USERNAME ?? "",
    password: process.env.AUTH_USER_1_PASSWORD ?? "",
    name: process.env.AUTH_USER_1_NAME ?? "User One",
    email: process.env.AUTH_USER_1_EMAIL ?? "user1@rockmount.ai",
  },
  {
    id: "2",
    username: process.env.AUTH_USER_2_USERNAME ?? "",
    password: process.env.AUTH_USER_2_PASSWORD ?? "",
    name: process.env.AUTH_USER_2_NAME ?? "User Two",
    email: process.env.AUTH_USER_2_EMAIL ?? "user2@rockmount.ai",
  },
].filter((user) => user.username.length > 0 && user.password.length > 0);

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) return false;
  return timingSafeEqual(leftBuffer, rightBuffer);
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  debug: false,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsedCredentials = credentialSchema.safeParse(credentials);
        if (!parsedCredentials.success) return null;

        const matchedUser = allowedUsers.find(
          (user) =>
            safeEqual(user.username, parsedCredentials.data.username) &&
            safeEqual(user.password, parsedCredentials.data.password)
        );

        if (!matchedUser) return null;

        return {
          id: matchedUser.id,
          name: matchedUser.name,
          email: matchedUser.email,
          image: null,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
    authorized({ auth: session, request: { nextUrl } }) {
      const isLoggedIn = !!session?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false;
      }
      if (isLoggedIn) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }
      return true;
    },
  },
});
