import { Router } from "express";
import { prisma } from "../db.js";

const router = Router();

router.get("/orders", async (req, res) => {
	try {
		const orders = await prisma.order.findMany(
			{
				include:{
					OrderItem:{
						include:{
							Product:true
						}
					}
				}
			}
		);

		const ordersWithTotalPrices = orders.map((order) => {
			const totalPrice = order.OrderItem.reduce(
			  (total, item) => total + item.Product.price * item.quantity,
			  0
			);
			return { ...order, totalPrice };
		  });

		res.json(ordersWithTotalPrices)
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
			status:req.body.status
		} 
	});
	console.log(req.body.products);
	console.log(req.body.quantity);

	const productsGuard=req.body.products || [];
	const quantititiesGuard=req.body.quantity || [];
	const flag1=productsGuard !== null;
	const flag2=quantititiesGuard !== null;
	const flag3=productsGuard.length > 0;
	const flag4=quantititiesGuard.length > 0;
	const flag6= quantititiesGuard !== undefined;
	const flag7= productsGuard[0]==null?false:true;
	const flag8= quantititiesGuard[0]==null?false:true;

	console.log("flags");
	console.log(flag1);
	console.log(flag2);
	console.log(flag3);
	console.log(flag4);
	console.log(flag6);
	console.log(flag7);
	console.log(flag8);

	if(flag1 && flag2 && flag3 && flag4 && flag6 && flag7 && flag8) { 
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
		res.json(orderItems);
	}else{
		res.json({"message":"Order " +req.body.name+ " created whithout products"})
	}
}
);

router.delete("/orders/:id",async (req,res)=>{

	const orderItems=await prisma.orderItem.deleteMany(
		{
			where: {
				orderId:Number(req.params.id)
			}
		}
	)

	const order= await prisma.order.delete(
		{
			where:{
				id:Number(req.params.id)
			}
		}
	)
	
	
	res.json({"message":"Order"+req.params.id+" deleted"})

});

router.get("/orders/:id", async (req, res) => {
	try {
	  const orderId = Number(req.params.id);
	  const order = await prisma.order.findUnique({
		where: {
		  id: orderId
		},
		include: {
		  OrderItem: {
			include: {
			  Product: true,
			},
		  },
		},
	  });
  
	  if (!order) {
		return res.status(404).json({ error: "Order not found" });
	  }
	    
	  res.json(order);
	  
	} catch (error) {
	  res.status(500).json({ error: error.message });
	}
  });

router.put("/orders/:id", async (req, res) => {
	try {
		const orderId = Number(req.params.id);
		const { status, name } = req.body;

		// Update the order in the database
		const updatedOrder = await prisma.order.update({
		where: {
			id: orderId
		},
		data: {
			status,
			name
		},
		include: {
			OrderItem: {
			include: {
				Product: true
			}
			}
		}
		});

		res.json(updatedOrder);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

router.delete("/orderItem/:orderId/:productId", async (req, res) => {
	try {
	  const orderId = Number(req.params.orderId);
	  const productId = Number(req.params.productId);
  
	  // Delete the specific order item
	  const deletedOrderItem = await prisma.orderItem.deleteMany({
		where: {
		  AND: [
			{ orderId: orderId },
			{ productId: productId }
		  ]
		}
	  });
  
	  if (deletedOrderItem.count === 0) {
		return res.status(404).json({ error: "OrderItem not found" });
	  }
  
	  res.json({ message: "OrderItem deleted successfully" });
	} catch (error) {
	  res.status(500).json({ error: error.message });
	}
  });

router.put("/orderItem/:orderId/:productId", async (req, res) => {
	try {
	  const orderId = Number(req.params.orderId);
	  const productId = Number(req.params.productId);
  
	  const orderItem = await prisma.orderItem.findFirst({
		where: {
		  orderId: orderId,
		  productId: productId
		}
	  });
	  
	  if (!orderItem) {
		return res.status(404).json({ error: "OrderItem not found" });
	  }
  
	  orderItem.quantity = Number(req.body.quantity);
  
	  const updatedOrderItem = await prisma.orderItem.update({
		where: {
		  id: orderItem.id
		},
		data: {
		  quantity: orderItem.quantity
		}
	  });
  
	  res.json({ message: "OrderItem updated successfully", orderItem: updatedOrderItem });
	} catch (error) {
	  res.status(500).json({ error: error.message });
	}
});

//Create OrderItem with orderId and productId as req.body
router.post("/orderItem/", async (req, res) => {
	try {
		
	  const { orderId, productId, quantity } = req.body;  
	  
	  const createdOrderItem = await prisma.orderItem.create({
		data: {
		  quantity: quantity,
		  Order: {
			connect: {
			  id: orderId 
			}
		  },
		  Product: {
			connect: {
			  id: productId 
			}
		  }
		}
	  });
  
	  res.json({ message: "OrderItem created successfully", orderItem: createdOrderItem });
	} catch (error) {
	  res.status(500).json({ error: error.message });
	}
  });

export default router;
