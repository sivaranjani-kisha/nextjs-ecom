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
  return jwt.verify(token, process.env.JWT_SECRET);
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
    cart.items.push({
      productId,
      quantity,
      price: product.special_price ?? product.price,
      name: product.name,
      image: product.images[0],
      warranty: selectedWarranty,
      extendedWarranty: selectedExtendedWarranty,
      // upsells: upsellProducts
    });
  }
} else {
  // ✅ Create new cart
  cart = new Cart({
    userId,
    items: [{
      productId,
      quantity,
      price: product.special_price ?? product.price,
      name: product.name,
      image: product.images[0],
      warranty: selectedWarranty,
      extendedWarranty: selectedExtendedWarranty,
      upsells: upsellProducts
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

    const cart = await Cart.findOne({ userId }).populate(
      "items.productId",
      "name price images"
    );

    if (!cart) {
      return NextResponse.json(
        { message: "Cart is empty", cart: { items: [], totalItems: 0, totalPrice: 0 } },
        { status: 200 }
      );
    }

    const items = cart.items.map((item) => ({
      productId: item.productId._id,
      name: item.productId.name,
      price: item.price,
      image: item.productId.images[0],
      quantity: item.quantity,
      warranty: item.warranty || 0,
      extendedWarranty: item.extendedWarranty || 0,
    }));
    console.log(items);

    return NextResponse.json(
      {
        cart: {
          id: cart._id,
          totalItems: cart.totalItems,
          totalPrice: cart.totalPrice,
          items,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET cart error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
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

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      return NextResponse.json({ error: "Product not in cart" }, { status: 404 });
    }

    cart.items[itemIndex].quantity = quantity;
    const totals = calculateCartTotals(cart.items);
    cart.totalItems = totals.totalItems;
    cart.totalPrice = totals.totalPrice;

    await cart.save();

    return NextResponse.json(
      {
        message: "Cart updated",
        cart: {
          id: cart._id,
          ...totals,
          items: cart.items,
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
export async function DELETE(req) {
  try {
    await connectDB();
    const token = extractToken(req);
    const decoded = verifyToken(token);
    const userId = decoded.userId;

    const { productId } = await req.json();
    if (!productId) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId
    );

    const totals = calculateCartTotals(cart.items);
    cart.totalItems = totals.totalItems;
    cart.totalPrice = totals.totalPrice;

    await cart.save();

    return NextResponse.json(
      {
        message: "Item removed from cart",
        cart: {
          id: cart._id,
          ...totals,
          items: cart.items,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE cart error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
