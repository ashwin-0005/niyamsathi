import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'NiyamSathi backend is running' })
})

// Example API endpoint - rules data
app.get('/api/rules', (req, res) => {
  res.json({
    message: 'Rules endpoint',
    note: 'This will serve rule data from database or cache'
  })
})

// Example API endpoint - compliance check
app.post('/api/compliance/check', (req, res) => {
  const { plotArea, roadWidth, use, proposedSetback } = req.body

  if (!plotArea || !roadWidth || !use) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  res.json({
    status: 'success',
    compliance: 'preliminary_check_only',
    message: 'Compliance check result - see frontend for full details'
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' })
})

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`🚀 NiyamSathi backend running on http://localhost:${PORT}`)
})
