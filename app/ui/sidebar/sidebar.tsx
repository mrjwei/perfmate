import LinkItem from '@/app/ui/link-item/link-item'

const LINKS = [
  {href: '/', children: 'Home'},
  {href: '/records', children: 'Records'},
  {href: '/', children: 'Setting'},
]

export default function Sidebar() {
  return (
    <div className="bg-lime-600 text-white py-8">
      <h1>Logo</h1>
      <ul>
        {LINKS.map((l: any) => {
          const {href, children } = l
          return (
            <li>
              <LinkItem href={href}>{children}</LinkItem>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
