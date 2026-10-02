import type { AuthUser } from '../../features/auth/api/authApi'

export function roleLabel(user: AuthUser) {
  const role = user.roles[0]
  return ({ Student: 'Estudante', Professor: 'Professor', Employee: 'Funcionário', Visitor: 'Visitante', Administrator: 'Gestão' } as Record<string, string>)[role] ?? role ?? 'Usuário'
}

export function initials(fullName: string) {
  return fullName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'RU'
}
