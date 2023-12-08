import { Router } from "express";
import { prisma } from "../db.js";

const router = Router();

router.get("/products", async (req, res) => {
	try {
		const products = await prisma.product.findMany();
		res.json(products)
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

router.post("/products", async (req, res) => {
	try {
		const product = await prisma.product.create({
			data: req.body,
		});
		res.json(product);
	} catch (error) {
		res.status(500).json({ error: 'An error occurred' });
	}
});


router.delete("/products/:id", async (req, res) => {
	const product = await prisma.product.delete({
		where: {
			id: Number(req.params.id),
		},
	});
	res.json({"deleted":req.params.id});
});

router.patch("/products/:id", async (req, res) => {
	try {
		const product = await prisma.product.update({
			where: {
				id: Number(req.params.id),
			},
			data: req.body,
			include: {
				category: true,
			},
		});
		res.json(product);
	} catch (error) {
		res.json(error);
	}
});



export default router;
