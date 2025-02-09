import { customType } from 'drizzle-orm/pg-core'
import { deflateSync, inflateSync } from 'zlib'

export const compressedJson = customType<{ data: any }>({
  dataType() {
    return 'bytea'
  },
  fromDriver: (value: any) => {
    if (!value) return null

    const decompressed = inflateSync(value)
    return JSON.parse(decompressed.toString())
  },
  toDriver: (value: any) => {
    if (!value) return null

    const jsonString = JSON.stringify(value)
    return deflateSync(Buffer.from(jsonString))
  },
})
