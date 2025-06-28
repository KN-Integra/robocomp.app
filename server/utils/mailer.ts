import { createTransport } from 'nodemailer'

import type { Transporter } from 'nodemailer'

export function getMailTransporter(): Transporter {
  const host: string = process.env.SMTP_HOST as string
  const port: number = parseInt(process.env.SMTP_PORT || '587')
  const secure = process.env.SMTP_IS_SECURE?.toLowerCase() === 'true'
  const user: string = process.env.SMTP_LOGIN || 'admin'
  const password: string = process.env.SMTP_PASSWORD || 'password'

  return createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass: password
    }
  })
}
