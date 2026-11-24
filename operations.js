const byId = id => document.getElementById(id);
const profileForm = byId('profileForm');
const lookup = byId('inboxForm');
const broadcastForm = byId('broadcastForm');
const broadcastSend = byId('broadcastSend');
const watched = byId('watchedProduct');
const dateLabel = date => new Date(date).toLocaleString('pt-BR');
const formats = {popup:'Pop-up',bar:'Barra',inline:'No conteúdo',corner:'Canto da tela'};
let draft = null;
let statusTimer;

function status(text) {
  const node = byId('opsStatus');
  node.textContent = text;
  node.hidden = false;
  clearTimeout(statusTimer);
  statusTimer = setTimeout(()=>{node.hidden=true;},4500);
}

function list(node, lines, empty) {
  node.replaceChildren(...(lines.length ? lines : [empty]).map(text=>
    Object.assign(document.createElement('li'),{textContent:text})
  ));
}

function renderStatus() {
  const state = Brasa.read();
  const push = state.profiles[state.contact]?.push || false;
  byId('activeProfile').textContent = state.contact ? `Perfil vinculado: ${state.contact}` : 'Nenhum perfil vinculado.';
  byId('pushToggle').textContent = push ? 'Desativar push simulado' : 'Ativar push simulado';
  list(byId('eventLog'),state.events.slice(0,18).map(event=>
    [dateLabel(event.at),event.contact||'Visitante',event.name,event.campaign,event.channels?.join(' + ')].filter(Boolean).join(' · ')
  ),'Nenhuma atividade registrada.');
}

function deliver(title, contacts, channels) {
  const at = new Date().toISOString();
  Brasa.update(state=>{
    const messages = contacts.map(contact=>({title,contact,channels,at,read:false}));
    state.messages = [...messages,...state.messages].slice(0,500);
  });
  Brasa.record(title,{channels,recipients:contacts.length});
  renderStatus();
}

byId('moments').innerHTML = Object.entries(Brasa.groups).map(([group,moments])=>
  `<section class="ops-card"><h3>${group}</h3><div class="campaign-choices">${moments.map(moment=>`<button data-moment="${moment}">${moment}</button>`).join('')}</div></section>`
).join('');
byId('previews').innerHTML = Brasa.rows.map(([id,format,title])=>
  `<a href="index.html?show=${id}" target="_blank" rel="noopener"><span>${formats[format]}</span><strong>${title}</strong><span>Visualizar</span></a>`
).join('');

profileForm.addEventListener('submit',event=>{
  event.preventDefault();
  const contact = profileForm.elements.contact.value.trim();
  Brasa.update(state=>{
    state.contact=contact;
    state.profiles[contact]={...state.profiles[contact],city:profileForm.elements.city.value};
  });
  Brasa.record('Perfil vinculado');
  renderStatus();
});

byId('pushToggle').addEventListener('click',()=>{
  const {contact} = Brasa.read();
  if (!contact) return status('Vincule um perfil antes de ativar push.');
  Brasa.update(state=>{state.profiles[contact].push=!state.profiles[contact].push;});
  Brasa.record('Preferência de push atualizada');
  renderStatus();
});

byId('moments').addEventListener('click',event=>{
  const moment = event.target.dataset.moment;
  if (!moment) return;
  const {contact,profiles} = Brasa.read();
  if (!contact) return status('Vincule um perfil primeiro.');
  const channels = [];
  if (byId('emailChannel').checked) channels.push('E-mail');
  if (byId('pushChannel').checked && profiles[contact]?.push) channels.push('Push');
  if (!channels.length) return status('Selecione e-mail ou ative push para este perfil.');
  deliver(moment,[contact],channels);
  status('Evento simulado. A mensagem está na caixa local do perfil.');
});

function readWatches() {
  const state = Brasa.read();
  const ids = state.watches[state.contact||'visitante'] || [];
  watched.replaceChildren(new Option(ids.length?'Selecione um produto':'Nenhum produto acompanhado',''));
  if (ids.includes('brasa-duplo')) watched.add(new Option('Brasa Duplo','brasa-duplo'));
}
byId('readWatches').addEventListener('click',readWatches);
document.addEventListener('click',event=>{
  const discount = event.target.dataset.discount;
  if (discount===undefined) return;
  if (!watched.value) return status('Selecione um produto monitorado.');
  const percent = Number(discount);
  const revisedPrice = Math.round(4290*(1-percent/100))/100;
  Brasa.update(state=>{
    if (percent) state.prices[watched.value]=revisedPrice;
    else delete state.prices[watched.value];
  });
  if (percent) deliver('Preço baixou: Brasa Duplo',[Brasa.read().contact],['Caixa local']);
  else Brasa.record('Preço original restaurado',{product:watched.value});
  byId('priceStatus').textContent=`Brasa Duplo · ${revisedPrice.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}`;
  renderStatus();
});

function recipients(city) {
  return Object.entries(Brasa.read().profiles).filter(([,profile])=>profile.city===city && profile.push).map(([contact])=>contact);
}
broadcastForm.addEventListener('input',()=>{
  draft=null;
  broadcastSend.disabled=true;
  broadcastSend.textContent='Simular envio';
  byId('broadcastStatus').textContent='';
});
broadcastForm.addEventListener('submit',event=>{
  event.preventDefault();
  const {city,type,body} = Object.fromEntries(new FormData(broadcastForm));
  draft={city,title:`${type} · ${city}${body.trim() ? ' · '+body.trim() : ''}`,confirmed:false};
  byId('broadcastStatus').textContent=`${draft.title} · ${recipients(city).length} perfil(is) com push ativo`;
  broadcastSend.disabled=false;
});
broadcastSend.addEventListener('click',()=>{
  if (!draft.confirmed) {
    draft.confirmed=true;
    broadcastSend.textContent='Confirmar simulação';
    return;
  }
  const contacts = recipients(draft.city);
  if (contacts.length) deliver(draft.title,contacts,['Push']);
  else Brasa.record('Segmento sem destinatários',{city:draft.city});
  byId('broadcastStatus').textContent=`Simulação concluída. ${contacts.length} mensagem(ns) adicionada(s) às caixas locais.`;
  broadcastSend.disabled=true;
  broadcastSend.textContent='Simular envio';
  draft=null;
  renderStatus();
});

function showInbox() {
  const contact = lookup.elements.contact.value.trim();
  list(byId('inboxList'),Brasa.read().messages.filter(message=>message.contact===contact).map(message=>
    `${dateLabel(message.at)} · ${message.title} · ${message.channels.join(' + ')}`
  ),'Nenhuma mensagem para este perfil.');
}
lookup.addEventListener('submit',event=>{event.preventDefault();showInbox();});
byId('useProfile').addEventListener('click',()=>{
  lookup.elements.contact.value=Brasa.read().contact;
  showInbox();
});
window.addEventListener('storage',event=>{if(event.key===Brasa.key)renderStatus();});
profileForm.elements.contact.value=Brasa.read().contact;
const profile = Brasa.read().profiles[Brasa.read().contact];
if (profile?.city) profileForm.elements.city.value=profile.city;
renderStatus();
readWatches();
