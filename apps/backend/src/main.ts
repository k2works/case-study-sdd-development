import { buildApp } from './server.js'

const app = buildApp()
const port = Number(process.env.PORT ?? 3000)

app.listen({ port, host: '0.0.0.0' }, (err) => {
  if (err) {
    process.exit(1)
  }
})
