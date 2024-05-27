import http from "k6/http";
import { check, group } from "k6";

export let options = {
  maxRedirects: 4,
};

// --- local ---
// const baseUrl = "https://e4ef-161-82-160-194.ngrok-free.app";
// const apiKey = "NDcxODViMTItYTRmNC00NWY0LTkwYmItNzFkMzYzNzRlZjM0";

// --- qa ---
const baseUrl =
  "https://portal-qa.mac-non-prod.appmanteam.com/api/v1/background-check";
const apiKey = "NDE2ZjNhYzMtYzlhYy00YWYwLWI1MjQtZjE3ZDkwYzMzOTU0";

const headers = {
  Authorization: `Bearer ${apiKey}`,
};

const jsonHeaders = {
  Authorization: `Bearer ${apiKey}`,
  "Content-Type": "application/json",
};

// Helper function to read and prepare files
const httpFile = (name) => {
  const file = open(`./files/${name}`, "b");
  return http.file(
    file,
    name,
    name.includes(".png") ? "image/png" : "image/jpeg"
  );
};

// Define the files
const frontIdCardImage = httpFile("frontidcard.png");
const faceImage = httpFile("faceimage.png");
const frontIdcardFaceimage = httpFile("frontidcardfaceimage.png");
const signatureImage = httpFile("signature1.png");
const idCardSelfieImage = httpFile("idcardselfieimage.png");

export default function() {
  let backgroundCheckId = "";

  // Group the requests for better organization and readability
  group("Create Background Check", () => {
    const createRes = http.post(
      `${baseUrl}/backgroundChecks`,
      JSON.stringify({
        processConfigs: {
          criminalRecord: true,
          socialSecurityHistory: true,
          bankruptcy: true,
          adverseMedia: false,
          sanction: false,
        },
        verificationInfo: {
          kycVerified: true,
          kycCompletedAt: new Date().toISOString(),
          citizenId: "1111111111119",
          titleTH: "น.ส.",
          firstNameTH: "เม",
          lastNameTH: "เทสข้อมูลเยอะๆ",
          titleEN: "Miss",
          firstNameEN: "May",
          lastNameEN: "Mon",
          baseSalary: "2",
          dateOfBirth: "1999-12-25",
          dateOfCardExpiry: "2050-12-24",
          position: {
            translations: { th: { label: "เดป" }, en: { label: "DEV" } },
          },
          department: {
            translations: {
              th: { label: "MAC Team" },
              en: { label: "MAC Team" },
            },
          },
        },
      }),
      { headers: jsonHeaders }
    );

    check(createRes, { "Create BGC success": (r) => r.status === 200 });

    const jsonData = createRes.json();
    backgroundCheckId = jsonData.id;
  });

  group("Patch KYC Result", () => {
    const patchKycRes = http.patch(
      `${baseUrl}/backgroundChecks/${backgroundCheckId}`,
      {
        frontIdCardImage: frontIdCardImage,
        idCardFaceImage: frontIdcardFaceimage,
        livenessImage: faceImage,
      },
      { headers }
    );

    check(patchKycRes, { "Patch KYC result success": (r) => r.status === 200 });
  });

  group("Get Background Check by ID", () => {
    const getRes = http.get(
      `${baseUrl}/backgroundChecks/${backgroundCheckId}`,
      { headers }
    );

    check(getRes, { "Get by ID success": (r) => r.status === 200 });

    const jsonData = getRes.json();
  });

  group("Upload ID Card Selfie Image", () => {
    const uploadSelfieRes = http.put(
      `${baseUrl}/backgroundChecks/${backgroundCheckId}/criminalRecords`,
      { idCardSelfieImage: idCardSelfieImage },
      { headers }
    );

    check(uploadSelfieRes, {
      "Upload ID Card Selfie Image success": (r) => r.status === 200,
    });

    const jsonData = uploadSelfieRes.json();
  });

  group("Add Additional Info", () => {
    const addInfoRes = http.put(
      `${baseUrl}/backgroundChecks/${backgroundCheckId}/criminalRecords`,
      JSON.stringify({
        additionalInfo: {
          fatherTitle: "นาย",
          fatherFirstName: "ชื่อบิดา",
          fatherLastName: "นามสกุลบิดา",
          motherTitle: "นาง",
          motherFirstName: "ชื่อมารดา",
          motherLastName: "นามสกุลมารดา",
          phoneNumber: "0999999999",
          address: {
            residentNo: "1",
            moo: "2",
            soi: "ลาดพร้าว 3",
            road: "ลาดพร้าว",
            subDistrict: "บ้านระกาศ",
            district: "บางบ่อ",
            province: "สมุทรปราการ",
          },
        },
      }),
      { headers: jsonHeaders }
    );

    check(addInfoRes, {
      "Add additional info success": (r) => r.status === 200,
    });

    const jsonData = addInfoRes.json();
  });

  group("Upload Signature Image", () => {
    const uploadSignatureRes = http.put(
      `${baseUrl}/backgroundChecks/${backgroundCheckId}/criminalRecords`,
      { file: signatureImage },
      { headers }
    );

    check(uploadSignatureRes, {
      "Upload CC signature success": (r) => r.status === 200,
    });

    const jsonData = uploadSignatureRes.json();
  });

  group("Upload Social Security History Signature Image", () => {
    const uploadSocialSignatureRes = http.put(
      `${baseUrl}/backgroundChecks/${backgroundCheckId}/socialSecurityHistories`,
      { file: signatureImage },
      { headers }
    );

    check(uploadSocialSignatureRes, {
      "Upload EV signature success": (r) => r.status === 200,
    });

    const jsonData = uploadSocialSignatureRes.json();
  });

  group("Patch Criminal Record Client Submitted", () => {
    const patchCriminalRes = http.patch(
      `${baseUrl}/backgroundChecks/${backgroundCheckId}/criminalRecords`,
      JSON.stringify({
        clientSubmitted: true,
      }),
      { headers: jsonHeaders }
    );

    check(patchCriminalRes, {
      "Patch CC clientSubmitted success": (r) => r.status === 200,
    });
  });

  group("Patch Social Security History Client Submitted", () => {
    const patchSocialRes = http.patch(
      `${baseUrl}/backgroundChecks/${backgroundCheckId}/socialSecurityHistories`,
      JSON.stringify({
        clientSubmitted: true,
      }),
      { headers: jsonHeaders }
    );

    check(patchSocialRes, {
      "Patch EV clientSubmitted success": (r) => r.status === 200,
    });

    const jsonData = patchSocialRes.json();
  });
}
