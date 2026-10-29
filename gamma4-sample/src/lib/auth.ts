import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { NextAuthOptions } from "next-auth"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    {
      id: "google",
      name: "Google",
      type: "oauth",
      wellKnown: {
        authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
        tokenEndpoint: "https://accounts.google.com/o/oauth2/v2/token",
        userinfoEndpoint: "https://openidconnect.googleapis.com/v1/userinfo",
        issuer: "https://accounts.google.com",
      },
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
    {
      id: "microsoft",
      name: "Microsoft",
      type: "oauth",
      wellKnown: {
        authorizationEndpoint: "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
        tokenEndpoint: "https://login.microsoftonline.com/common/oauth2/v2.0/token",
        userinfoEndpoint: "https://graph.microsoft.com/oidc/userinfo",
        issuer: "https://login.microsoftonline.com/common",
      },
      clientId: process.env.MICROSOFT_CLIENT_ID,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
    },
    {
      id: "apple",
      name: "Apple",
      type: "oauth",
      wellKnown: {
        authorizationEndpoint: "https://appleid.apple.com/auth",
        tokenEndpoint: "https://appleid.apple.com/auth",
        userinfoEndpoint: "https://appleid.apple.com/auth",
        issuer: "https://appleid.apple.com",
      },
      clientId: process.env.APPLE_ID,
      clientSecret: process.env.APPLE_SECRET,
    },
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}

export default NextAuth(authOptions)
