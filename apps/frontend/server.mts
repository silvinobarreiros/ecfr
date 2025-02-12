/* eslint-disable no-console */
// server.ts
import { parse } from 'url'
import next from 'next'
import express, { Request, Response } from 'express'
import { createProxyMiddleware, Options } from 'http-proxy-middleware'

const PORT = parseInt(process.env.PORT || '3000', 10)
const hostname = '0.0.0.0'
const { NEXT_PUBLIC_BACK_END_API_URL } = process.env

// Always false when using standalone output
const dev = false

async function startServer() {
  const app = next({
    dev,
    dir: process.cwd(),
    hostname,
    port: PORT,
  })
  const handle = app.getRequestHandler()

  await app.prepare()

  const server = express()

  const backendProxyConfig: Options = {
    target: NEXT_PUBLIC_BACK_END_API_URL || 'http://localhost:4535',
    changeOrigin: true,
    on: {
      proxyReq: (proxyReq, req) => {
        console.log(`[Proxy] Routing request to backend: ${req.method} ${req.url}`)
      },
      proxyRes: (proxyRes, req) => {
        console.log(
          `[Proxy] Received response from backend: ${proxyRes.statusCode} ${req.method} ${req.url}`
        )
      },
    },
  }

  server.use('/api', createProxyMiddleware(backendProxyConfig))

  // Handle all other routes with Next.js
  server.all('*', (req: Request, res: Response) => {
    const parsedUrl = parse(req.url || '', true)
    console.log(`[Next.js] Handling route: ${req.method} ${req.url}`)
    return handle(req, res, parsedUrl)
  })

  server.listen(PORT, hostname, () => {
    console.log(`> Ready on http://${hostname}:${PORT}`)
    console.log(`> Backend API URL: ${NEXT_PUBLIC_BACK_END_API_URL}`)
  })
}

startServer().catch((err) => {
  console.error('Error starting server:', err)
  process.exit(1)
})
