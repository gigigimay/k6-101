import http from 'k6/http';
import { sleep } from 'k6';

export let options = {
  vus: 10,
  iterations: 20,
};

export default function () {
  http.get('http://test.k6.io');
  sleep(1);
}
