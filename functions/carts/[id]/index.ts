import { getPassedTime, setTimer } from "@utils/timer";
import { Kafka } from "@upstash/kafka";

interface Env {
  UPSTASH_KAFKA_REST_URL: string;
  UPSTASH_KAFKA_REST_USERNAME: string;
  UPSTASH_KAFKA_REST_PASSWORD: string;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  return Response.json({ message: "build successful!" });
};
