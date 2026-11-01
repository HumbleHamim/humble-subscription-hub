const slug = process.argv[2] ?? 'hoco-gm109-smooth-series-active-universal-capacitive-stylus-pen';
const t = await (await fetch(`https://dopaminedropsbd.com/product/${slug}`)).text();
const marker = '\\"product\\":{';
const st = t.indexOf(marker);
const rec = t.indexOf(',\\"recommended\\":', st);
const p = JSON.parse(JSON.parse('"' + t.slice(st + marker.length - 1, rec) + '"'));
for (const k of Object.keys(p)) {
  const v = p[k];
  console.log(k, ':', typeof v === 'object' ? JSON.stringify(v).slice(0, 400) : v);
}
