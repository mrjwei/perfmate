import { FlatCompat } from "@eslint/eslintrc"

const compat = new FlatCompat({ baseDirectory: import.meta.dirname })

const config = [
  {
    ignores: [
      // Vendored/unused component library, not imported by the app.
      "design-system/**",
      // node-pg-migrate migrations run under plain Node/CommonJS, not the
      // app's TS/React lint rules.
      "migrations/**",
      "scripts/**",
      ".next/**",
      "node_modules/**",
    ],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Some server actions must keep an unused leading (prevState, formData)
      // pair to match useActionState's required signature — allow opting out
      // via an underscore prefix instead of deleting the params.
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      // Raw Postgres row types intentionally use an index signature (`[column:
      // string]: any`) since the DB driver returns genuinely untyped rows —
      // downgraded rather than forcing `unknown` casts through every mapper.
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
]

export default config
