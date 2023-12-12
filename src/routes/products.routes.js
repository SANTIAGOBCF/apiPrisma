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

	const orderItemsToDelete=await prisma.orderItem.deleteMany({
		where:{
			productId:Number(req.params.id)
		}
   });
	const product = await prisma.product.delete({
		where: {
			id: Number(req.params.id),
		},
	});
	res.json({"deleted":req.params.id});
});

router.get("/products/:id", async (req, res) => {
	try {
		const product = await prisma.product.findUnique({
			where: {
				id: Number(req.params.id),
			}
		});
		res.json(product);
	} catch (error) {
		res.json(error);
	}
});

router.put("/products/:id", async (req, res) => {
	
		
	try {
		const product = await prisma.product.update({
			where: {
				id: Number(req.params.id),
			},
			data:{
				name:req.body.name,
				price:req.body.price
			}
		});
		res.json(product);
	} catch (error) {
		res.json({ error: error	})
	}
	
});



export default router;
