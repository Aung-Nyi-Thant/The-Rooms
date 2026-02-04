const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const username = 'Username001';
    const accessKey = 'Accmobile@001';
    const role = 'admin';

    const access_key_hash = await bcrypt.hash(accessKey, 12);

    const admin = await prisma.user.upsert({
        where: { username },
        update: { role },
        create: {
            username,
            access_key_hash,
            role,
            status: 'active',
        },
    });

    console.log(`[SEED] Admin account verified: ${admin.username}`);
    console.log('[SEED] Seed completed successfully');
}

main()
    .catch((e) => {
        console.error(`[SEED ERROR] ${e.message}`);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
