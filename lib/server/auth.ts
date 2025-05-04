import { db } from '@/db'
import { account, session, user, verification } from '@/db/schema'
import { resend } from '@/utils/resend'
import { expo } from '@better-auth/expo'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { username } from 'better-auth/plugins'

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user,
      account,
      session,
      verification
    }
  }),
  emailAndPassword: {
    enabled: true
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }, request) => {
      try {
        const result = await resend.emails.send({
          from: 'InstaRent <instarent@resend.dev>', // this email domain only works for your resend account email address
          to: user.email,
          subject: 'Verify Your Email Address',
          html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h2 style="color: #2c3e50;">Verify Your Email</h2>
            <p>Hi ${user.name},</p>
            <p>Thank you for signing up with <strong>InstaRent</strong>!</p>
            <p>To complete your registration, please verify your email address by clicking the button below:</p>
            <p style="text-align: center;">
              <a href="${url}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
            </p>
            <p>If you did not create an account with us, you can safely ignore this email.</p>
            <br/>
            <p>Welcome aboard!</p>
            <p><strong>The InstaRent Team</strong></p>
          </div>
        `
        })
        if (result.error) throw new Error(result.error.message)

        console.log('email send')
      } catch (e) {
        console.log('Error sending email' + e)
      }
    }
  },
  user: {
    changeEmail: {
      enabled: true,
      sendChangeEmailVerification: async ({ user, newEmail, url, token }, request) => {
        try {
          const result = await resend.emails.send({
            from: 'InstaRent <instarent@resend.dev>',
            to: user.email,
            subject: 'Approve email change',
            html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
              <h2 style="color: #2c3e50;">Email Change Request</h2>
              <p>Hi ${user.name},</p>
              <p>We received a request to change the email address associated with your <strong>InstaRent</strong> account.</p>
              <p>The new email address is: <strong>${newEmail}</strong></p>
              <p>To confirm this change, please click the button below:</p>
              <p style="text-align: center;">
                <a href="${url}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Confirm Email Change</a>
              </p>
              <p>If you did not request this change, you can safely ignore this message and your current email address will remain unchanged.</p>
              <br/>
              <p>Thank you for using InstaRent,</p>
              <p><strong>The InstaRent Team</strong></p>
            </div>
          `
          })
          if (result.error) throw new Error(result.error.message)

          console.log('email send')
        } catch (e) {
          console.log('Error sending email' + e)
        }
      }
    }
  },
  plugins: [
    expo(),
    username({
      maxUsernameLength: 65,
      minUsernameLength: 2,
      usernameValidator: (username) => {
        if (username === 'admin') {
          return false
        }
        return true
      }
    })
  ],
  trustedOrigins: ['instarentapp://', 'http://', 'exp://'],
  session: {
    expiresIn: 60 * 60 * 24 * 3, // 3 days
    updateAge: 60 * 60 * 24 // 1 day (every 1 day the session expiration is updated)
  }
})
