export interface UsuarioFull {
  id: string
  username: string
  email: string
  role: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  companyId: string | null
  person: {
    id: string
    userId: string
    firstName: string
    lastName: string
    fullName: string
    contactEmail: string
    phoneNumber: string
    departmentId: string
    position: string
    status: string
    userCode: string
    createdAt: string
    updatedAt: string
    department: {
      id: string
      name: string
      description: string
      companyId: string
      isActive: boolean
    }
  }
}