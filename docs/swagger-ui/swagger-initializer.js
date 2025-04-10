window.onload = function () {
  let currentAccessToken = null;
  window.ui = SwaggerUIBundle({
    url: "/swagger.yaml",
    dom_id: "#swagger-ui",
    deepLinking: true,
    presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
    plugins: [SwaggerUIBundle.plugins.DownloadUrl],
    layout: "StandaloneLayout",
    withCredentials: true,
    responseInterceptor: (response) => {
      console.log("response:", response);
      const contentType = response.headers["content-type"];

      if (
        response.ok &&
        contentType &&
        contentType.includes("application/json")
      ) {
        const { body } = response;
        if (
          body &&
          body.data &&
          typeof body.data.accessToken === "string" &&
          body.data.accessToken.length > 0
        ) {
          console.log("Swagger UI: Detected and storing new access token.");
          currentAccessToken = body.data.accessToken;
        }
        return response;
      }
      return response;
    },

    requestInterceptor: (request) => {
      console.log("request:", request);
      if (currentAccessToken) {
        console.log("Swagger UI: Adding Authorization header to request.");
        request.headers.Authorization = `Bearer ${currentAccessToken}`;
      } else {
        console.log("Swagger UI: No current access token to add.");
      }
      return request;
    },

    persistAuthorization: true,
  });
};
