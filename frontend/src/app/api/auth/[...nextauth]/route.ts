import NextAuth from "next-auth";
import Auth0Provider from "next-auth/providers/auth0";

const handler = NextAuth({
  providers: [
    Auth0Provider({
      clientId: process.env.AUTH0_CLIENT_ID || "mock_client_id",
      clientSecret: process.env.AUTH0_CLIENT_SECRET || "mock_client_secret",
      issuer: process.env.AUTH0_ISSUER || "https://mock.auth0.com",
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        // In a real app, you would hit your FastAPI backend here 
        // to retrieve the user's role and org_id
        token.role = "admin"; // Mock role assignment
        token.org_id = "ws_89f21a";
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        (session.user as any).role = token.role;
        (session.user as any).org_id = token.org_id;
      }
      return session;
    }
  }
});

export { handler as GET, handler as POST };
