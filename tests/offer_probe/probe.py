#!/usr/bin/env python3
"""Prova de viabilitat sense compres ni avisos: consulta ofertes de fullets."""
import datetime as dt
import json
import sys
import urllib.parse
import urllib.request

API = 'https://quecomprar.org/api/v1/offers'
PRODUCTS = ('Sanytol', 'Moussel', 'Oral-B 3D White', 'Fairy pastillas', 'detergente Marsella')
CITY = 'Barcelona'  # ciutat generica, no domicili ni ubicacio personal

def fetch(query, opener=urllib.request.urlopen):
    params = urllib.parse.urlencode({'query': query, 'city': CITY, 'limit': 5})
    request = urllib.request.Request(API + '?' + params, headers={
        'User-Agent': 'MagatzemCasaOfferFeasibility/0.1 (read-only)',
        'Accept': 'application/json'})
    with opener(request, timeout=20) as response:
        return json.load(response)

def inspect(query, payload):
    if not isinstance(payload, (list, dict)):
        raise ValueError('JSON root invalid')
    rows = payload if isinstance(payload, list) else next(
        (payload[k] for k in ('offers','results','items','data') if isinstance(payload.get(k), list)), None)
    if rows is None:
        raise ValueError('unknown API response format - integration must stop')
    offers = []
    for row in rows[:5]:
        if not isinstance(row, dict):
            raise ValueError('offer must be JSON object')
        offers.append({'name':row.get('name') or row.get('title') or row.get('product'),
                       'store':row.get('store') or row.get('chain'),
                       'price':row.get('price'), 'url':row.get('url'),
                       'shipping_verified':False, 'alert_eligible':False})
    return {'product':query, 'results':len(rows), 'offers':offers,
            'status':'DIAGNOSTIC_ONLY_NO_FINAL_PRICE_VERIFICATION'}

def main():
    report = {'checked_utc':dt.datetime.now(dt.timezone.utc).isoformat(),
              'source':API, 'mode':'READ_ONLY_NO_ALERTS_NO_INVENTORY',
              'checks':[]}
    failures=0
    for item in PRODUCTS:
        try:
            report['checks'].append(inspect(item,fetch(item)))
        except Exception as exc:
            failures+=1
            report['checks'].append({'product':item,'status':'ERROR',
                                     'error':type(exc).__name__+': '+str(exc)[:140]})
    print(json.dumps(report,ensure_ascii=False,indent=2))
    return 1 if failures else 0

if __name__=='__main__':
    sys.exit(main())
