"use client";

import { Button } from "@/components/ui/button";
import { useCheckPremium } from "@/hooks/users/user-check-premium";
import Upgrade from "./upgrade";
import { useSignedUrl } from "@/hooks/videos/use-get-signed-url";

const VideoPlayer = () => {
  const { data: isPremium, isPending, isError } = useCheckPremium();
  const {
    data: signedUrl,
    isPending: isSignedUrlPending,
    isError: isSignedUrlError,
  } = useSignedUrl(
    "https://iframe.mediadelivery.net/embed/288439/d1b2eccc-3621-4d86-ab84-4bd29780b2a4"
  );
  // ?autoplay=true&loop=false&muted=false&preload=true&responsive=true
  if (isPending || isSignedUrlPending) return <div>Loading...</div>;

  if (isError || isSignedUrlError) return <div>Error</div>;

  if (!isPremium || !signedUrl) {
    return (
      <div>
        <p>Sorry, this video is only available to premium users.</p>
        <Upgrade />
      </div>
    );
  }
  return (
    <iframe
      src={signedUrl}
      loading="lazy"
      style={{
        border: 0,
        position: "absolute",
        top: 0,
        height: "100%",
        width: "100%",
      }}
      allow="accelerometer;gyroscrope;autoplay;encrypted-media;picture-in-picture"
      allowFullScreen={true}
    />
  );
};

export default VideoPlayer;
