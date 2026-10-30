import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { userModel } from '~/models/userModel'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { pickUser } from '~/utils/formatters'
import { WEBSITE_DOMAINS } from '~/utils/constants'
import { brevoProvider } from '~/providers/BrevoProvider'
import { jwtProvider } from '~/providers/JwtProvider'
import { env } from '~/config/environment'
import { cloudinaryProvider } from '~/providers/CloudinaryProvider'
import { OAuth2Client } from 'google-auth-library'

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID)

const createNew = async (reqBody) => {
  try {
    const existUser = await userModel.findOneByEmail(reqBody.email)
    let userToProcess = null

    if (existUser) {
      if (existUser.isActive) {
        throw new ApiError(StatusCodes.CONFLICT, 'Email already exists and is already verified!')
      }
      const newVerifyToken = uuidv4()
      const newPasswordHash = bcrypt.hashSync(reqBody.password, 8)
      userToProcess = await userModel.update(existUser._id, {
        password: newPasswordHash,
        verifyToken: newVerifyToken
      })
    } else {
      const nameFromEmail = reqBody.email.split('@')[0]
      const newUser = {
        email: reqBody.email,
        password: bcrypt.hashSync(reqBody.password, 8),
        username: nameFromEmail,
        displayName: nameFromEmail,
        verifyToken: uuidv4()
      }

      const createdUser = await userModel.createNew(newUser)
      userToProcess = await userModel.findOneById(createdUser.insertedId)
    }

    const verificationLink = `${WEBSITE_DOMAINS}/account/verification?email=${userToProcess.email}&token=${userToProcess.verifyToken}`
    // eslint-disable-next-line no-console
    console.log(`🔗 [VERIFICATION LINK] for ${userToProcess.email}: ${verificationLink}`)

    const customSubject = 'Verify your email address'
    const recipientName = userToProcess.displayName || userToProcess.username || userToProcess.email.split('@')[0]
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify your email</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f4f5f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #172b4d;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="padding: 40px 15px;">
          <tr>
            <td align="center">
              <table width="100%" max-width="560" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08); overflow: hidden;">
                <tr>
                  <td align="center" style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 32px 20px;">
                    <span style="font-size: 24px; font-weight: 800; color: #ffffff;">MERN Boilerplate</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 36px 32px 24px 32px;">
                    <h2 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #1e293b;">
                      Verify your email address 🎉
                    </h2>
                    <p style="font-size: 15px; line-height: 1.6; color: #475569;">
                      Hi <strong>${recipientName}</strong>,
                    </p>
                    <p style="font-size: 15px; line-height: 1.6; color: #475569;">
                      Thank you for signing up! Please click the button below to verify your email address.
                    </p>
                    <table border="0" cellspacing="0" cellpadding="0" style="margin: 28px 0 10px 0;">
                      <tr>
                        <td align="center" style="border-radius: 6px;" bgcolor="#2563eb">
                          <a href="${verificationLink}" target="_self" style="font-size: 15px; color: #ffffff; text-decoration: none; border-radius: 6px; padding: 14px 32px; display: inline-block; font-weight: 600;">
                            Verify Email Address
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding: 24px 32px; background-color: #f8fafc; font-size: 12px; color: #94a3b8;">
                    © ${new Date().getFullYear()} MERN Boilerplate. All rights reserved.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `

    try {
      await brevoProvider.sendEmail(userToProcess.email, customSubject, htmlContent)
    } catch (emailError) {
      // eslint-disable-next-line no-console
      console.error('⚠️ Brevo sendEmail failed:', emailError?.response?.body || emailError?.message || emailError)
      throw new ApiError(
        StatusCodes.BAD_GATEWAY,
        'Account created, but failed to send verification email (Brevo error). Check server logs for the verification link or verify Brevo credentials.'
      )
    }

    return pickUser(userToProcess)
  } catch (error) { throw error }
}

const verifyAccount = async (reqBody) => {
  try {
    const existUser = await userModel.findOneByEmail(reqBody.email)
    if (!existUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
    if (existUser.isActive) return pickUser(existUser)
    if (existUser.verifyToken !== reqBody.token) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Invalid verification token!')

    const updatedUser = await userModel.update(existUser._id, {
      isActive: true,
      verifyToken: null
    })
    return pickUser(updatedUser)
  } catch (error) { throw error }
}

const login = async (reqBody) => {
  try {
    const existUser = await userModel.findOneByEmail(reqBody.email)
    if (!existUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
    if (!existUser.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your account is not active. Please verify your email first.')
    if (!bcrypt.compareSync(reqBody.password, existUser.password)) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Incorrect email or password!')
    }

    const userInfo = { _id: existUser._id, email: existUser.email }
    const accessToken = jwtProvider.generateToken(userInfo, env.ACCESS_TOKEN_SECRET_SIGNATURE, env.ACCESS_TOKEN_LIFE)
    const refreshToken = jwtProvider.generateToken(userInfo, env.REFRESH_TOKEN_SECRET_SIGNATURE, env.REFRESH_TOKEN_LIFE)

    return { ...pickUser(existUser), accessToken, refreshToken }
  } catch (error) { throw error }
}

const refreshToken = async (clientRefreshToken) => {
  try {
    const refreshTokenDecoded = await jwtProvider.verifyToken(clientRefreshToken, env.REFRESH_TOKEN_SECRET_SIGNATURE)

    const existUser = await userModel.findOneById(refreshTokenDecoded._id)
    if (!existUser || existUser._destroy || !existUser.isActive) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Account not found or has been deactivated!')
    }

    const userInfo = { _id: existUser._id, email: existUser.email }
    const accessToken = await jwtProvider.generateToken(userInfo, env.ACCESS_TOKEN_SECRET_SIGNATURE, env.ACCESS_TOKEN_LIFE)

    return { accessToken }
  } catch (error) { throw error }
}

const update = async (userId, reqBody, userAvatarFile) => {
  try {
    const existUser = await userModel.findOneById(userId)
    if (!existUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
    if (!existUser.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your account is not active!')

    let updatedUser = {}

    if (reqBody.current_password && reqBody.new_password) {
      if (!bcrypt.compareSync(reqBody.current_password, existUser.password)) {
        throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your current password is incorrect!')
      }
      updatedUser = await userModel.update(existUser._id, { password: bcrypt.hashSync(reqBody.new_password, 8) })
    } else if (userAvatarFile) {
      const uploadResult = await cloudinaryProvider.streamUpload(userAvatarFile.buffer, 'mern-boilerplate-users')
      updatedUser = await userModel.update(existUser._id, { avatar: uploadResult.secure_url })
    } else {
      const updateData = {}
      if (reqBody.displayName) updateData.displayName = reqBody.displayName
      updatedUser = await userModel.update(existUser._id, updateData)
    }
    return pickUser(updatedUser)
  } catch (error) { throw error }
}

const googleLogin = async (reqBody) => {
  try {
    const { token } = reqBody
    let googlePayload = null
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: token,
        audience: env.GOOGLE_CLIENT_ID
      })
      googlePayload = ticket.getPayload()
    } catch (_err) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid Google token!')
    }

    if (!googlePayload || !googlePayload.email || !googlePayload.email_verified) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Google account is unverified or invalid!')
    }

    const { email, name, picture } = googlePayload

    let existUser = await userModel.findOneByEmail(email)

    if (existUser) {
      if (existUser._destroy) {
        throw new ApiError(StatusCodes.FORBIDDEN, 'Your account has been deleted!')
      }

      const updateData = {}
      if (!existUser.isActive) updateData.isActive = true
      if (!existUser.avatar && picture) updateData.avatar = picture
      if (Object.keys(updateData).length > 0) {
        existUser = await userModel.update(existUser._id, updateData)
      }
    } else {
      const username = email.split('@')[0]
      const newUser = {
        email,
        password: bcrypt.hashSync(uuidv4(), 8),
        username,
        displayName: name || username,
        avatar: picture || null,
        role: 'client',
        isActive: true
      }
      const createdUser = await userModel.createNew(newUser)
      existUser = await userModel.findOneById(createdUser.insertedId)
    }

    const userInfo = { _id: existUser._id, email: existUser.email }
    const accessToken = await jwtProvider.generateToken(userInfo, env.ACCESS_TOKEN_SECRET_SIGNATURE, env.ACCESS_TOKEN_LIFE)
    const refreshToken = await jwtProvider.generateToken(userInfo, env.REFRESH_TOKEN_SECRET_SIGNATURE, env.REFRESH_TOKEN_LIFE)

    return { ...pickUser(existUser), accessToken, refreshToken }
  } catch (error) { throw error }
}

export const userService = {
  createNew,
  verifyAccount,
  login,
  googleLogin,
  refreshToken,
  update
}

