import { createTransport } from 'nodemailer'

import type { Transporter } from 'nodemailer'

const runtimeConfig = useRuntimeConfig()

export function getMailTransporter(): Transporter {
  return createTransport({
    service: 'gmail',
    auth: {
      user: runtimeConfig.SMTP_LOGIN || '',
      pass: runtimeConfig.SMTP_PASS || ''
    }
  })
}
