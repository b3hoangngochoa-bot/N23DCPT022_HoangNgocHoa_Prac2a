const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // 1. Tạo category mẫu
  const mobile = await prisma.category.upsert({
    where: { slug: "mobile" },
    update: {},
    create: {
      name: "Điện thoại",
      slug: "mobile",
      description: "Điện thoại smartphone",
    },
  });

  // 2. Tạo danh sách sản phẩm mẫu
  await prisma.product.createMany({
    data: [
      {
        name: "iPhone 15 Pro",
        slug: "iphone-15-pro",
        price: 27990000,
        stock: 50,
        categoryId: mobile.id,
      },
      {
        name: "Samsung Galaxy S24",
        slug: "samsung-s24",
        price: 22990000,
        stock: 30,
        categoryId: mobile.id,
      },
    ],
    skipDuplicates: true,
  });

  console.log("Seed dữ liệu thành công!");
}

main().catch(console.error).finally(() => prisma.$disconnect());