import { Resend } from 'resend'
import { RESEND_API_KEY } from './constants'

export const resend = new Resend(RESEND_API_KEY)
