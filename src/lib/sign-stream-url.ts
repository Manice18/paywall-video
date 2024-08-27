import crypto from "crypto";

function generateToken(
  videoId: string,
  expirationTime: number,
  securityKey: string
) {
  const data = securityKey + videoId + expirationTime.toString();

  const hash = crypto.createHash("sha256");
  hash.update(data);

  return hash.digest("hex");
}

export function signStreamUrl(iFrameUrl: string, securityKey: string) {
  const expiration = 3600;
  const parsedUrl = new URL(iFrameUrl);
  const segments = parsedUrl.pathname.split("/");
  const videoId = segments[3];

  const expirationTime = Math.floor(Date.now() / 1000) + expiration;

  const token = generateToken(videoId, expirationTime, securityKey);
  parsedUrl.searchParams.set("token", token);
  parsedUrl.searchParams.set("expires", expirationTime.toString());

  return parsedUrl.toString();
}
