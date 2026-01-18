import { useMemo, useState } from "react";
import { MdArrowBack, MdPause, MdPlayArrow, MdQrCodeScanner } from "react-icons/md";
import { Modal } from "../components/Modal";
import { useNavigate } from "react-router-dom";

const parseVCardData = (data: string) => {
  const parsed: Record<string, string> = {};
  if (!data.startsWith("BEGIN:VCARD")) return parsed;
  const lines = data.split("\n");
  lines.forEach((line) => {
    if (line.startsWith("FN:")) parsed["Full Name"] = line.substring(3);
    else if (line.startsWith("EMAIL:")) parsed["Email"] = line.substring(6);
    else if (line.startsWith("TEL:")) parsed["Phone"] = line.substring(4);
    else if (line.startsWith("ADR:")) {
      const addressParts = line.substring(4).split(";");
      if (addressParts[2]) parsed["Address"] = addressParts[2];
    } else if (line.startsWith("URL:")) parsed["Website"] = line.substring(4);
    else if (line.startsWith("X-SOCIALPROFILE;TYPE=linkedin:"))
      parsed["LinkedIn"] = line.substring(31);
    else if (line.startsWith("X-SOCIALPROFILE;TYPE=facebook:"))
      parsed["Facebook"] = line.substring(30);
    else if (line.startsWith("X-SOCIALPROFILE;TYPE=instagram:"))
      parsed["Instagram"] = line.substring(31);
    else if (line.startsWith("X-SOCIALPROFILE;TYPE=whatsapp:"))
      parsed["WhatsApp"] = line.substring(30);
    else if (line.startsWith("X-FATHER:")) parsed["Father Name"] = line.substring(9);
    else if (line.startsWith("X-MOTHER:")) parsed["Mother Name"] = line.substring(9);
    else if (line.startsWith("X-PASSPORT:")) parsed["Passport"] = line.substring(11);
    else if (line.startsWith("X-AADHAAR:")) parsed["Aadhaar"] = line.substring(10);
    else if (line.startsWith("X-DL:")) parsed["Driving License"] = line.substring(5);
    else if (line.startsWith("X-PAN:")) parsed["PAN Card"] = line.substring(6);
    else if (line.startsWith("X-UPI:")) parsed["UPI Address"] = line.substring(6);
  });
  return parsed;
};

const getFieldLabel = (key: string) => {
  switch (key.toLowerCase()) {
    case "full name":
      return "Full Name";
    case "email":
      return "Email Address";
    case "phone":
      return "Phone Number";
    case "address":
      return "Address";
    case "website":
      return "Website";
    case "linkedin":
      return "LinkedIn Profile";
    case "facebook":
      return "Facebook Profile";
    case "instagram":
      return "Instagram Profile";
    case "whatsapp":
      return "WhatsApp";
    case "father name":
      return "Father's Name";
    case "mother name":
      return "Mother's Name";
    case "passport":
      return "Passport Number";
    case "aadhaar":
      return "Aadhaar Number";
    case "driving license":
      return "Driving License";
    case "pan card":
      return "PAN Card Number";
    case "upi address":
      return "UPI Address";
    default:
      return key;
  }
};

export default function QRScanner() {
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(true);
  const [scannedData, setScannedData] = useState("");
  const [showDialog, setShowDialog] = useState(false);

  const parsed = useMemo(() => parseVCardData(scannedData), [scannedData]);

  const showResults = () => {
    setShowDialog(true);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="flex items-center justify-between bg-[#2B2322] px-6 py-4 text-white">
        <div className="flex items-center gap-3">
          <button
            className="rounded-full p-1"
            onClick={() => navigate("/")}
            aria-label="Back"
          >
            <MdArrowBack className="text-xl" />
          </button>
          <h1 className="text-lg font-semibold">Scan QR Code</h1>
        </div>
        <button
          className="rounded-full p-2"
          onClick={() => setIsScanning((prev) => !prev)}
          aria-label="Toggle scanning"
        >
          {isScanning ? <MdPause className="text-xl" /> : <MdPlayArrow className="text-xl" />}
        </button>
      </header>

      <div className="relative flex min-h-[70vh] flex-col items-center justify-center gap-6 px-6 py-10">
        <div className="absolute left-0 right-0 top-0 bg-gradient-to-b from-black/70 to-transparent px-6 py-4 text-center text-sm font-semibold">
          Position the QR code within the frame
        </div>

        <div className="relative h-64 w-64 rounded-2xl border-2 border-white">
          <div className="absolute left-0 top-0 h-5 w-5 border-l-4 border-t-4 border-purple-500" />
          <div className="absolute right-0 top-0 h-5 w-5 border-r-4 border-t-4 border-purple-500" />
          <div className="absolute bottom-0 left-0 h-5 w-5 border-b-4 border-l-4 border-purple-500" />
          <div className="absolute bottom-0 right-0 h-5 w-5 border-b-4 border-r-4 border-purple-500" />
          <div className="flex h-full items-center justify-center text-5xl text-white/30">
            <MdQrCodeScanner />
          </div>
        </div>

        <div className="w-full max-w-md space-y-3 text-sm text-white/80">
          <p className="text-center">
            Paste QR data below to preview scanned contact information.
          </p>
          <textarea
            value={scannedData}
            onChange={(event) => setScannedData(event.target.value)}
            rows={5}
            className="w-full rounded-xl bg-white/10 p-3 text-sm text-white outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Paste vCard data here"
          />
          <button
            className="w-full rounded-xl bg-purple-600 py-2 text-sm font-semibold text-white"
            onClick={showResults}
          >
            Show Result
          </button>
        </div>
      </div>

      <Modal isOpen={showDialog} onClose={() => setShowDialog(false)}>
        <div className="space-y-4 text-left text-black">
          <div className="flex items-center gap-2 text-purple-700">
            <MdQrCodeScanner className="text-xl" />
            <h2 className="text-lg font-semibold">Contact Information</h2>
          </div>
          <div className="max-h-[50vh] space-y-3 overflow-y-auto pr-1">
            {Object.keys(parsed).length ? (
              Object.entries(parsed).map(([key, value]) => (
                <div key={key} className="space-y-1">
                  <p className="text-xs font-semibold text-black/50">
                    {getFieldLabel(key)}
                  </p>
                  <div className="rounded-lg border border-black/10 bg-black/5 px-3 py-2 text-sm font-medium text-black/80">
                    {value}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-black/10 bg-black/5 p-3 text-sm">
                {scannedData || "No data found"}
              </div>
            )}
          </div>
          <p className="text-xs text-black/50">
            {Object.keys(parsed).length
              ? "This QR code contains contact information"
              : "This QR code contains the following data:"}
          </p>
          <div className="flex justify-end gap-2">
            <button
              className="rounded-lg px-4 py-2 text-sm font-semibold text-black/60"
              onClick={() => {
                setShowDialog(false);
                setScannedData("");
              }}
            >
              Scan Another
            </button>
            <button
              className="rounded-lg bg-purple-700 px-4 py-2 text-sm font-semibold text-white"
              onClick={() => setShowDialog(false)}
            >
              Done
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
