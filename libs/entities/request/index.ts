import type { Role } from "@user-entity";

export type Credentials = {
  userId?: string;
  cartId?: string;
  customerEmail?: string;
  accessToken?: string;
  refreshToken: string;
  remember?: boolean;
  address?: string;
  userDetails?: string;
  shippingMethod?: string;
  /** Only set for logged-in callers; undefined for anonymous. */
  role?: Role;
};
