import type { ReactNode } from 'react'

interface Props {
  title: string
  children?: ReactNode // optional action on the right, e.g. the Back to List button
}

export default function Header({ title, children }: Props) {
  return (
    <header className="page-header">
      <h1>{title}</h1>
      {children}
    </header>
  )
}
