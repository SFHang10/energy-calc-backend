/**
 * Cloudflare Worker: ENTSO-E XML -> JSON proxy
 *
 * Usage:
 * 1) Set optional env vars:
 *    - ENTSOE_API_KEY
 *    - ENTSOE_URL_TEMPLATE (optional)
 *
 * 2) Call:
 *    /?url=https://web-api.tp.entsoe.eu/api?documentType=...&securityToken={API_KEY}
 *
 * Notes:
 * - This worker fetches XML from ENTSO-E and converts to JSON.
 * - The JSON is generic: it exposes timeSeries with periods/points.
 */

export default {
  async fetch(request, env) {
    try {
      const requestUrl = new URL(request.url);
      const rawUrl = requestUrl.searchParams.get('url');
      const template = env.ENTSOE_URL_TEMPLATE || '';
      const apiKey = env.ENTSOE_API_KEY || '';

      let targetUrl = rawUrl || template;
      if (!targetUrl) {
        return jsonResponse({ error: 'Missing url parameter or ENTSOE_URL_TEMPLATE' }, 400);
      }

      if (apiKey) {
        targetUrl = targetUrl.replace('{API_KEY}', apiKey);
      }

      const response = await fetch(targetUrl, {
        headers: { 'Accept': 'application/xml' }
      });

      if (!response.ok) {
        return jsonResponse({
          error: 'Upstream fetch failed',
          status: response.status,
          statusText: response.statusText
        }, 502);
      }

      const xmlText = await response.text();
      const json = xmlToEntsoeJson(xmlText);

      return jsonResponse({
        updatedAt: new Date().toISOString(),
        source: targetUrl,
        data: json
      });
    } catch (error) {
      return jsonResponse({ error: 'Worker error', message: error.message }, 500);
    }
  }
};

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=300'
    }
  });
}

function xmlToEntsoeJson(xmlText) {
  const doc = new DOMParser().parseFromString(xmlText, 'application/xml');
  const parserError = doc.querySelector('parsererror');
  if (parserError) {
    return { error: 'Invalid XML', details: parserError.textContent || '' };
  }

  const timeSeriesNodes = Array.from(doc.querySelectorAll('TimeSeries'));
  const timeSeries = timeSeriesNodes.map(ts => ({
    mRID: getText(ts, 'mRID'),
    businessType: getText(ts, 'businessType'),
    inDomain: getText(ts, 'in_Domain.mRID'),
    outDomain: getText(ts, 'out_Domain.mRID'),
    unitName: getText(ts, 'quantity_Measure_Unit.name'),
    currency: getText(ts, 'currency_Unit.name'),
    priceMeasureUnit: getText(ts, 'price_Measure_Unit.name'),
    periods: Array.from(ts.querySelectorAll('Period')).map(period => ({
      timeInterval: {
        start: getText(period, 'timeInterval > start'),
        end: getText(period, 'timeInterval > end')
      },
      resolution: getText(period, 'resolution'),
      points: Array.from(period.querySelectorAll('Point')).map(point => ({
        position: toNumber(getText(point, 'position')),
        price: toNumber(getText(point, 'price.amount')),
        quantity: toNumber(getText(point, 'quantity')),
        value: toNumber(getText(point, 'value'))
      }))
    }))
  }));

  return {
    documentType: getText(doc, 'DocumentType'),
    processType: getText(doc, 'ProcessType'),
    createdDateTime: getText(doc, 'createdDateTime'),
    timeSeries
  };
}

function getText(root, selector) {
  const node = root.querySelector(selector);
  return node ? node.textContent.trim() : '';
}

function toNumber(value) {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}
