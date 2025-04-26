import QrScanner from "qr-scanner";
import { useEffect, useRef, useState } from "react";

export function QrReader() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrBoxRef = useRef<HTMLDivElement>(null);
  const scanner = useRef<QrScanner | null>(null);
  const [qrOn, setQrOn] = useState(false);
  const [result, setResult] = useState("");

  function onScanSuccess(qrCode: string) {
    console.log("RESULT: ", qrCode);
    setResult(qrCode);
  }

  function onScanFail(err: string | Error) {
    console.error("SCAN FAILED: ", err);
  }

  useEffect(() => {
    if (videoRef.current && !scanner.current) {
      scanner.current = new QrScanner(videoRef.current, onScanSuccess, {
        onDecodeError: onScanFail,
        preferredCamera: "envirement",
        highlightScanRegion: true,
        highlightCodeOutline: true,
        overlay: qrBoxRef.current || undefined,
      });

      scanner.current
        .start()
        .then(() => setQrOn(true))
        .catch((err) => {
          if (err) setQrOn(false);
        });
    }

    return () => {
      if (!videoRef.current) {
        scanner.current?.stop();
      }
    };
  }, []);

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
      {result && (
        <p
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 99999,
            color: "white",
          }}
        >
          Scanned Result: {result}
        </p>
      )}
    </div>
  );
}
