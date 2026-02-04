const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.findUnique({
        where: { username: 'Username001' },
    });
    console.log('User Record:', user);
    console.log('Role:', user?.role);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
