import path from 'node:path'
import { defineConfig } from 'prisma/config'

export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  migrate: {
    datasourceUrl: 'file:./prisma/dev.db'
  },
  datasource: {
    url: 'file:./prisma/dev.db'
  }
})