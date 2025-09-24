import dbConnect from "@/lib/db";
import Review from "@/models/Review";

export async function GET() {
    try {
        await dbConnect();
        const Reviews = await Review.find({});
        return Response.json(
            { success: true, data: Reviews || [] },
            {status: 200}
        );
    } catch (error) {
        console.error("Error fetching Reviews:", error);
        return Response.json(
            { success: false, error: "Internal Server Error" }, 
            { status: 500 }
        );
    }
}