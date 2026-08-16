/**
 * TESTE DE CARGA — k6 (JavaScript puro, compatível com k6/goja)
 *
 * Como executar:
 *   k6 run src/tests/load/k6-load.js --env BASE_URL=http://localhost:3000
 *
 * Cenários:
 *   1. smoke  — 1 VU, 30s  → valida que o sistema funciona
 *   2. load   — rampa até 50 VUs → simula pico de visitas
 *   3. stress — rampa até 200 VUs → encontra o ponto de saturação
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// ─── Métricas customizadas ────────────────────────────────────────────────────
var errorRate   = new Rate('error_rate');
var pageLatency = new Trend('page_latency_ms', true);
var totalReqs   = new Counter('total_requests');

// ─── Configuração dos cenários ────────────────────────────────────────────────
export var options = {
  scenarios: {
    // Smoke: 1 VU por 30s — valida que está tudo funcionando
    smoke: {
      executor: 'constant-vus',
      vus: 1,
      duration: '30s',
      tags: { scenario: 'smoke' },
    },

    // Load: rampa crescente até 50 usuários simultâneos
    load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 10 },
        { duration: '1m',  target: 50 },
        { duration: '30s', target: 50 },
        { duration: '30s', target: 0  },
      ],
      tags: { scenario: 'load' },
    },

    // Stress: rampa até 200 VUs para encontrar o ponto de saturação
    stress: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 50  },
        { duration: '1m',  target: 100 },
        { duration: '1m',  target: 200 },
        { duration: '30s', target: 0   },
      ],
      tags: { scenario: 'stress' },
    },
  },

  // Thresholds: SLAs mínimos aceitáveis
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed:   ['rate<0.01'],
    error_rate:        ['rate<0.05'],
    page_latency_ms:   ['p(90)<400'],
  },
};

var BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// ─── Rotas testadas ───────────────────────────────────────────────────────────
var ROUTES = [
  { path: '/',         name: 'Inicio'   },
  { path: '/catalogo', name: 'Catalogo' },
  { path: '/leiloes',  name: 'Leiloes'  },
  { path: '/sobre',    name: 'Sobre'    },
];

// ─── Função principal ─────────────────────────────────────────────────────────
export default function () {
  var route = ROUTES[Math.floor(Math.random() * ROUTES.length)];
  var url   = BASE_URL + route.path;

  group('Pagina: ' + route.name, function () {
    var start = Date.now();
    var res   = http.get(url, {
      headers: { 'Accept': 'text/html,application/xhtml+xml' },
      tags: { page: route.name },
    });
    var latency = Date.now() - start;

    pageLatency.add(latency);
    totalReqs.add(1);

    var ok = check(res, {
      'status 200':          function (r) { return r.status === 200; },
      'body nao vazio':      function (r) { return r.body !== null && r.body.length > 0; },
      'tem div id root':     function (r) { return r.body.indexOf('id="root"') !== -1; },
      'latencia < 500ms':    function ()  { return latency < 500; },
    });

    errorRate.add(!ok);
  });

  // Pausa realista entre navegações (0.5 a 2 segundos)
  sleep(0.5 + Math.random() * 1.5);
}

// ─── Setup: valida que o servidor responde ────────────────────────────────────
export function setup() {
  var res = http.get(BASE_URL);
  if (res.status !== 200) {
    throw new Error('Servidor nao esta respondendo em ' + BASE_URL + ' (status: ' + res.status + ')');
  }
  console.log('Servidor OK em ' + BASE_URL);
  return { baseUrl: BASE_URL };
}

// ─── Resumo após execução ─────────────────────────────────────────────────────
export function handleSummary(data) {
  return {
    stdout: JSON.stringify(data, null, 2),
    'load-test-summary.json': JSON.stringify(data, null, 2),
  };
}
