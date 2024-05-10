import { successResponse } from "@response-entity";
import { getProductById } from "@product-adapter";
import { HttpParams } from "@http-entity";
import { productDetailsSchema } from "@product-entity";
import { getImagesByProductId } from "@image-adapter";
import { uuidSchema } from "@global-entity";

export const getProductDetails = async (id: HttpParams): Promise<Response> => {
  const productId = uuidSchema("product id").parse(id);
  const product = await getProductById(productId);
  const images = await getImagesByProductId(productId);
  return successResponse.OK(
    "success getting product details",
    productDetailsSchema.parse({ ...product, productImages: images }),
  );
};
