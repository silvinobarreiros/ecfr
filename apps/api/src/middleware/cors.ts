import cors from 'cors'

const corsOptions = {
  origin: '*',
  methods: 'POST, OPTIONS, GET, PUT, PATCH, DELETE',
  allowedHeaders: [
    'Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With, X-API-KEY',
  ],
  credentials: true,
}

const middleware = cors(corsOptions)

export default middleware
