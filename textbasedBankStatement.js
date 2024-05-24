import http from "k6/http";
import { sleep, check } from "k6";

/** NOTE: the rate-limit in elsa workflow is 10 requests / user / second */

export const options = {
  // vus: 1,
  // iterations: 1,
  vus: 11,
  iterations: 11,
};

export default function () {
  const url =
    "https://rpa-gateway-uat.appman.co.th/v1/text-extractions/bankstatement";
  const payload = JSON.stringify({
    phoneNumber: "+66819034441",
    msg: "กรุณายืนยันตัวตนผ่านลิงก์ https://portal-dev.mac-non-prod.appmanteam.com/apps/identity-verification/750b82ea-fa2c-40c3-a908-1dfb7499ad16",
    raw: {
      id: "750b82ea-fa2c-40c3-a908-1dfb7499ad16",
      createdAt: "2022-09-23T03:03:22.286Z",
      updatedAt: "2022-09-23T03:03:22.286Z",
      deletedAt: null,
      ref: null,
      status: "open",
      notifyType: "sms",
      expiresAt: "2022-09-21T22:18:23.773Z",
      verifiedAt: null,
      notifiesAt: null,
      notifyInterval: null,
      frontIdCardConfig: {
        required: true,
        isEditable: true,
        threshHold: 0,
        dependenciesRequired: false,
      },
      passportConfig: {
        required: false,
        isEditable: true,
        threshHold: 0.8,
        dependenciesRequired: false,
      },
      backIdCardConfig: {
        required: true,
        isEditable: true,
        threshHold: 0,
        dependenciesRequired: false,
      },
      idFaceRecognitionConfig: {
        required: true,
        livenessCount: 1,
        isEditable: false,
        attempts: 3,
        threshHold: 0,
        dependenciesRequired: true,
      },
      dipChipConfig: {
        required: false,
        isEditable: false,
        threshHold: 0.8,
        dependenciesRequired: true,
      },
      amloConfig: {
        required: false,
        isEditable: false,
        threshHold: 0.8,
        dependenciesRequired: true,
      },
      dopaConfig: {
        required: true,
        isEditable: false,
        attempts: 2,
        threshHold: 0.8,
        dependenciesRequired: false,
      },
      criminalCheckConfig: {
        required: true,
        isEditable: false,
        threshHold: 0.8,
        dependenciesRequired: true,
      },
      employmentVerificationConfig: {
        required: true,
        isEditable: false,
        threshHold: 0.8,
        dependenciesRequired: true,
      },
      firstName: "เมธิยา",
      middleName: null,
      lastName: "มนต์บุรีนนท์",
      email: null,
      phoneNumber: "0819034441",
      pdpaConsented: false,
      feedback: null,
      citizenId: "1111111111110",
      laserCode: "JT000000000",
      dateOfBirth: "1998-01-01",
      mlRefNo: "EKYC20220923170322254",
      meta: null,
      application: {
        id: "a0270850-0a1a-4b0b-bf19-e085dc7ed77f",
        createdAt: "2022-09-12T22:34:52.350Z",
        updatedAt: "2022-09-23T02:56:46.134Z",
        deletedAt: null,
        name: "localhost",
        allowedProcesses: [
          "employmentVerification",
          "frontIdCard",
          "backIdCard",
          "dopa",
          "idFaceRecognition",
          "criminalCheck",
          "dipChip",
          "passport",
          "amlo",
        ],
        customDopa: "ktaxa",
        customAmlo: "",
        emailContent:
          "กรุณายืนยันตัวตนผ่านลิงก์ ${application.verificationBasePath}/${id}",
        smsContent:
          "belloooo3 กรุณายืนยันตัวตนผ่านลิงก์ ${application.verificationBasePath}/${id}",
        appointmentSmsContent: "",
        appointmentSmsReminderContent: null,
        appointmentReminderTime: null,
        appointmentReminderInterval: null,
        mlApiKey: "wZNdYibwf74PbCSY5XwqXad5saEy2C2msnECwxq5",
        mlEndpoint: "https://ml.appman.co.th",
        keepImages: false,
        sub: "0ea323b9-5f61-4a86-8783-2012f3297043",
        webhookUrl:
          "https://portal-dev.mac-non-prod.appmanteam.com/api/v2/case-keeper/verifications/webhook",
        watermarkUrl: null,
        verificationBasePath:
          "https://portal-dev.mac-non-prod.appmanteam.com/apps/identity-verification",
        notifyCronSchedule: null,
        retentionInterval: "P4M",
        privateKey: "5839217a-e270-4865-856b-e82abb232a3e",
        publicKey: "711782ba-8a99-47be-847d-41fdeea45dfb",
        expiresAt: null,
        expiryDuration: "P4M",
        companyName: null,
        companyId: null,
        companyAttorneyFullName: null,
        companyAttorneyCitizenId: null,
        companyAttorneyAddress: null,
        companyAttorneyPhoneNumber: null,
        companySignatureUrl: null,
        companyStampUrl: null,
        companyConsentWitnessName: null,
      },
      type: "invite",
    },
  });

  /** NOTE: the rate-limit in elsa workflow will check by the `x-user-id` header. */

  // [1.] use this one if you want to test api called by MANY users
  // const id = `${Math.random()}`

  // [2.] and use this one if you want to test api called by ONE user
  const id = "xxxxx";

  const params = {
    headers: {
      "Content-Type": "application/json",
      "x-user-id": id,
    },
  };

  const res = http.post(url, payload, params);

  check(res, {
    "response status is 204": (r) => {
      if (r.status !== 204) {
        console.warn(
          "x-user-id:",
          id,
          ", status:",
          r.status,
          ", body:",
          r.body
        );
        return false;
      }
      console.info("x-user-id:", id, ", status:", r.status, ", body:", r.body);
      return true;
    },
  });

  sleep(1);
}
