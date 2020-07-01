import { Router } from 'express';
import { Crash } from '../../controllers';

const router = Router();

router.route('/')
  .post(Crash.echo)

export default router;
