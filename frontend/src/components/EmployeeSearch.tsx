import Icon from './Icon'

interface Props {
  value: string
  onChange: (value: string) => void
}

export default function EmployeeSearch({ value, onChange }: Props) {
  return (
    <div className="filters">
      <label className="field search-field">
        <span>Search</span>
        <div className="input-icon">
          <Icon name="search" />
          <input type="search" placeholder="Employee ID or name" value={value} onChange={(e) => onChange(e.target.value)} />
        </div>
      </label>
    </div>
  )
}
