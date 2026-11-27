function extractAmazonInvoice(text){
 const source=String(text||'');
 if(!/amazon\s*(?:eu|\.es)|amazon\.es/i.test(source)||!/detalles (?:del documento|de la factura)/i.test(source))return null;
 const lines=source.split(/\r?\n/).map(v=>v.replace(/\s+/g,' ').trim()).filter(Boolean);
 const months={enero:1,febrero:2,marzo:3,abril:4,mayo:5,junio:6,julio:7,agosto:8,septiembre:9,setiembre:9,octubre:10,noviembre:11,diciembre:12};
 let date=receiptDateToday();
 const dm=source.match(/fecha del pedido\s+(\d{1,2})\s+([a-zñ]+)\s+(20\d{2})/i);
 if(dm){const month=months[receiptNormalize(dm[2])];if(month)date=dm[3]+'-'+String(month).padStart(2,'0')+'-'+String(Number(dm[1])).padStart(2,'0')}
 const price='(-?\\d{1,6}[,.]\\d{2})\\s*€';
 const pattern=new RegExp('^(.+?)\\s+(\\d{1,3})\\s+'+price+'\\s+(\\d{1,2})\\s*%\\s+'+price+'\\s+'+price+'$','i');
 let inTable=false,invoiceTotal=null,discount=0;
 const products=[];
 for(const line of lines){
  if(/detalles (?:del documento|de la factura)/i.test(line)){inTable=true;continue}
  if(!inTable)continue;
  const totalLine=line.match(/^total\s+(\d{1,6}[,.]\d{2})\s*€\s*$/i);
  if(totalLine){invoiceTotal=receiptPrice(totalLine[1]);break}
  const m=line.match(pattern);
  if(m){
   const name=m[1].trim(),qty=Number(m[2]),unit=receiptPrice(m[5]),total=receiptPrice(m[6]);
   if(!/^(?:env[ií]o|promociones)$/i.test(name)&&qty>=1&&qty<=999&&unit!==null&&total!==null&&Math.abs(unit*qty-total)<.025)products.push({name,qty,total});
   continue;
  }
  if(/^promociones\b/i.test(line)){
   const amounts=[...line.matchAll(/(-\d{1,6}[,.]\d{2})\s*€/g)];
   if(amounts.length)discount+=Number(amounts[amounts.length-1][1].replace(',','.'));
  }
 }
 const fail=why=>({rows:[],store:'Amazon',date,raw:'--- FACTURA AMAZON ---\n'+source+'\n\nAVÍS: '+why,pdfWarning:why});
 if(!products.length)return fail('No s’han pogut llegir totes les columnes dels articles.');
 const groups=new Map();
 for(const p of products){const key=receiptNormalize(p.name);
  if(groups.has(key)){const g=groups.get(key);g.qty+=p.qty;g.total=Math.round((g.total+p.total)*100)/100}
  else groups.set(key,{...p});
 }
 const rows=[...groups.values()];
 if(discount!==0){
  if(rows.length===1)rows[0].total=Math.round((rows[0].total+discount)*100)/100;
  else return fail('Hi ha una promoció global de diversos productes. Cal revisar-ne el repartiment.');
 }
 const sum=Math.round(rows.reduce((a,r)=>a+r.total,0)*100)/100;
 if(invoiceTotal===null||Math.abs(sum-invoiceTotal)>.01)return fail('El total de les línies no coincideix amb el total de la factura.');
 return {rows:rows.map(r=>({...r,productId:'',priceEvidence:'Preu final de factura, promoció inclosa',priceConfidence:100})),store:'Amazon',date,
  raw:'--- FACTURA AMAZON ---\n'+source+'\n\nArticles: '+products.map(p=>p.qty).join(' + ')+
      '\nDescompte: '+discount.toFixed(2)+' €\nTotal validat: '+sum.toFixed(2)+' €'};
}