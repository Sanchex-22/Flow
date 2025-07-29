import { jwtDecode } from "jwt-decode"

export interface DecodedToken {
    id: string
    username?: string
    roles?: string
    exp: number
    iat: number
  }

  export interface DecodedTokenPublic {
    metaData: DecodedToken
  }
export const decodeToken = (): DecodedToken | null => {
  const token = localStorage.getItem('jwt')
  if (!token) return null

  try {
    const decoded = jwtDecode<DecodedToken>(token)
    return decoded
  } catch (error) {
    console.error('Error decoding token:', error)
    return null
  }
}

export const decodeTokenPublic = (jwt: string | null): DecodedTokenPublic | null => {
  if (!jwt) return null

  try {
    const decoded = jwtDecode<DecodedTokenPublic>(jwt)
    return decoded
  } catch (error) {
    console.error('Error decoding token:', error)
    return null
  }
}

export const Token = (): string | null => {
  const stored = localStorage.getItem('jwt')
  if (!stored) return null

  try {
    const parsed = JSON.parse(stored)
    return parsed.token ?? null
  } catch (error) {
    console.error('Error parsing token:', error)
    return null
  }
}



