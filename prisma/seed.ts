import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const categoryNames = [
	"Starters", "Vegetarian", "Non-Vegetarian", "Fish & Seafood", "Chicken", "Mutton",
	"Rice & Biryani", "Indian Main Course", "Chinese", "Continental", "Desserts",
	"Beverages", "Mocktails", "Bar Menu", "Chef Specials",
];

const banquetMenu = [
	{ name: "Crispy Fish Fry", category: "Fish & Seafood", description: "Bengali-style fish fillet with a crisp crumb coating.", imageUrl: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=900&q=85", isVeg: false },
	{ name: "Chicken Reshmi Kebab", category: "Chicken", description: "Tender chicken kebabs with a smooth, aromatic marinade.", imageUrl: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=900&q=85", isVeg: false },
	{ name: "Crispy Babycorn Chilli", category: "Vegetarian", description: "Crisp baby corn tossed with peppers and chilli.", imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=85", isVeg: true },
	{ name: "Blue Lagoon Mocktail", category: "Mocktails", description: "A bright, citrusy blue lagoon-style mocktail.", imageUrl: "https://images.pexels.com/photos/20371528/pexels-photo-20371528.jpeg?auto=compress&cs=tinysrgb&w=900", isVeg: true },
	{ name: "Gondhoraj Lemon Mojito", category: "Mocktails", description: "A refreshing mojito with fragrant Gondhoraj lime.", imageUrl: "https://images.pexels.com/photos/33817877/pexels-photo-33817877.jpeg?auto=compress&cs=tinysrgb&w=900", isVeg: true },
	{ name: "Paneer Tikka Kebab", category: "Vegetarian", description: "Char-grilled paneer with a spiced tikka marinade.", imageUrl: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=900&q=85", isVeg: true },
	{ name: "Basmati Rice & Dal", category: "Rice & Biryani", description: "Steamed basmati rice served with comforting dal.", imageUrl: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=85", isVeg: true },
	{ name: "Basanti Pulao", category: "Rice & Biryani", description: "Fragrant golden pulao with whole spices.", imageUrl: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=85", isVeg: true },
	{ name: "Bhetki Paturi", category: "Fish & Seafood", description: "Bhetki steamed in banana leaf with mustard and spices.", imageUrl: "https://images.pexels.com/photos/35532828/pexels-photo-35532828.jpeg?auto=compress&cs=tinysrgb&w=900", isVeg: false },
	{ name: "Kasha Mangsho", category: "Mutton", description: "Slow-cooked mutton in a rich Bengali-style gravy.", imageUrl: "https://images.unsplash.com/photo-1545247181-516773cae754?auto=format&fit=crop&w=900&q=85", isVeg: false },
	{ name: "Katla Kalia", category: "Fish & Seafood", description: "Katla fish in a traditional Bengali spiced curry.", imageUrl: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=900&q=85", isVeg: false },
	{ name: "Potoler Dorma", category: "Vegetarian", description: "Bengali pointed gourd filled and simmered in a light curry.", imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=85", isVeg: true },
	{ name: "Kolkata Chicken Biryani", category: "Rice & Biryani", description: "Fragrant basmati, tender chicken and classic Kolkata flavours.", imageUrl: "https://images.pexels.com/photos/4224304/pexels-photo-4224304.jpeg?auto=compress&cs=tinysrgb&w=900", isVeg: false },
	{ name: "Chicken Rezala", category: "Chicken", description: "Delicate chicken curry with a gently spiced, creamy sauce.", imageUrl: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=900&q=85", isVeg: false },
	{ name: "Rumali Roti", category: "Indian Main Course", description: "Soft, thin handkerchief-style flatbread.", imageUrl: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=85", isVeg: true },
	{ name: "Mixed Fried Rice", category: "Chinese", description: "Wok-tossed rice with vegetables, egg and mixed additions.", imageUrl: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=85", isVeg: false },
	{ name: "Chilli Chicken", category: "Chicken", description: "Crisp chicken tossed with peppers and a savoury chilli sauce.", imageUrl: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=900&q=85", isVeg: false },
	{ name: "Paneer Butter Masala", category: "Vegetarian", description: "Paneer simmered in a buttery tomato and spice gravy.", imageUrl: "https://images.unsplash.com/photo-1545247181-516773cae754?auto=format&fit=crop&w=900&q=85", isVeg: true },
	{ name: "Nolen Gur Sandesh", category: "Desserts", description: "Bengali sandesh delicately sweetened with date palm jaggery.", imageUrl: "https://images.pexels.com/photos/39959153/pexels-photo-39959153.jpeg?auto=compress&cs=tinysrgb&w=900", isVeg: true },
	{ name: "Rajbhog", category: "Desserts", description: "A classic Bengali chenna sweet with a rich centre.", imageUrl: "https://images.pexels.com/photos/39959153/pexels-photo-39959153.jpeg?auto=compress&cs=tinysrgb&w=900", isVeg: true },
	{ name: "Malpua with Rabdi", category: "Desserts", description: "Golden malpua served with thick, creamy rabdi.", imageUrl: "https://images.pexels.com/photos/39959153/pexels-photo-39959153.jpeg?auto=compress&cs=tinysrgb&w=900", isVeg: true },
	{ name: "Nolen Gur Ice Cream", category: "Desserts", description: "Creamy ice cream flavoured with date palm jaggery.", imageUrl: "https://images.unsplash.com/photo-1501446529957-6226bd447c46?auto=format&fit=crop&w=900&q=85", isVeg: true },
	{ name: "Sweet Mango Chutney", category: "Indian Main Course", description: "Sweet and tangy mango chutney to finish a Bengali meal.", imageUrl: "https://images.pexels.com/photos/32486623/pexels-photo-32486623.jpeg?auto=compress&cs=tinysrgb&w=900", isVeg: true },
	{ name: "Mishti Doi", category: "Desserts", description: "Traditional slow-set Bengali sweet yoghurt.", imageUrl: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=85", isVeg: true },
];

const previouslyBrokenImageUrls = new Set([
	"https://images.unsplash.com/photo-1513558161293-cdaf765edfd4?auto=format&fit=crop&w=900&q=85",
	"https://images.unsplash.com/photo-1515003197210-e0cd7184f8b5?auto=format&fit=crop&w=900&q=85",
	"https://images.unsplash.com/photo-1536935338788846bb9981813?auto=format&fit=crop&w=900&q=85",
	"https://images.unsplash.com/photo-1553909489-cd47e0ef937f?auto=format&fit=crop&w=900&q=85",
	"https://images.unsplash.com/photo-1563379091339-03246963d96c?auto=format&fit=crop&w=900&q=85",
	"https://images.unsplash.com/photo-1571115764595-644a1f56a55c?auto=format&fit=crop&w=900&q=85",
]);

async function main() {
	const email = (process.env.ADMIN_EMAIL || "admin@bouthakurani.in").toLowerCase();
	const password = process.env.ADMIN_PASSWORD;
	if (!password) throw new Error("Set ADMIN_PASSWORD before running the seed script.");

	const passwordHash = await bcrypt.hash(password, 12);
	await prisma.user.upsert({
		where: { email },
		update: {},
		create: { email, passwordHash, name: "Bouthakurani Administrator", role: "SUPER_ADMIN", mustChangePassword: true },
	});

	for (const [index, name] of categoryNames.entries()) {
		await prisma.menuCategory.upsert({ where: { name }, update: {}, create: { name, sortOrder: index } });
	}

	for (const menuItem of banquetMenu) {
		const { category: categoryName, ...itemData } = menuItem;
		const category = await prisma.menuCategory.findUniqueOrThrow({ where: { name: categoryName } });
		const existing = await prisma.menuItem.findFirst({ where: { name: menuItem.name, categoryId: category.id } });
		if (!existing) {
			await prisma.menuItem.create({ data: { ...itemData, categoryId: category.id, price: 0 } });
	} else if (existing.imageUrl && previouslyBrokenImageUrls.has(existing.imageUrl)) {
		await prisma.menuItem.update({ where: { id: existing.id }, data: { imageUrl: menuItem.imageUrl } });
		}
	}

	console.log(`Admin, ${categoryNames.length} categories, and ${banquetMenu.length} banquet menu selections seeded.`);
}

main().catch((error) => { console.error(error); process.exit(1); }).finally(() => prisma.$disconnect());