import { RolesEnum, User, UserDTO } from "@user-entity";

export const userDtoMock: UserDTO = {
  email: "example@example.com",
  firstName: "example",
  lastName: "example",
  cart: {
    products: [],
  },
  version: 1,
};

export const userMock: User = {
  id: "591fd975-606e-4d51-b42a-51a2f0d052a5",
  password: "password",
  role: RolesEnum.USER,
  cart: {
    id: "591fd975-606e-4d51-b42a-51a2f0d052a5",
    products: [],
  },
  email: "example@example.com",
  firstName: "example",
  lastName: "example",
  version: 1,
};
