import { APP_NAME } from '../config'
import { MENU_ITEMS } from '../types'
import type { MenuKey } from '../types'
import Icon from './Icon'

interface Props {
  active: MenuKey
  onSelect: (key: MenuKey) => void
}

export default function Sidebar({ active, onSelect }: Props) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <img src="/logo.svg" alt="" width={28} height={28} />
        <span>{APP_NAME}</span>
      </div>
      <nav>
        {MENU_ITEMS.map((item) => (
          <button
            key={item.key}
            className={`nav-item${item.key === active ? ' active' : ''}`}
            aria-current={item.key === active ? 'page' : undefined}
            onClick={() => onSelect(item.key)}
          >
            <Icon name={item.key} />
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  )
}
