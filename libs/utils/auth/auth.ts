export const authenticate = (): string => {
  return "authenticated";
};
// Verificar se o token está certo aqui mas vai primeiro ao adapter
//Juntar data e encriptaçao pode ser feita aqui mas quem vai
// buscar info é o adapter
// Incluir logica de reciclar anonymous users
// Guardar secret keys e token keys no KV
