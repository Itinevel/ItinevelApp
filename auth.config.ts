import    { NextAuthConfig }   from "next-auth"
import Credentials from "next-auth/providers/credentials"
import prisma from "./app/_lib/db"
import bcrypt from "bcryptjs"

export default {
    pages:{
        signIn:'/login'
    },
    providers:[
        Credentials({
            async authorize(credentials){
                const body = await credentials
                const { email, password} = body
                const user = await prisma.users.findFirst({
                    where:{
                         email:email as string
                    },
                    
                })
                if(!user || !user.password || !user.email) return null
                const passwordsMatch = await bcrypt.compare(password as string, user.password)
                if (passwordsMatch) return user
              return null           }
        })
    ],

    callbacks: {
        // Add user.id to the session object
        async session({ session, token }) {
          if (token?.sub ) {
            session.user.id = token.sub;
            session.user.roles = token.roles as string[];
          }
          return session;
        },
    
        // Ensure the token includes the user id
        async jwt({ token, user }) {
          if (user?.id) {
            token.sub = user.id; // Save the user id in the token
            token.roles = user.roles as string[];
          }
          return token;
        },
      },

      session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
      },
    
} satisfies NextAuthConfig