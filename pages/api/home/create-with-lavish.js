import ProductModel from "~/models/product";
import dbConnect from "~/utils/dbConnect";

export default async function apiHandler(req, res) {
  const { method } = req;

  await dbConnect();

  switch (method) {
    case "GET":
      try {
        const { skip, category, subcategory } = req.query;
        const skipNum = Number(skip || 0);
        const args = [
          category ? { categories: category } : {},
          subcategory ? { subcategories: subcategory } : {},
        ];
        const productItemField = {
          name: 1,
          slug: 1,
          image: 1,
          unit: 1,
          unitValue: 1,
          price: 1,
          discount: 1,
          type: 1,
          variants: 1,
          quantity: 1,
          date: 1,
          review: 1,
        };

        const product = await ProductModel.find({ $and: args })
          .sort("-date")
          .limit(10)
          .skip(skipNum)
          .select(productItemField)
          .exec();
        const count = await ProductModel.countDocuments({ $and: args });
        res.json({ product, count });
      } catch (err) {
        console.log(err);
        res.status(400).json({ success: false });
      }
      break;

    default:
      res.status(400).json({ success: false });
      break;
  }
}
