import { Router } from "express";
import { prisma } from "../db.js";

const router = Router();

router.get("/orders", async (req, res) => {
	try {
		const orders = await prisma.order.findMany(
			{
				include:{
					OrderItem:true
				}
			}
		);
		res.json(orders)
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});
//Add a product to new order
router.post("/orders/:productId", async (req, res) => {
	const product = await prisma.product.findUnique({
		where: {
			id: Number(req.params.productId),
		}
	});

	const order= await prisma.order.create({
		data:{
			name:req.body.name,
		} 
	});

	const orderItem= await prisma.orderItem.create({
		data:{
			orderId: order.id,
			productId: product.id,
			quantity: req.body.quantity

		}
	})
	
	res.json(orderItem);
});

//Create new Order
router.post("/orders/", async (req, res) => {

	const order= await prisma.order.create({
		data:{
			name:req.body.name,
		} 
	});
	const selectedProducts = await prisma.product.findMany({
		where:{
			id:{
				in: Object.values(req.body.products)
			}
		}
	})
	const quantities = Object.values(req.body.quantity)

	const orderItemsData = selectedProducts.map((product, index) => ({
		orderId: order.id,
		productId: product.id,
		quantity: quantities[index]

	  }));
	  
	  const orderItems = await prisma.orderItem.createMany({
		data: orderItemsData,
	  });
	/*
	for(selectedProduct in selectedProducts){
		selectedProduct.OrderItem
		
	}*/

	

	/*const orderItem= await prisma.orderItem.create({
		data:{
			orderId: order.id,
			Product:{
				push:selectedProducts
			}
			productId: product.id,
			quantity: req.body.quantity

		}
	})*/
	/*const orderItems=await prisma.orderItem.createMany({
		
		/*data:{
			orderId:order.id,
			productId:{
				push:selectedProducts
			}
		},
	})*/
	
	res.json(orderItems);
});

export default router;
