const env = {
  local: {
    backgroundCheckBaseUrl: "https://e4ef-161-82-160-194.ngrok-free.app",
    backgroundCheckApiKey: "NDcxODViMTItYTRmNC00NWY0LTkwYmItNzFkMzYzNzRlZjM0",
    kcUrl: "https://portal-dev.mac-non-prod.appmanteam.com/auth",
    operationKCRealm: "mac-application-admin",
    operationKCClientId: "mac-application-manager",
    operationKCUsername: "gigi",
    operationKCPassword: "Gigi",
  },
  qa: {
    backgroundCheckBaseUrl:
      "https://portal-qa.mac-non-prod.appmanteam.com/api/v1/background-check",
    backgroundCheckApiKey: "NDE2ZjNhYzMtYzlhYy00YWYwLWI1MjQtZjE3ZDkwYzMzOTU0",
    kcUrl: "https://portal-qa.mac-non-prod.appmanteam.com/auth",
    operationKCRealm: "mac-application-admin",
    operationKCClientId: "mac-application-manager",
    operationKCUsername: "gb_supervisor_1@appman.co.th",
    operationKCPassword: "!QAZ2wsx",
  },
};

export default env.local;
