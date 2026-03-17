import express from 'express';

const app = express();

app.use(express.json());

// ヘルスチェック
app.get('/api/health', (_req, res) => {
  res.json({ status: 'UP' });
});

export { app };
