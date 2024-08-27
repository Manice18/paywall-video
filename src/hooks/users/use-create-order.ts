import { InferRequestType, InferResponseType } from "hono";
import { useMutation } from "@tanstack/react-query";

import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<
  (typeof client.api.payments)["create-order"]["$post"],
  200
>;

type ReqeustType = InferRequestType<
  (typeof client.api.payments)["create-order"]["$post"]
>["json"];

export const useCreateOrder = () => {
  const mutation = useMutation<ResponseType, Error, ReqeustType>({
    mutationFn: async (json) => {
      const response = await client.api.payments["create-order"].$post({
        json,
      });

      if (!response.ok) throw new Error(response.statusText);

      return await response.json();
    },
    onError: () => {
      toast.error("Error creating order.");
    },
    onSuccess: () => {
      toast.success("Order created successfully.");
    },
  });

  return mutation;
};
