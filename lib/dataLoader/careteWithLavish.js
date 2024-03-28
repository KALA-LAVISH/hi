import ProductModel from "~/models/product";
import customRing from "~/models/customRing";
import settingsModel from "~/models/setting";
import dbConnect from "~/utils/dbConnect";

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

export default async function CreateWithLavishData() {
  try {
    await dbConnect();
    const settings = await settingsModel.findOne({});
    const custom = await customRing.findOne({}).populate("targetCategory");
    let product = [];
    let count = 0;
    if (custom) {
      product = await ProductModel.find({
        categories: custom.targetCategory.slug,
      })
        .limit(10)
        .select(productItemField)
        .sort("-_id");
      count = await ProductModel.countDocuments({
        categories: custom.targetCategory.slug,
      });
    }

    return {
      success: true,
      product,
      count,
      customRing: custom,
      settings,
    };
  } catch (err) {
    console.log(err);
    return {
      success: false,
      product: [],
      count: 0,
      customRing: {},
      settings: {},
    };
  }
}
