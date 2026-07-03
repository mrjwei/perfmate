/**
 * Renames "thread" to "workspace" throughout the data model (Notion-style
 * terminology, see PLAN.md Phase 7). Identifier rename only — no data
 * movement, no new columns/constraints beyond following the renamed tables.
 */

exports.shorthands = undefined

exports.up = (pgm) => {
  pgm.renameTable("threads", "workspaces")
  pgm.renameTable("thread_schedules", "workspace_schedules")

  pgm.renameColumn("workspace_schedules", "thread_id", "workspace_id")
  pgm.renameColumn("records", "thread_id", "workspace_id")

  pgm.renameConstraint("workspaces", "threads_pkey", "workspaces_pkey")
  pgm.renameConstraint("workspaces", "threads_userid_fkey", "workspaces_userid_fkey")

  pgm.renameConstraint("workspace_schedules", "thread_schedules_pkey", "workspace_schedules_pkey")
  pgm.renameConstraint(
    "workspace_schedules",
    "thread_schedules_weekday_check",
    "workspace_schedules_weekday_check"
  )
  pgm.renameConstraint(
    "workspace_schedules",
    "thread_schedules_thread_id_fkey",
    "workspace_schedules_workspace_id_fkey"
  )
  pgm.renameConstraint(
    "workspace_schedules",
    "thread_schedules_thread_id_weekday_unique",
    "workspace_schedules_workspace_id_weekday_unique"
  )

  pgm.renameConstraint("records", "records_thread_id_fkey", "records_workspace_id_fkey")
  pgm.renameConstraint("records", "unique_date_threadid", "unique_date_workspaceid")

  pgm.sql(`ALTER INDEX threads_userid_index RENAME TO workspaces_userid_index;`)
}

exports.down = (pgm) => {
  pgm.sql(`ALTER INDEX workspaces_userid_index RENAME TO threads_userid_index;`)

  pgm.renameConstraint("records", "unique_date_workspaceid", "unique_date_threadid")
  pgm.renameConstraint("records", "records_workspace_id_fkey", "records_thread_id_fkey")

  pgm.renameConstraint(
    "workspace_schedules",
    "workspace_schedules_workspace_id_weekday_unique",
    "thread_schedules_thread_id_weekday_unique"
  )
  pgm.renameConstraint(
    "workspace_schedules",
    "workspace_schedules_workspace_id_fkey",
    "thread_schedules_thread_id_fkey"
  )
  pgm.renameConstraint(
    "workspace_schedules",
    "workspace_schedules_weekday_check",
    "thread_schedules_weekday_check"
  )
  pgm.renameConstraint("workspace_schedules", "workspace_schedules_pkey", "thread_schedules_pkey")

  pgm.renameColumn("records", "workspace_id", "thread_id")
  pgm.renameColumn("workspace_schedules", "workspace_id", "thread_id")

  pgm.renameConstraint("workspaces", "workspaces_userid_fkey", "threads_userid_fkey")
  pgm.renameConstraint("workspaces", "workspaces_pkey", "threads_pkey")

  pgm.renameTable("workspace_schedules", "thread_schedules")
  pgm.renameTable("workspaces", "threads")
}
