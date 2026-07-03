import { createNavigation } from "next-intl/navigation"
import { routing } from "@/i18n/routing"

export const { Link, usePathname, useRouter, redirect, permanentRedirect, getPathname } =
  createNavigation(routing)
