import { User } from "next-auth"
import {
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import Button from '@/app/ui/button/button'

export default function GlobalHeader({user}: {user: User}) {
  return (
    <header className="flex items-center justify-between">
      <h1>Logo</h1>
      <Button type="button" className="flex items-center">
        <span className="mr-2">{user.name}</span>
        <ChevronDownIcon className="w-4" />
      </Button>
    </header>
  )
}
