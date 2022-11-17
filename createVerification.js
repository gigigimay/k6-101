import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  vus: 1,
  iterations: 1,
  // vus: 60,
  // iterations: 60,
};

export default function () {
  const url = 'http://localhost:4000/verifications';
  const payload = JSON.stringify({
    "phoneNumber": "0819034441",
    "notifyType": "sms",
    "pdpaConsented": true,
    "firstName": "เมธิยา",
    "lastName": "มนต์บุรีนนท์",
    "dateOfBirth": "1998-01-01",
    "citizenId": "1111111111110",
    "laserCode": "JT000000000",
    "expiresAt": "2022-09-21T22:18:23.773Z",
    "frontIdCardConfig": {
      "required": true,
      "isEditable": true,
      "threshHold": 0,
      "dependenciesRequired": false
    },
    "backIdCardConfig": {
      "required": true,
      "isEditable": true,
      "threshHold": 0,
      "dependenciesRequired": false
    },
    "passportConfig": {
      "required": false,
      "isEditable": true,
      "threshHold": 0.8,
      "dependenciesRequired": false
    },
    "idFaceRecognitionConfig": {
      "required": true,
      "isEditable": false,
      "threshHold": 0,
      "dependenciesRequired": true,
      "livenessCount": 1,
      "attempts": 3
    },
    "vaccinePassportConfig": {
      "required": false,
      "isEditable": false,
      "threshHold": 0.1,
      "dependenciesRequired": false
    },
    "dopaConfig": {
      "required": true,
      "attempts": 2,
      "dependenciesRequired": false
    },
    "criminalCheckConfig": {
      "required": true
    },
    "employmentVerificationConfig": {
      "required": true
    }
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer NTgzOTIxN2EtZTI3MC00ODY1LTg1NmItZTgyYWJiMjMyYTNl',
    },
  };

  const res = http.post(url, payload, params);

  check(res, {
    'is status 200': (r) => {
      if (r.status !== 200) {
        console.warn(r.status, r.body)
        return false
      }
      return true
    },
  });
}
