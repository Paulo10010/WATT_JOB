import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

// Cria uma instância única do Prisma Client com a extensão Accelerate
const prisma = new PrismaClient().$extends(withAccelerate());

// Exporta a instância para que outros arquivos possam usá-la.
export default prisma;

