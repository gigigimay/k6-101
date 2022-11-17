import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  vus: 10,
  iterations: 10,
};

export default function () {
  const url = 'https://portal-dev.mac-non-prod.appmanteam.com/api/v1/tenant-config/items/client?filter[name]=portal&fields=id,logo,theme,watermark,font_family,name,df2f_features,df2f_config,claimmate_config,provider';

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const res = http.get(url, params);

  check(res, {
    'is status 200': (r) => {
      if (r.status !== 200) {
        console.warn('status:', r.status, ', body:', r.body)
        return false
      }
      return true
    },
  });

  sleep(1)
}
