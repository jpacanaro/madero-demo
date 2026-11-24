const services = {
  loja:'Loja',
  studio:'Engagement Studio',
  campanhas:'Catálogo de campanhas',
  'motor-de-campanhas':'Motor de campanhas',
  console:'Verification Console'
};

function definitionList(id, entries) {
  const list = document.getElementById(id);
  list.replaceChildren();
  for (const [label,value] of entries) {
    list.append(Object.assign(document.createElement('dt'),{textContent:label}),Object.assign(document.createElement('dd'),{textContent:value}));
  }
}

function readBrowser() {
  const state = Brasa.read();
  definitionList('observed',[
    ['Perfil vinculado',state.contact||'Visitante'],
    ['Campanhas configuradas',Brasa.rows.length],
    ['Exibições registradas',state.events.filter(event=>event.name==='Campanha exibida').length],
    ['Eventos locais',state.events.length],
    ['Mensagens simuladas',state.messages.length],
    ['Cadastros locais',state.leads.length],
    ['Pedidos demonstrativos',state.orders.length]
  ]);
}

async function check() {
  const refresh = document.getElementById('refresh');
  const checked = document.getElementById('checkedAt');
  const tbody = document.getElementById('services');
  refresh.disabled=true;
  checked.textContent='Verificando…';
  readBrowser();
  tbody.replaceChildren();
  await Promise.all(Object.entries(services).map(async ([id,label])=>{
    const row = tbody.insertRow();
    row.insertCell().textContent=label;
    const status = row.insertCell();
    const detail = row.insertCell();
    status.textContent='Consultando';
    try {
      const response = await fetch(`../api/health/${id}`,{cache:'no-store',signal:AbortSignal.timeout(4000)});
      status.textContent=`HTTP ${response.status}`;
      if (!response.ok) {
        detail.textContent='Serviço indisponível neste servidor.';
        return;
      }
      const data = await response.json();
      if (data.service!==id) throw Error('Resposta inesperada');
      detail.textContent=`Servidor iniciado às ${new Date(data.startedAt).toLocaleString('pt-BR')}`;
    } catch {
      status.textContent='Indisponível';
      detail.textContent='Abra a loja pelo servidor Node.js para consultar este serviço.';
    }
  }));
  checked.textContent=`Última consulta às ${new Date().toLocaleTimeString('pt-BR')}`;
  refresh.disabled=false;
}

definitionList('config',[
  ['Origem',location.origin==='null'?'Arquivo local':location.origin],
  ['Ambiente','Demonstração local'],
  ['Persistência','Armazenamento deste navegador']
]);
document.getElementById('refresh').addEventListener('click',check);
window.addEventListener('storage',event=>{if(event.key===Brasa.key)readBrowser();});
check();
