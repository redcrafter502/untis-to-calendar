import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import QrScanner from "qr-scanner";
import { useEffect, useRef, useState } from "react";

export function QrReader({ onResult }: { onResult: (result: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrBoxRef = useRef<HTMLDivElement>(null);
  const scanner = useRef<QrScanner | null>(null);
  const [qrOn, setQrOn] = useState(true);
  const [result, setResult] = useState("");
  const [preferredCamera, setPreferredCamera] = useState<string | null>(null);
  const [cameras, setCameras] = useState<QrScanner.Camera[]>([]);

  useEffect(() => {
    QrScanner.listCameras(true).then((cameras) => setCameras(cameras));
  }, []);

  function onScanSuccess(qrCode: QrScanner.ScanResult) {
    setResult(qrCode.data);
  }

  useEffect(() => {
    if (!result) return;
    const timeout = setTimeout(() => onResult(result), 500);
    return () => clearTimeout(timeout);
  }, [result]);

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
          preferredCamera: preferredCamera ?? "envirement",
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
  }, [preferredCamera]);

  useEffect(() => {
    if (!qrOn)
      alert(
        "Camera is blocked or not accessible. Please allow camera in your browser permissions and Reload.",
      );
  }, [qrOn]);

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
      <CardFooter className="w-full max-w-[430px]">
        <Select
          value={preferredCamera ?? "null"}
          onValueChange={setPreferredCamera}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="null">Default</SelectItem>
            {cameras.map((camera) => (
              <SelectItem key={camera.id} value={camera.id}>
                {camera.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {result && <div className="overflow-hidden">{result}</div>}
      </CardFooter>
    </Card>
  );
}
