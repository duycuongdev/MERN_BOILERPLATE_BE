const SibApiV3Sdk = require('@getbrevo/brevo')
import { env } from '~/config/environment'

let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi()
let apiKey = apiInstance.authentications['apiKey']
if (env.BREVO_API_KEY) {
  apiKey.apiKey = env.BREVO_API_KEY.trim()
}

const sendEmail = async (recipientEmail, customSubject, htmlContent) => {
  const trimmedKey = env.BREVO_API_KEY ? env.BREVO_API_KEY.trim() : ''

  if (trimmedKey.startsWith('xsmtpsib-')) {
    const errorMsg = 'Invalid Brevo Key Type: You are using an SMTP Key (starts with "xsmtpsib-"). Brevo REST API requires an API Key v3 (starts with "xkeysib-"). Please generate one in Brevo Dashboard > SMTP & API > API Keys tab.'
    // eslint-disable-next-line no-console
    console.error('❌ ' + errorMsg)
    throw new Error(errorMsg)
  }

  if (trimmedKey) {
    apiKey.apiKey = trimmedKey
  }

  let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail()

  sendSmtpEmail.sender = {
    email: env.ADMIN_EMAIL_ADDRESS ? env.ADMIN_EMAIL_ADDRESS.trim() : 'admin@example.com',
    name: env.ADMIN_EMAIL_NAME ? env.ADMIN_EMAIL_NAME.trim() : 'App Admin'
  }

  sendSmtpEmail.to = [
    {
      email: recipientEmail
    }
  ]

  sendSmtpEmail.subject = customSubject
  sendSmtpEmail.htmlContent = htmlContent

  return apiInstance.sendTransacEmail(sendSmtpEmail)
}

export const brevoProvider = {
  sendEmail
}

