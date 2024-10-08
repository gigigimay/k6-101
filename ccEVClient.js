import http from "k6/http";
import { check, group } from "k6";
import env from "./env.js";

export let options = {
  iterations: 1,
  vus: 1,
  duration: "30m",
};

const { backgroundCheckBaseUrl, backgroundCheckApiKey } = env;

const headers = {
  Authorization: `Bearer ${backgroundCheckApiKey}`,
};

const jsonHeaders = {
  Authorization: `Bearer ${backgroundCheckApiKey}`,
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

export default function () {
  let backgroundCheckId = "";

  // Group the requests for better organization and readability
  group("Create Background Check", () => {
    const createRes = http.post(
      `${backgroundCheckBaseUrl}/backgroundChecks`,
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
          citizenId: "11111111118",
          titleTH: "น.ส.",
          firstNameTH: "เทสแปด",
          lastNameTH: "ค้าบ",
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
      `${backgroundCheckBaseUrl}/backgroundChecks/${backgroundCheckId}`,
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
      `${backgroundCheckBaseUrl}/backgroundChecks/${backgroundCheckId}`,
      { headers }
    );

    check(getRes, { "Get by ID success": (r) => r.status === 200 });

    const jsonData = getRes.json();
  });

  group("Upload ID Card Selfie Image", () => {
    const uploadSelfieRes = http.put(
      `${backgroundCheckBaseUrl}/backgroundChecks/${backgroundCheckId}/criminalRecords`,
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
      `${backgroundCheckBaseUrl}/backgroundChecks/${backgroundCheckId}/criminalRecords`,
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
      `${backgroundCheckBaseUrl}/backgroundChecks/${backgroundCheckId}/criminalRecords`,
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
      `${backgroundCheckBaseUrl}/backgroundChecks/${backgroundCheckId}/socialSecurityHistories`,
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
      `${backgroundCheckBaseUrl}/backgroundChecks/${backgroundCheckId}/criminalRecords`,
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
      `${backgroundCheckBaseUrl}/backgroundChecks/${backgroundCheckId}/socialSecurityHistories`,
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
