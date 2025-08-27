import express from 'express'


import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'

const prisma = new PrismaClient().$extends(withAccelerate())


/*import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient();
*/
const app = express()

app.use(express.json())


app.post('/users',async (req, res) => {
    //criar usuario
    await prisma.user.create({
        data: {
            email: req.body.email,
            name: req.body.name,
            age: req.body.age,
            role: req.body.role
        }
    })

    res.status(201).json(req.body)})


app.get('/users', async (req, res) => {

    const users = await prisma.user.findMany()
    
    res.status(200).json(users)
})

app.listen(3000)