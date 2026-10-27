import { useState } from 'react'
import Sidebar from './components/Sidebar'
import PageView from './components/PageView'
import type { MenuKey } from './types'

export default function App() {
  const [active, setActive] = useState<MenuKey>('dashboard')

  return (
    <div className="app-shell">
      <Sidebar active={active} onSelect={setActive} />
      <main className="content">
        <PageView active={active} />
      </main>
    </div>
  )
}
