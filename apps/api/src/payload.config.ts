import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { Users } from './collections/Users'
import { Media } from './collections/Media'
import Posts from "./collections/Posts"

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const isBuild = process.env.BUILD === "true"

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Posts],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: 
        isBuild || process.env.NODE_ENV === 'development'
          ? process.env.BUILD_DATABASE || ''
          : process.env.DATABASE_URL || '',
    },
    // ✅ Utilisez migrationDir pour des migrations persistantes
    migrationDir: path.resolve(dirname, 'migrations'),
  }),
  sharp,
  plugins: [],
})