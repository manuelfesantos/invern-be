/* eslint-disable */

const button = document.querySelector("button");
button.addEventListener("click", async () => {
  const headers = new Headers();
  const result = await fetch("https://api-local.invernspirit.com/collections", {
    method: "GET",
    headers,
  });
});
