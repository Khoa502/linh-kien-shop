import { jwtDecode } from 'jwt-decode'

export const decodeToken = (token) => {
  try {
    return jwtDecode(token)
  } catch {
    return null
  }
}

export const getRolesFromToken = (token) => {
  const decoded = decodeToken(token)
  if (!decoded) return []
  const roles = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
    || decoded['role']
    || decoded['roles']
    || []
  return Array.isArray(roles) ? roles : [roles]
}

export const isTokenExpired = (token) => {
  const decoded = decodeToken(token)
  if (!decoded) return true
  return decoded.exp * 1000 < Date.now()
}
