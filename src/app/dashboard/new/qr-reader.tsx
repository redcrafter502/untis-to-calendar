import { useRef } from "react";

export function QrReader() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrBoxRef = useRef<HTMLDivElement>(null);

  return (
    <div className="mx-auto my-0 h-screen w-full max-w-[430px]">
      <video className="h-fit w-full object-cover" ref={videoRef}></video>
      <div className="left-0 w-full" ref={qrBoxRef}>
        <img
          className="absolute top-1/2 left-1/2 fill-none"
          src="/qr-frame.svg"
          alt="Qr Frame"
          width={265}
          height={265}
        />
      </div>
    </div>
  );
}
