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
          <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb; font-size: 28px; margin-bottom: 10px;">Welcome to InstaRent!</h1>
              <p style="color: #4b5563; font-size: 16px;">Your trusted platform for instant rentals</p>
            </div>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 6px; margin-bottom: 25px;">
              <p style="color: #1f2937; font-size: 16px; margin-bottom: 15px;">Hi ${user.name},</p>
              <p style="color: #4b5563; font-size: 15px; line-height: 1.6;">Thank you for joining InstaRent! To get started, please verify your email address by clicking the button below:</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${url}" style="background-color: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block; transition: background-color 0.2s;">Verify Email Address</a>
            </div>

            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
              <p style="color: #6b7280; font-size: 14px; text-align: center;">If you didn't create an account with InstaRent, you can safely ignore this email.</p>
            </div>

            <div style="margin-top: 30px; text-align: center;">
              <p style="color: #4b5563; font-size: 14px;">Best regards,</p>
              <p style="color: #2563eb; font-weight: 600; font-size: 16px;">The InstaRent Team</p>
            </div>
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
            subject: 'Email Change Request',
            html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #2563eb; font-size: 28px; margin-bottom: 10px;">Email Change Request</h1>
                <p style="color: #4b5563; font-size: 16px;">Update your InstaRent account</p>
              </div>
              
              <div style="background-color: #f3f4f6; padding: 20px; border-radius: 6px; margin-bottom: 25px;">
                <p style="color: #1f2937; font-size: 16px; margin-bottom: 15px;">Hi ${user.name},</p>
                <p style="color: #4b5563; font-size: 15px; line-height: 1.6;">We received a request to update the email address associated with your InstaRent account.</p>
                <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin-top: 10px;">New email address: <strong style="color: #2563eb;">${newEmail}</strong></p>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${url}" style="background-color: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block; transition: background-color 0.2s;">Confirm Email Change</a>
              </div>

              <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
                <p style="color: #6b7280; font-size: 14px; text-align: center;">If you didn't request this change, you can safely ignore this email and your current email address will remain unchanged.</p>
              </div>

              <div style="margin-top: 30px; text-align: center;">
                <p style="color: #4b5563; font-size: 14px;">Best regards,</p>
                <p style="color: #2563eb; font-weight: 600; font-size: 16px;">The InstaRent Team</p>
              </div>
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
    expiresIn: 60 * 60 * 24 * 3,
    updateAge: 60 * 60 * 24
  }
})
