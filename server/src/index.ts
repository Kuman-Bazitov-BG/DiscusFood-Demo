import express from 'express'
import cors from 'cors'
import { env } from './env.js'
import { productsRouter } from './routes/products.js'
import { uploadRouter } from './routes/upload.js'
import { checkoutRouter } from './routes/checkout.js'
import { webhookRouter } from './routes/webhooks.js'

const app = express()

app.use(cors({ origin: env.CLIENT_URL }))

// Stripe webhooks need the RAW body for signature verification, so this route
// is mounted with express.raw() BEFORE the JSON body parser below.
app.use(
  '/api/webhooks/stripe',
  express.raw({ type: 'application/json' }),
  webhookRouter,
)

// JSON parser for every other route.
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/products', productsRouter)
app.use('/api/upload', uploadRouter)
app.use('/api/checkout', checkoutRouter)

// Central error handler (Express 5 forwards rejected async handlers here).
app.use(
  (
    err: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error(err)
    const message = err instanceof Error ? err.message : 'Internal Server Error'
    res.status(500).json({ error: message })
  },
)

app.listen(env.PORT, () => {
  console.log(`🐟 Discus Fish API running on http://localhost:${env.PORT}`)
})
