import { customType, uuid, timestamp, PgEnum, serial } from 'drizzle-orm/pg-core'

export const emailType = customType<{ data: string }>({
  dataType() {
    return 'email_type'
  },
})

export const phoneType = customType<{ data: string }>({
  dataType() {
    return 'phone_number_type'
  },
})

const common = () => ({
  id: uuid('id').primaryKey().defaultRandom(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
})

// allows generic enums to be defined which can be used in code as well as creation of db
const enumToArray = <T extends { [key: string]: string }>(enumObj: T): [string, ...string[]] => {
  const values = Object.values(enumObj)
  return values as [string, ...string[]]
}

export default common
export { enumToArray }
