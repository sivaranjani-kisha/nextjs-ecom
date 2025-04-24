import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Cart from "@/models/ecom_cart_info";
import Product from "@/models/product"; // Assuming you have a Product model
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    await connectDB();

    // Get the token from headers
    const authHeader = req.headers.get('authorization');
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return NextResponse.json(
        { error: "Authorization token required" },
        { status: 401 }
      );
    }

    // Verify token and get user ID (you'll need your JWT verification logic)
    // This is a placeholder - replace with your actual token verification
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    // Parse the request body
    const { productId, quantity = 1 } = await req.json();

    // Validate input
    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Find existing cart for user
    let cart = await Cart.findOne({ userId });

    if (cart) {
      // Check if product already exists in cart
      const existingItemIndex = cart.items.findIndex(
        item => item.productId.toString() === productId
      );

      if (existingItemIndex >= 0) {
        // Update quantity if product exists
        cart.items[existingItemIndex].quantity += quantity;
      } else {
        // Add new item to cart
        cart.items.push({
          productId,
          quantity,
          price: product.special_price,
          name: product.name,
          image: product.images[0] // Assuming first image
        });
      }
    } else {
      // Create new cart
      cart = new Cart({
        userId,
        items: [{
          productId,
          quantity,
          price: product.price,
          name: product.name,
          image: product.images[0]
        }]
      });
    }

    // Recalculate totals
    cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    cart.totalPrice = cart.items.reduce(
      (sum, item) => sum + (item.price * item.quantity), 0
    );

    // Save the cart
    await cart.save();

    return NextResponse.json(
      { 
        message: "Product added to cart", 
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
    console.error("Cart error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update cart" },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    await connectDB();

    // Get the token from headers
    const authHeader = req.headers.get('authorization');
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return NextResponse.json(
        { error: "Authorization token required" },
        { status: 401 }
      );
    }

    // Verify token and get user ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    // Get cart with populated product details
    const cart = await Cart.findOne({ userId })
      .populate('items.productId', 'name price images');

    if (!cart) {
      return NextResponse.json(
        { message: "Cart is empty", cart: { items: [], totalItems: 0, totalPrice: 0 } },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { 
        cart: {
          id: cart._id,
          totalItems: cart.totalItems,
          totalPrice: cart.totalPrice,
          items: cart.items.map(item => ({
            productId: item.productId._id,
            name: item.productId.name,
            price: item.productId.price,
            image: item.productId.images[0],
            quantity: item.quantity
          }))
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Get cart error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get cart" },
      { status: 500 }
    );
  }
}

// PUT method for updating quantity
export async function PUT(req) {
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
    const { productId, quantity } = await req.json();

    if (quantity < 1) {
      return NextResponse.json(
        { error: "Quantity must be at least 1" },
        { status: 400 }
      );
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      return NextResponse.json(
        { error: "Cart not found" },
        { status: 404 }
      );
    }

    const itemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      return NextResponse.json(
        { error: "Product not found in cart" },
        { status: 404 }
      );
    }

    // Update quantity
    cart.items[itemIndex].quantity = quantity;

    // Recalculate totals
    cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    cart.totalPrice = cart.items.reduce(
      (sum, item) => sum + (item.price * item.quantity), 0
    );

    await cart.save();

    return NextResponse.json(
      { 
        message: "Cart updated",
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
    console.error("Update cart error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update cart" },
      { status: 500 }
    );
  }
}

// DELETE method for removing items
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
    const { productId } = await req.json();

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      return NextResponse.json(
        { error: "Cart not found" },
        { status: 404 }
      );
    }

    // Remove the item
    cart.items = cart.items.filter(
      item => item.productId.toString() !== productId
    );

    // Recalculate totals
    cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    cart.totalPrice = cart.items.reduce(
      (sum, item) => sum + (item.price * item.quantity), 0
    );

    await cart.save();

    return NextResponse.json(
      { 
        message: "Item removed from cart",
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
      { error: error.message || "Failed to remove from cart" },
      { status: 500 }
    );
  }
}