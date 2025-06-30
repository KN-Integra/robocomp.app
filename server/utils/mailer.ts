import { createTransport } from 'nodemailer'

import type { Transporter } from 'nodemailer'

export function getMailTransporter(): Transporter {
  return createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_LOGIN || '',
      pass: process.env.SMTP_PASS || ''
    }
  })
}
