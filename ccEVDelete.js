import { URL } from "https://jslib.k6.io/url/1.0.0/index.js";
import http from "k6/http";
import { check, group } from "k6";
import env from "./env.js";

export let options = {
  maxRedirects: 4,
};

const { backgroundCheckBaseUrl, backgroundCheckApiKey } = env;

let cachedIds = [];

function fetchBackgroundChecks(headers) {
  group("Fetch pre-submitted cases operation", () => {
    const url = new URL(`${backgroundCheckBaseUrl}/backgroundChecks`);
    url.searchParams.append("limit", "50");
    url.searchParams.append("order", "createdAt-ASC");
    url.searchParams.append("search", "เทสข้อมูลเยอะๆ");
    url.searchParams.append(
      "searchFields",
      "verificationInfo-firstNameTH-$like,verificationInfo-lastNameTH-$like"
    );

    const res = http.get(url.toString(), { headers });
    check(res, {
      "Fetch pre-submitted cases success": (r) => r.status === 200,
      "Found backgroundChecks": (r) => {
        const { data, meta } = r.json();
        console.log("🚀 ~ group ~ meta:", meta);
        if (!data.length) return false;
        cachedIds = data.map((bgc) => bgc.id);
        return true;
      },
    });
  });
}

export default function () {
  const headers = {
    Authorization: `Bearer ${backgroundCheckApiKey}`,
  };

  if (!cachedIds.length) {
    fetchBackgroundChecks(headers);
  }

  group("DELETE backgroundCheck", () => {
    const id = cachedIds.pop();
    if (!id) return;
    console.log("🚀 ~ id:", id);

    const url = `${backgroundCheckBaseUrl}/backgroundChecks/${id}`;
    const resCriminalRecord = http.del(url, null, {
      headers,
    });

    check(resCriminalRecord, {
      "Delete background check success": (r) => {
        return r.status === 204;
      },
    });
  });
}
