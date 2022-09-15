import {PrismaClient} from '@prisma/client'
import {faker} from '@faker-js/faker';
import {jwtSign, hashValueWithSalt, generateSalt} from '../utils/crypto';
const {JWT_ROUNDS, JWT_SECRET, JWT_API_TTL} = process.env;
const SECRET = JWT_SECRET || 'Secret!';
const prisma = new PrismaClient()

function generateUserData(amount: number) {
  return Array.from(Array(amount), (_, idx) => {
    const email = idx ? faker.internet.email() : 'kiubmen@gmail.com';
    const username = idx ? faker.name.firstName() : 'KiubMen';
    const salt = generateSalt(Number(JWT_ROUNDS));
    const hashedPass = hashValueWithSalt('P4ssw0rd!', salt)

    return {
      username: username,
      salt: salt,
      itr: 2,
      email: email,
      verified: idx === 0,
      active: true,
      role: 1,
      password: hashedPass,
      verifyToken: '',
      todo: {
        create: Array.from(Array(amount), () => {
          return {
            title: faker.lorem.sentence(),
            completed: false
          }
        })
      },
      token: {
        create: Array.from(Array(1), (_, idx) => {
          return {
            token: jwtSign({email: email, sub: (idx + 1)}, SECRET, Number(JWT_API_TTL)),
            active: idx === (amount - 1)
          }
        })
      },
    }
  })
}

async function main() {
  console.log(`Start seeding ...`)

  // User
  const userData = generateUserData(3);
  for (const u of userData) {
    const user = await prisma.user.create({
      data: u,
    })
    console.log(`Created user with id: ${user.id}`)
  }

  console.log(`Seeding finished.`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
