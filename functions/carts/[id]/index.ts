import { getPassedTime, setTimer } from "@utils/timer";
import { Kafka } from "@upstash/kafka";

interface Env {
  UPSTASH_KAFKA_REST_URL: string;
  UPSTASH_KAFKA_REST_USERNAME: string;
  UPSTASH_KAFKA_REST_PASSWORD: string;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  setTimer();

  context.waitUntil(
    fetch(
      "https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/8ae4a7da-a70e-4c75-a114-eb1e82fa0aa2",
      {
        method: "POST",
      },
    ),
  );
  return Response.json({ message: "build successful!" });
};
