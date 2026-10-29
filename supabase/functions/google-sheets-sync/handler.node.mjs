import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';
import { webcrypto } from 'node:crypto';
import { HEADERS, cellsFor } from './model.ts';

const row = {id:'BH-T',version:1,received_date:'2026-10-29',channel:'SHOPEE',order_code:'001',customer:'Khách',phone:'0900',address:'',product:'',reason:'',test_result:'',replacement:'',inbound_code:'',outbound_code:'',sent_date:null,due_date:null,priority:'Bình thường',status:'Chờ nhận hàng',ship_flag:false,ship_in:null,ship_out:null,parts:null,labor:null,other:null,refund:null,extra:null,cost_reviewed:false,note:''};
let state;
globalThis.createClientMock = () => ({
  auth: {getUser:async()=>({data:{user:state.auth?{email:'admin@example.com'}:null}})},
  rpc:async(name)=>({data:name.startsWith('acquire')?true:null}),
  from(table) {
    let write = false;
    const q = {
      select(){return q},eq(){return q},is(){return q},order(){return q},
      async maybeSingle(){return {data:{role:state.role,active:true}}},
      async range(){return {data:state.records}},
      update(fields){write=true;state.writes.push(fields);return q},
      insert(fields){write=true;state.writes.push(fields);return q},
      async single(){return state.casFail?{error:{message:'conflict'}}:{data:{...row,...state.writes.at(-1),version:2}}}
    };
    return q;
  }
});
globalThis.jwtMock = class {
  setProtectedHeader(){return this} setIssuer(){return this} setAudience(){return this}
  setIssuedAt(){return this} setExpirationTime(){return this} async sign(){return 'fake-jwt'}
};
const originalFetch = globalThis.fetch;
globalThis.fetch = async (url, options={}) => {
  if(String(url).includes('oauth2.googleapis.com')) return Response.json({access_token:'fake-token'});
  state.googleCalls.push({url,options});
  if(String(url).includes('?fields=')) return Response.json({sheets:[{properties:{title:'Salaman Sync',gridProperties:{rowCount:5001,columnCount:29}}}]});
  if(String(url).includes('/values/') && !options.body){
    state.reads++;
    return Response.json({values:state.changed && state.reads>1?[...state.sheet,['changed']]:state.sheet});
  }
  return Response.json({});
};
globalThis.Deno = {
  env:{get:(key)=>({SUPABASE_URL:'https://test.supabase.co',SUPABASE_ANON_KEY:'anon',SUPABASE_SERVICE_ROLE_KEY:'service-key',GOOGLE_SERVICE_ACCOUNT_JSON:state?.secret ? JSON.stringify({private_key:'fake',client_email:'test@example.com'}):undefined})[key]},
  serve:handler=>globalThis.handler=handler
};
let source = await readFile(new URL('./index.ts',import.meta.url),'utf8');
source = source.replace("import { createClient } from 'npm:@supabase/supabase-js@2';",'const createClient = globalThis.createClientMock;')
  .replace("import { importPKCS8, SignJWT } from 'npm:jose@5';",'const importPKCS8 = async () => ({}); const SignJWT = globalThis.jwtMock;')
  .replace("'./model.ts'",JSON.stringify(new URL('./model.ts',import.meta.url).href));
await import('data:text/javascript;base64,'+Buffer.from(stripTypeScriptTypes(source)).toString('base64'));
function reset(){state={auth:true,role:'admin',secret:true,records:[{...row}],sheet:[],writes:[],googleCalls:[],reads:0};}
async function call(action='sync'){
  const res=await globalThis.handler(new Request('https://example.test',{method:'POST',headers:{Authorization:'Bearer x','Content-Type':'application/json'},body:JSON.stringify({action})}));
  return {status:res.status,body:await res.json()};
}
async function sign(r){
  const key=await webcrypto.subtle.importKey('raw',new TextEncoder().encode('service-key'),{name:'HMAC',hash:'SHA-256'},false,['sign']);
  return Buffer.from(await webcrypto.subtle.sign('HMAC',key,new TextEncoder().encode(JSON.stringify(cellsFor(r))))).toString('hex');
}
test('authentication and active admin role required before any Google request',async()=>{
  reset();state.auth=false;assert.equal((await call()).status,401);assert.equal(state.googleCalls.length,0);
  reset();state.role='viewer';assert.equal((await call()).status,403);assert.equal(state.googleCalls.length,0);
});
test('missing service secret reports setup error',async()=>{
  reset();state.secret=false;assert.match((await call()).body.error,/GOOGLE_SERVICE_ACCOUNT_JSON/);
});
test('initial export writes RAW including phone leading zeroes',async()=>{
  reset();const result=await call();assert.equal(result.status,200);assert.equal(result.body.exported,1);
  const write=state.googleCalls.find(c=>String(c.url).endsWith('/values:batchUpdate'));
  const body=JSON.parse(write.options.body);assert.equal(body.valueInputOption,'RAW');
  assert.equal(body.data[1].values[0][6],'0900');assert.equal(state.writes.length,0);
});
test('sheet-only change updates database and exports new version',async()=>{
  reset();state.sheet=[HEADERS,[...cellsFor({...row,note:'sheet edit'}),await sign(row)]];
  const result=await call();assert.equal(result.status,200);assert.equal(result.body.imported,1);
  assert.equal(state.writes[0].note,'sheet edit');assert.equal(state.writes[0].version,undefined);
});
test('simultaneous changes stop before any database mutation',async()=>{
  reset();state.records=[{...row,version:2,note:'web edit'}];
  state.sheet=[HEADERS,[...cellsFor({...row,note:'sheet edit'}),await sign(row)]];
  const result=await call();assert.equal(result.status,409);assert.deepEqual(result.body.conflicts,['BH-T']);assert.equal(state.writes.length,0);
});
test('unchanged sheet exports newer database data',async()=>{
  reset();state.records=[{...row,version:2,note:'web edit'}];
  state.sheet=[HEADERS,[...cellsFor(row),await sign(row)]];
  assert.equal((await call()).body.exported,1);assert.equal(state.writes.length,0);
});
test('invalid later row prevents importing valid earlier edits',async()=>{
  reset();state.sheet=[HEADERS,[...cellsFor({...row,note:'sheet edit'}),'signature'],['invalid']];
  assert.equal((await call()).status,500);assert.equal(state.writes.length,0);
});
test('database version race blocks sheet export with partial-progress message',async()=>{
  reset();state.casFail=true;state.sheet=[HEADERS,[...cellsFor({...row,note:'sheet edit'}),'signature']];
  assert.equal((await call()).status,500);
  assert.equal(state.googleCalls.some(c=>String(c.url).endsWith('/values:batchUpdate')),false);
});
test('sheet changed during session is not overwritten',async()=>{
  reset();state.changed=true;assert.equal((await call()).status,500);
  assert.equal(state.googleCalls.some(c=>String(c.url).endsWith('/values:batchUpdate')),false);
});
