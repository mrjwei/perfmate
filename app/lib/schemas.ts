import { z } from "zod"

const regex = /^\d{2}:\d{2}$/

export const timeString = z
  .string()
  .nullable()

export const breakSchema = z.object({
  id: z.string().uuid(),
  starttime: timeString.optional(),
  endtime: timeString.optional()
})
  .superRefine((data, ctx) => {
    if (data.starttime && data.endtime) {
      if (data.starttime >= data.endtime) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Break start time must be before end time",
          path: ['breaks', data.id, 'starttime'],
        })
      }
    }
    if (!data.starttime && data.endtime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Break start time is required when end time is present",
        path: ['breaks', data.id, 'starttime']
      })
    }
    if (data.starttime && !regex.test(data.starttime)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Break start time must be in hh:mm format",
        path: ['breaks', data.id, 'starttime'],
      })
    }
    if (data.endtime && !regex.test(data.endtime)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Break end time must be in hh:mm format",
        path: ['breaks', data.id, 'endtime'],
      })
    }
  })

export const baseSchema = z.object({
  id: z.string().uuid(),
  date: z.string({message: 'Date is required'}),
  starttime: timeString.optional(),
  endtime: timeString.optional(),
  breaks: z.array(breakSchema).optional()
})

export const updateSchema = baseSchema
  .superRefine((data, ctx) => {
    // Validate work start and end time
    if (data.starttime && data.endtime) {
      if (data.starttime > data.endtime) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Start time must not be later than end time",
          path: ['starttime']
        })
      }
    }
    if (!data.starttime && data.endtime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Start time is required when end time is present",
        path: ['starttime']
      })
    }
    if (data.starttime && !regex.test(data.starttime)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Start time must be in hh:mm format",
        path: ['starttime'],
      })
    }
    if (data.endtime && !regex.test(data.endtime)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End time must be in hh:mm format",
        path: ['endtime'],
      })
    }
    // Validate breaks
    if (data.breaks) {
      for (let i = 0; i < data.breaks.length; i++) {
        const currentBreak = data.breaks[i]

        if (data.starttime && data.endtime) {
          if (currentBreak.starttime && currentBreak.starttime < data.starttime) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Break start time must not be before work start time",
              path: ['breaks', currentBreak.id, 'starttime']
            })
          }
          if (currentBreak.endtime && currentBreak.endtime > data.endtime) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Break end time must not be after work end time",
              path: ['breaks', currentBreak.id, 'endtime']
            })
          }
        }

        if (i < data.breaks.length - 1) {
          const nextBreak = data.breaks[i + 1]
          if (currentBreak.starttime && currentBreak.endtime && nextBreak.starttime && nextBreak.endtime) {
            if (currentBreak.starttime < nextBreak.endtime && currentBreak.starttime >= nextBreak.starttime) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Break times must not overlap",
                path: ['breaks', currentBreak.id, 'starttime', nextBreak.id, 'starttime', nextBreak.id, 'endtime']
              })
            } else if (currentBreak.endtime > nextBreak.starttime && currentBreak.endtime <= nextBreak.endtime) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Break times must not overlap",
                path: ['breaks', currentBreak.id, 'endtime', nextBreak.id, 'starttime', nextBreak.id, 'endtime']
              })
            } else if (nextBreak.starttime < currentBreak.endtime && nextBreak.starttime >= currentBreak.starttime) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Break times must not overlap",
                path: ['breaks', nextBreak.id, 'starttime', currentBreak.id, 'starttime', currentBreak.id, 'endtime']
              })
            } else if (nextBreak.endtime > currentBreak.starttime && nextBreak.endtime <= currentBreak.endtime) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Break times must not overlap",
                path: ['breaks', nextBreak.id, 'endtime', currentBreak.id, 'starttime', currentBreak.id, 'endtime']
              })
            }
          }
          if (currentBreak.starttime && currentBreak.endtime && nextBreak.starttime) {
            if (nextBreak.starttime >= currentBreak.starttime && nextBreak.starttime < currentBreak.endtime) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Break times must not overlap",
                path: ['breaks', nextBreak.id, 'starttime', currentBreak.id, 'starttime', currentBreak.id, 'endtime']
              })
            }
          }
          if (nextBreak.starttime && nextBreak.endtime && currentBreak.starttime) {
            if (currentBreak.starttime >= nextBreak.starttime && currentBreak.starttime < nextBreak.endtime) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Break times must not overlap",
                path: ['breaks', currentBreak.id, 'starttime', nextBreak.id, 'starttime', nextBreak.id, 'endtime']
              })
            }
          }
        }
      }
    }
  })

export const creationSchema = baseSchema
  .omit({
    id: true
  })
  .superRefine((data, ctx) => {
    // Validate work start and end time
    if (!data.date) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Date is required",
        path: ['date']
      })
    }
    if (!data.starttime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Start time is required",
        path: ['starttime']
      })
    }
    if (data.starttime && data.endtime) {
      if (data.starttime > data.endtime) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Start time must not be later than end time",
          path: ['starttime']
        })
      }
    }
    if (!data.starttime && data.endtime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Start time is required if end time is present.",
        path: ['starttime']
      })
    }
    if (data.starttime && !regex.test(data.starttime)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Start time must be in hh:mm format",
        path: ['starttime'],
      })
    }
    if (data.endtime && !regex.test(data.endtime)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End time must be in hh:mm format",
        path: ['endtime'],
      })
    }
    // Validate breaks
    if (data.breaks) {
      for (let i = 0; i < data.breaks.length; i++) {
        const currentBreak = data.breaks[i]

        if (data.starttime && data.endtime) {
          if (currentBreak.starttime && currentBreak.starttime < data.starttime) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Break start time must not be before work start time",
              path: ['breaks', currentBreak.id, 'starttime']
            })
          }
          if (currentBreak.endtime && currentBreak.endtime > data.endtime) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Break end time must not be after work end time",
              path: ['breaks', currentBreak.id, 'endtime']
            })
          }
        }

        if (i < data.breaks.length - 1) {
          const nextBreak = data.breaks[i + 1]
          if (currentBreak.starttime && currentBreak.endtime && nextBreak.starttime && nextBreak.endtime) {
            if (currentBreak.starttime < nextBreak.endtime && currentBreak.starttime >= nextBreak.starttime) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Break times must not overlap",
                path: ['breaks', currentBreak.id, 'starttime', nextBreak.id, 'starttime', nextBreak.id, 'endtime']
              })
            } else if (currentBreak.endtime > nextBreak.starttime && currentBreak.endtime <= nextBreak.endtime) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Break times must not overlap",
                path: ['breaks', currentBreak.id, 'endtime', nextBreak.id, 'starttime', nextBreak.id, 'endtime']
              })
            } else if (nextBreak.starttime < currentBreak.endtime && nextBreak.starttime >= currentBreak.starttime) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Break times must not overlap",
                path: ['breaks', nextBreak.id, 'starttime', currentBreak.id, 'starttime', currentBreak.id, 'endtime']
              })
            } else if (nextBreak.endtime > currentBreak.starttime && nextBreak.endtime <= currentBreak.endtime) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Break times must not overlap",
                path: ['breaks', nextBreak.id, 'endtime', currentBreak.id, 'starttime', currentBreak.id, 'endtime']
              })
            }
          }
          if (currentBreak.starttime && currentBreak.endtime && nextBreak.starttime) {
            if (nextBreak.starttime >= currentBreak.starttime && nextBreak.starttime < currentBreak.endtime) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Break times must not overlap",
                path: ['breaks', nextBreak.id, 'starttime', currentBreak.id, 'starttime', currentBreak.id, 'endtime']
              })
            }
          }
          if (nextBreak.starttime && nextBreak.endtime && currentBreak.starttime) {
            if (currentBreak.starttime >= nextBreak.starttime && currentBreak.starttime < nextBreak.endtime) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Break times must not overlap",
                path: ['breaks', currentBreak.id, 'starttime', nextBreak.id, 'starttime', nextBreak.id, 'endtime']
              })
            }
          }
        }
      }
    }
  })

export const userBaseSchema = z
  .object({
    id: z.string().uuid(),
    name: z.string({message: 'Name is required'}),
    email: z.string({message: 'Email is required'}).email(),
    password: z.string({message: 'Password is required'}).min(6, {message: 'Password must have at least 6 characters'}),
    hourlywages: z.coerce.number().optional(),
    currency: z.string().optional(),
    taxincluded: z.boolean().optional()
  })

export const userCreationSchema = userBaseSchema
.omit({
  id: true
})

export const userUpdateSchema = userBaseSchema
.omit({
  id: true
})

export const userSettingsSchema = userBaseSchema
.omit({
  id: true,
  name: true,
  email: true,
  password: true,
})


