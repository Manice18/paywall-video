import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export const useSignedUrl = (iFrameUrl: string) => {
  const query = useQuery({
    queryKey: ["signedUrl"],
    queryFn: async () => {
      const response = await client.api.video["get-signed-url"].$get({
        query: {
          iFrameUrl,
        },
      });
      if (!response.ok) throw new Error(response.statusText);

      const data = await response.json();

      return data.data;
    },
  });

  return query;
};
