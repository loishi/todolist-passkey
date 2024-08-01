import express from 'express';
import prisma from '../db';

const router = express.Router();

// Middleware to check if user is authenticated
const isAuthenticated = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

router.use(isAuthenticated);

router.get('/', async (req, res) => {
  const todos = await prisma.todo.findMany({
    where: { userId: req.session.userId },
  });
  res.json(todos);
});

router.post('/', async (req, res) => {
  const { title } = req.body;
  const todo = await prisma.todo.create({
    data: {
      title,
      userId: req.session.userId!,
    },
  });
  res.json(todo);
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, completed } = req.body;
  const todo = await prisma.todo.update({
    where: { id, userId: req.session.userId },
    data: { title, completed },
  });
  res.json(todo);
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  await prisma.todo.delete({
    where: { id, userId: req.session.userId },
  });
  res.json({ success: true });
});

export default router;