import { successResponse } from "@response-entity";
import { getProductById } from "@product-adapter";
import { HttpParams } from "@http-entity";
import { productDetailsSchema } from "@product-entity";
import { getImagesByProductId } from "@image-adapter";

export const getProductDetails = async (id: HttpParams): Promise<Response> => {
  const product = await getProductById(id as string);
  const images = await getImagesByProductId(id as string);
  return successResponse.OK(
    "success getting product details",
    productDetailsSchema.parse({ ...product, productImages: images }),
  );
};
