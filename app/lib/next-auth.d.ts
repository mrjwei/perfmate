// A plain side-effect import (no named bindings) is enough to make this
// file a module rather than a global script — without it, TypeScript
// treats the declare-module block below as a full replacement of
// "next-auth"'s types instead of an augmentation, breaking every other
// import from that package.
import "next-auth"

declare module "next-auth" {
  interface Session {
    user: User
  }
  interface User {
    id: string
    name: string
    email: string
  }
}
