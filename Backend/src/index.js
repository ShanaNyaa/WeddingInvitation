import express from 'express'
import cors from 'cors'
import publicRoutes from './routes/public.js'
import authRoutes from './routes/auth.js'
import adminRoutes from './routes/admin.js'

const app = express()
const PORT = process.env.PORT || 8080

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

app.use(express.json())

app.use('/api', publicRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/admin', adminRoutes)

app.listen(PORT, () => {
  console.log(`Backend API running on port ${PORT}`)
})
