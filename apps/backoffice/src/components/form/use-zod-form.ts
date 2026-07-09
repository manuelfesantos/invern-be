import { zodResolver } from "@hookform/resolvers/zod";
import {
  useForm,
  type FieldValues,
  type UseFormProps,
  type UseFormReturn,
} from "react-hook-form";
import type { ZodType } from "zod";

// RHF wired to a Zod schema so client validation mirrors the backend's Zod.
// zod v4 + @hookform/resolvers generics don't line up cleanly; the resolver is
// correct at runtime, so we cast at this single seam.
export function useZodForm<T extends FieldValues>(
  schema: ZodType<T>,
  props?: Omit<UseFormProps<T>, "resolver">,
): UseFormReturn<T> {
  return useForm<T>({
    ...props,
    resolver: zodResolver(schema as never) as UseFormProps<T>["resolver"],
  });
}
