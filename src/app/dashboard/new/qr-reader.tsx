import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import QrScanner from "qr-scanner";
import { useEffect, useRef, useState } from "react";

export function QrReader() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrBoxRef = useRef<HTMLDivElement>(null);
  const scanner = useRef<QrScanner | null>(null);
  const [qrOn, setQrOn] = useState(false);
  const [result, setResult] = useState("");

  function onScanSuccess(qrCode: QrScanner.ScanResult) {
    setResult(qrCode.data);
  }

  function onScanFail(err: string | Error) {
    console.log("SCAN FAILED: ", err);
  }

  useEffect(() => {
    if (videoRef.current && !scanner.current) {
      scanner.current = new QrScanner(
        videoRef.current,
        onScanSuccess as unknown as (result: string) => void,
        {
          onDecodeError: onScanFail,
          preferredCamera: "envirement",
          highlightScanRegion: true,
          highlightCodeOutline: true,
          overlay: qrBoxRef.current,
        } as unknown as number,
      );

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
    <Card>
      <CardHeader>
        <CardTitle>Easily add your Untis Login</CardTitle>
        <CardDescription>
          Scan your QR Code from your Untis Account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full max-w-[430px]">
          <video ref={videoRef}></video>
          <div className="left-0 w-full" ref={qrBoxRef}>
            <img
              className="absolute top-1/2 left-1/2 fill-none"
              style={{
                transform: "translate(-50%, -50%)",
              }}
              src="/qr-frame.svg"
              alt="Qr Frame"
              width={265}
              height={265}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter>{result && <p>Scanned Result: {result}</p>}</CardFooter>
    </Card>
  );
}
