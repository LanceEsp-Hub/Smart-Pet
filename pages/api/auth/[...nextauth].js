import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      // Attach the Google token to the session
      if (account?.id_token) {
        token.id_token = account.id_token;
      }
      return token;
    },
    async session({ session, token }) {
      // Attach the Google token to the session for API requests
      session.id_token = token.id_token;
      return session;
    },
  },
});
