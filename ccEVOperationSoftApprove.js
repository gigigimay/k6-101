import { URL } from "https://jslib.k6.io/url/1.0.0/index.js";
import http from "k6/http";
import { check, group } from "k6";
import env from "./env.js";

export let options = {
  iterations: 802,
  vus: 1,
  duration: "30m",
};

const {
  backgroundCheckBaseUrl,
  kcUrl,
  operationKCRealm,
  operationKCClientId,
  operationKCUsername,
  operationKCPassword,
} = env;

// Variable to store the access token
let accessToken;
let cachedIds = [];

function getKeycloakToken() {
  const url = `${kcUrl}/realms/${operationKCRealm}/protocol/openid-connect/token`;
  const payload = {
    client_id: operationKCClientId,
    username: operationKCUsername,
    password: operationKCPassword,
    grant_type: "password",
  };

  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
  };

  const res = http.post(url, payload, { headers });
  check(res, { "Get Keycloak access token success": (r) => r.status === 200 });
  return res.json("access_token");
}

// Function to check if the token is already fetched or not
function getOrReuseToken() {
  if (!accessToken) {
    accessToken = getKeycloakToken();
  }
  return accessToken;
}

function fetchPresubmittedCases(headers) {
  group("Fetch pre-submitted cases operation", () => {
    const url = new URL(
      `${backgroundCheckBaseUrl}/operations/crSSHStaging/backgroundChecks`
    );
    url.searchParams.append("limit", "10");
    url.searchParams.append(
      "order",
      "application-companyName-ASC,application-name-ASC,criminalRecord-stagedAt-ASC,socialSecurityHistory-stagedAt-ASC,criminalRecord-approvedClientSubmittedAt-ASC,socialSecurityHistory-approvedClientSubmittedAt-ASC"
    );
    url.searchParams.append("RESULT-operationStatus", "open");
    url.searchParams.append("search", "เทสข้อมูลเยอะๆ");
    url.searchParams.append(
      "searchFields",
      "verificationInfo-firstNameTH-$like,verificationInfo-lastNameTH-$like,verificationInfo-middleNameTH-$like,application-companyName-$like,application-name-$like"
    );

    const res = http.get(url.toString(), { headers });
    check(res, {
      "Fetch pre-submitted cases success": (r) => r.status === 200,
      "Found backgroundChecks": (r) => {
        const data = r.json().data;
        if (!data.length) return false;
        cachedIds = data.map((bgc) => ({
          criminalRecordId: bgc.criminalRecordId,
          socialSecurityHistoryId: bgc.socialSecurityHistoryId,
        }));
        return true;
      },
    });
  });
}

export default function () {
  let token = getOrReuseToken();
  let criminalRecordId;
  let socialSecurityHistoryId;

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  if (!cachedIds.length) {
    fetchPresubmittedCases(headers);
  }

  group("Patch operationStatus softApproved", () => {
    const item = cachedIds.pop();
    console.log("🚀 ~ item:", item);
    if (!item) return;

    const patchPayload = JSON.stringify({ operationStatus: "softApproved" });
    const patchCriminalRecordUrl = `${backgroundCheckBaseUrl}/operations/criminalRecords/${item.criminalRecordId}`;
    const patchSocialSecurityHistoryUrl = `${backgroundCheckBaseUrl}/operations/socialSecurityHistories/${item.socialSecurityHistoryId}`;

    const resCriminalRecord = http.patch(patchCriminalRecordUrl, patchPayload, {
      headers,
    });

    check(resCriminalRecord, {
      "Patch criminal record success": (r) => r.status === 200,
    });

    const resSocialSecurityHistory = http.patch(
      patchSocialSecurityHistoryUrl,
      patchPayload,
      { headers }
    );

    check(resSocialSecurityHistory, {
      "Patch social security history success": (r) => r.status === 200,
    });
  });
}
