import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { s3Storage } from '@payloadcms/storage-s3'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import  Posts  from "./collections/Posts";

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
// First, set a variable to check if we're in the build phase
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
  }),
  sharp,
  plugins: [s3Storage({
      collections: {
        media: true,
      },
      bucket: process.env.AWS_S3_BUCKET_NAME || '',
      config: {
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
        },
        region: process.env.AWS_DEFAULT_REGION,
        // Important: force path style so images work on the frontend
        forcePathStyle: true,
      },
    }),],
})
