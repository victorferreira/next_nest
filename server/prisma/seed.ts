import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

const userData: Prisma.UserCreateInput[] = [
  {
    name: 'Leanne Graham',
    // username: 'Bret',
    email: 'Sincere@april.biz',
    phone: '1-770-736-8031 x56442',
    website: 'hildegard.org',
  },
  {
    name: 'Ervin Howell',
    // username: 'Antonette',
    email: 'Shanna@melissa.tv',
    phone: '010-692-6593 x09125',
    website: 'anastasia.net',
  },
  {
    name: 'Clementine Bauch',
    // username: 'Samantha',
    email: 'Nathan@yesenia.net',
    phone: '1-463-123-4447',
    website: 'ramiro.info',
  },
  {
    name: 'Patricia Lebsack',
    // username: 'Karianne',
    email: 'Julianne.OConner@kory.org',
    phone: '493-170-9623 x156',
    website: 'kale.biz',
  },
  {
    name: 'Chelsey Dietrich',
    // username: 'Kamren',
    email: 'Lucio_Hettinger@annie.ca',
    phone: '(254)954-1289',
    website: 'demarco.info',
  },
  {
    name: 'Mrs. Dennis Schulist',
    // username: 'Leopoldo_Corkery',
    email: 'Karley_Dach@jasper.info',
    phone: '1-477-935-8478 x6430',
    website: 'ola.org',
  },
  {
    name: 'Kurtis Weissnat',
    // username: 'Elwyn.Skiles',
    email: 'Telly.Hoeger@billy.biz',
    phone: '210.067.6132',
    website: 'elvis.io',
  },
  {
    name: 'Nicholas Runolfsdottir V',
    // username: 'Maxime_Nienow',
    email: 'Sherwood@rosamond.me',
    phone: '586.493.6943 x140',
    website: 'jacynthe.com',
  },
  {
    name: 'Glenna Reichert',
    // username: 'Delphine',
    email: 'Chaim_McDermott@dana.io',
    phone: '(775)976-6794 x41206',
    website: 'conrad.com',
  },
  {
    name: 'Clementina DuBuque',
    // username: 'Moriah.Stanton',
    email: 'Rey.Padberg@karina.biz',
    phone: '024-648-3804',
    website: 'ambrose.net',
  },
];

async function main() {
  for (const u of userData) {
    await prisma.user.create({ data: u });
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
