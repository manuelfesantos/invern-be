import { RolesEnum, User, UserDTO } from "@user-entity";

export const userDtoMock: UserDTO = {
  userId: "591fd975-606e-4d51-b42a-51a2f0d052a5",
  email: "example@example.com",
  firstName: "example",
  lastName: "example",
  cart: {
    cartId: "591fd975-606e-4d51-b42a-51a2f0d052a5",
    products: [],
  },
};

export const userMock: User = {
  userId: "591fd975-606e-4d51-b42a-51a2f0d052a5",
  password: "password",
  roles: [RolesEnum.USER],
  cart: {
    cartId: "591fd975-606e-4d51-b42a-51a2f0d052a5",
    products: [],
  },
  email: "example@example.com",
  firstName: "example",
  lastName: "example",
};
