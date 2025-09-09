import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Cart from "@/models/ecom_cart_info";
import Product from "@/models/product";
import jwt from "jsonwebtoken";

/** Utils **/
const extractToken = (req) => {
  const authHeader = req.headers.get("authorization");
  return authHeader?.split(" ")[1];
};

const verifyToken = (token) => {
  if (!token) throw new Error("Authorization token required");
   try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      throw new Error("Token has expired");
    } else {
      throw new Error("Invalid token");
    }
  }
};

const calculateCartTotals = (items) => {
  let totalItems = 0;
  let totalPrice = 0;

  for (const item of items) {
    const base = item.price * item.quantity;
    const warranty = item.warranty || 0;
    const extended = item.extendedWarranty || 0;
    const upsells = item.upsells?.reduce((uSum, u) => uSum + (u.price || 0), 0) || 0;

    totalItems += item.quantity;
    totalPrice += base + warranty + extended + upsells;
  }

  return { totalItems, totalPrice };
};

/** POST - Add to Cart **/
export async function POST(req) {
  try {
    await connectDB();
    const token = extractToken(req);
    const decoded = verifyToken(token);
    const userId = decoded.userId;

    const {
      productId,
      quantity = 1,
      selectedWarranty = 0,
      selectedExtendedWarranty = 0,
      upsellProducts = [],
    } = await req.json();
    console.log("Selected warranty:", selectedWarranty);
console.log("Selected extended warranty:", selectedExtendedWarranty);
// console.log("Upsell products:", upsellProducts);

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

   if (cart) {
  // ✅ Check if item already exists in cart
  const existingItemIndex = cart.items.findIndex(
    item => item.productId.toString() === productId
  );

  if (existingItemIndex >= 0) {
    // ✅ Update quantity and extra charges if already exists
    cart.items[existingItemIndex].quantity += quantity;
    cart.items[existingItemIndex].warranty = selectedWarranty;
    cart.items[existingItemIndex].extendedWarranty = selectedExtendedWarranty;
    // cart.items[existingItemIndex].upsells = upsellProducts;
  } else {
    // ✅ Add new item to cart
    console.log("product:"+product.item_code);
    cart.items.push({
      item_code:product.item_code,
      productId,
      quantity,
      price: product.special_price ?? product.price,
      name: product.name,
      image: product.images[0],
      warranty: selectedWarranty,
      extendedWarranty: selectedExtendedWarranty,
      actual_price: product.special_price,
      // upsells: upsellProducts
    });
  }
} else {
  // ✅ Create new cart
  cart = new Cart({
    userId,
    items: [{
      item_code:product.item_code,
      productId,
      quantity,
      price: product.special_price ?? product.price,
      name: product.name,
      image: product.images[0],
      warranty: selectedWarranty,
      extendedWarranty: selectedExtendedWarranty,
      upsells: upsellProducts,
      actual_price: product.special_price,
    }]
  });
}

    // console.log("Cart items before calculating totals:", JSON.stringify(cart.items, null, 2));


    const totals = calculateCartTotals(cart.items);
    cart.totalItems = totals.totalItems;
    cart.totalPrice = totals.totalPrice;
    // console.log(totals);

    await cart.save();

    return NextResponse.json(
      {
        message: "Product added to cart",
        cart: {
          id: cart._id,
          ...totals,
          items: cart.items,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("POST cart error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/** GET - Fetch Cart **/
export async function GET(req) {
  try {
    await connectDB();
    const token = extractToken(req);
    const decoded = verifyToken(token);
    const userId = decoded.userId;
    const productdata = [];
    const cart = await Cart.findOne({ userId }).populate(
      "items.productId",
      "name price images item_code quantity"
    );

    if (!cart) {
      return NextResponse.json(
        { message: "Cart is empty", cart: { items: [], totalItems: 0, totalPrice: 0 } },
        { status: 200 }
      );
    }

      const items = await Promise.all(
      cart.items.map(async (item) => {
       // console.log(item);
        const original_quantity = await getQuantity(item.productId.item_code);
        return {
          original_quantity,
          item_code: item.productId.item_code,
          productId: item.productId._id,
          name: item.productId.name,
          price: item.price,
          image: item.productId.images[0],
          quantity: item.quantity,
          warranty: item.warranty || 0,
          extendedWarranty: item.extendedWarranty || 0,
          actual_price: item.productId.price,
        };
      })
    );
    console.log(items);



    return NextResponse.json(
      {
        cart: {
          id: cart._id,
          totalItems: cart.totalItems,
          totalPrice: cart.totalPrice,
          items,
        },
        products:{productdata},
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET cart error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function getQuantity(item_code) {
  const product = await Product.findOne({ item_code }).lean();
  return product?.quantity ?? null;
}

/** PUT - Update Quantity **/
export async function PUT(req) {
  try {
    await connectDB();
    const token = extractToken(req);
    const decoded = verifyToken(token);
    const userId = decoded.userId;

    const { productId, quantity } = await req.json();
    if (!productId || quantity < 1) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    console.log(cart.items);

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    console.log(itemIndex);
    if (itemIndex === -1) {
      return NextResponse.json({ error: "Product not in cart" }, { status: 404 });
    }

    cart.items[itemIndex].quantity = quantity;
    const item_code = cart.items[itemIndex].item_code;
    console.log(item_code);
     const original_quantity = await getQuantity(item_code);
    const totals = calculateCartTotals(cart.items);
    cart.totalItems = totals.totalItems;
    cart.totalPrice = totals.totalPrice;
    cart.items[itemIndex].original_quantity = original_quantity;
console.log(cart.items);
    
    
    await cart.save();

cart.items.forEach((item) => {
  console.log(item);
});
    const items = cart.items.map((item) => ({
      productId: item.productId._id,
      name: item.name,
      price: item.price,
      image: item.productId.images,
      quantity: item.quantity,
      item_code: item.productId.item_code,
      original_quantity: item.original_quantity ?? null, // dynamically attach
    }));


    return NextResponse.json(
      {
        message: "Cart updated",
        cart: {
          id: cart._id,
          ...totals,
          items: items,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("PUT cart error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/** DELETE - Remove Item **/
// export async function DELETE(req) {
//   try {
//     await connectDB();
//     const token = extractToken(req);
//     const decoded = verifyToken(token);
//     const userId = decoded.userId;

//     const { productId } = await req.json();
//     if (!productId) {
//       return NextResponse.json({ error: "Product ID required" }, { status: 400 });
//     }

//     const cart = await Cart.findOne({ userId });
//     if (!cart) {
//       return NextResponse.json({ error: "Cart not found" }, { status: 404 });
//     }

//     cart.items = cart.items.filter(
//       (item) => item.productId.toString() !== productId
//     );

//     const totals = calculateCartTotals(cart.items);
//     cart.totalItems = totals.totalItems;
//     cart.totalPrice = totals.totalPrice;

//     await cart.save();

//     return NextResponse.json(
//       {
//         message: "Item removed from cart",
//         cart: {
//           id: cart._id,
//           ...totals,
//           items: cart.items,
//         },
//       },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("DELETE cart error:", error);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }

export async function DELETE(req) {
  try {
    await connectDB();
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return NextResponse.json(
        { error: "Authorization token required" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;
    const { productId, clearAll } = await req.json();

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    if (clearAll) {
      // Clear the entire cart
      cart.items = [];
      cart.totalItems = 0;
      cart.totalPrice = 0;
    } else {
      // Remove a specific item
      const existingItemIndex = cart.items.findIndex(
        item => item.productId.toString() === productId
      );

      if (existingItemIndex === -1) {
        return NextResponse.json({ error: "Item not found in cart" }, { status: 404 });
      }

      cart.items.splice(existingItemIndex, 1);

      // Recalculate totals
      cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
      cart.totalPrice = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }

    await cart.save();

    return NextResponse.json(
      {
        message: clearAll ? "Cart cleared" : "Item removed from cart",
        cart: {
          id: cart._id,
          totalItems: cart.totalItems,
          totalPrice: cart.totalPrice,
          items: cart.items
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Remove from cart error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update cart" },
      { status: 500 }
    );
  }
}
