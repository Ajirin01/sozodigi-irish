import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import {jwtDecode} from "jwt-decode";

const API_BASE_URL = process.env.NEXT_PUBLIC_NODE_API_BASE_URL;

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const res = await fetch(`${API_BASE_URL}/users/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
              token: credentials.token, // optional
            }),
          });

          if (!res.ok) throw new Error("Invalid credentials");

          const user = await res.json();

          if (!user.token) throw new Error("No token returned");

          return { ...user };
        } catch (error) {
          throw new Error(error.message || "Authentication failed");
        }
      },
    }),
  ],
  
  // 👇 Add this block here
  session: {
    strategy: "jwt",
    maxAge: 60*60*24, // 1 minute for quick testing, adjust as needed
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.user._id;
        token.jwt = user.token;
        token.email = user.user.email;
        token.role = user.user.role;
        token.name = user.user.name;
        // token.isHealthQuestionsAnswered = user.user.isHealthQuestionsAnswered ?? false;
        token.approvalStatus = user.user.approvalStatus ?? "pending";

        try {
          const decoded = jwtDecode(user.token);
          token.exp = decoded.exp;
        } catch (e) {
          console.error("Failed to decode JWT:", e);
          token.exp = null;
        }
      }

      const currentTime = Math.floor(Date.now() / 1000);
      if (token?.exp && token.exp < currentTime) {
        token.error = "RefreshAccessTokenError";
      }

      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.jwt = token.jwt;
        session.user.email = token.email;
        session.user.role = token.role;
        session.user.name = token.name;
        session.user.approvalStatus = token.approvalStatus ?? "pending";
        session.error = token.error ?? null;
      }

      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
});

