import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, relative, resolve, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.png':'image/png','.svg':'image/svg+xml'};
const probes = {
  loja:'index.html',
  studio:'operations.html',
  campanhas:'campaign-data.js',
  'motor-de-campanhas':'store-engagement.js',
  console:'verify/index.html'
};
const startedAt = new Date().toISOString();

createServer(async (req,res)=>{
  try{
    const pathname = decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    if (pathname.startsWith('/api/health/')) {
      const service = pathname.slice('/api/health/'.length);
      if (req.method!=='GET' || !Object.hasOwn(probes,service)) throw new Error('Serviço desconhecido');
      if (!(await stat(join(root,probes[service]))).isFile()) throw new Error('Arquivo indisponível');
      res.writeHead(200,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});
      return res.end(JSON.stringify({service,startedAt,checkedAt:new Date().toISOString()}));
    }
    let file = resolve(root,'.'+pathname);
    const outside = relative(root,file);
    if (isAbsolute(outside) || outside.split(/[\\/]/)[0]==='..') throw new Error('Caminho inválido');
    if ((await stat(file)).isDirectory()) file = join(file,'index.html');
    const data = await readFile(file);
    res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','Cache-Control':'no-cache'});
    res.end(data);
  }catch{res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('Página não encontrada');}
}).listen(4173,'127.0.0.1',()=>console.log('Brasa Alta: http://localhost:4173'));
