const dialog = document.querySelector('#engageDialog');
const currentCampaign = new URLSearchParams(location.search).get('show');
let cartNudgeShown = false;

function showDialog(title, markup) {
  if (dialog.open) dialog.close();
  dialog.innerHTML = `<form method="dialog" class="dialog-close"><button aria-label="Fechar janela">Fechar ×</button></form><h2 id="dialogTitle">${title}</h2>${markup}`;
  dialog.showModal();
}

function useCoupon() {
  Brasa.update(state => { state.coupon = 'BRASA10'; });
  Brasa.record('Cupom ativado',{code:'BRASA10'});
  showToast('Cupom BRASA10 aplicado ao pedido');
}

function recommended() {
  const preference = products.find(p=>favorites.has(p.id) || cart[p.id]>0);
  return [...products].filter(p=>!cart[p.id]).sort((a,b)=>
    Number(b.category===(preference?.category || 'burger')) -
    Number(a.category===(preference?.category || 'burger'))).slice(0,3);
}

function content(row) {
  const [id,,,, action] = row;
  const link = (label, value) => `<button class="engage-button" data-engage="${value}">${label}</button>`;
  const choices = (items, type) => `<div class="campaign-choices" aria-label="Opções">${items.map((item,i)=>`<button data-engage="${type}" data-value="${i}">${item}</button>`).join('')}</div>`;
  switch (action) {
    case 'lead': return `<form class="campaign-form" data-lead="${id}"><label>Seu e-mail <input type="email" required autocomplete="email"></label><label><input type="checkbox" required> Aceito salvar meu cadastro neste navegador.</label><button class="engage-button">Salvar cadastro e cupom</button></form>`;
    case 'freight': return '<p data-freight></p><progress aria-label="Progresso para frete grátis" max="80" value="0"></progress>';
    case 'coupon': return link('Aplicar BRASA10','coupon');
    case 'clock': return '<p class="campaign-clock" data-clock="daily"></p>';
    case 'flash': return '<p class="campaign-clock" data-clock="flash"></p>'+link('Aplicar BRASA10','flash');
    case 'spin': return '<div class="wheel" aria-hidden="true">✦</div>'+link('Girar roleta','spin');
    case 'scratch': return '<button class="scratch" data-engage="scratch">Raspar ou tocar para revelar</button>';
    case 'carousel': return '<figure class="campaign-carousel" data-slide="0"><img src="assets/burger-classico.png" alt="Clássico da Casa"><figcaption>Clássico da Casa</figcaption><button data-engage="previous">Anterior</button><button data-engage="next">Próximo</button></figure>';
    case 'nps': return choices(Array.from({length:11},(_,i)=>i),'nps');
    case 'rating': return choices(['1 ★','2 ★','3 ★','4 ★','5 ★'],'rating');
    case 'survey': return choices(['Pedir almoço','Pedir jantar','Ver novidades'],'survey');
    case 'quiz': return choices(['Clássico','Duplo','Com bacon'],'quiz');
    case 'picks': return '<div class="campaign-choices" data-picks></div>';
    case 'watch': return link('Acompanhar o Brasa Duplo','watch');
    case 'cart': return link('Ver carrinho','cart');
    case 'burgers': return link('Ver hambúrgueres','burger');
    case 'sides': return link('Ver acompanhamentos','acompanhamento');
    case 'help': return link('Ver entrega e retirada','help');
    default: return link('Ver cardápio','todos');
  }
}

function renderCampaign(id, forced = false) {
  const row = Brasa.rows.find(item=>item[0]===id);
  if (!row || (!forced && Brasa.read().campaigns[id])) return;
  const [,format,title,copy,action,target,image] = row;
  if (format==='popup' && dialog.open) return;
  const img = image ? `<img class="campaign-image" src="assets/${image}.png" alt="">` : '';
  const markup = `${img}<p>${copy}</p>${content(row)}<p class="campaign-feedback" role="status"></p>`;
  if (format==='popup') {
    showDialog(title,`<div data-campaign="${id}">${markup}</div>`);
  } else {
    if (document.querySelector(`[data-campaign="${id}"]`)) return;
    const slot = target==='cart' ? '#cartCampaigns' : format==='corner'||format==='bar' ? '#floatingCampaigns' : action==='picks'||id==='story_rail' ? '#menuCampaigns' : '#heroCampaigns';
    document.querySelector(slot).insertAdjacentHTML('beforeend',`<aside class="campaign-block ${format}" data-campaign="${id}"><h2>${title}</h2>${markup}${format==='inline'?'':'<button class="campaign-dismiss" aria-label="Fechar campanha" data-engage="dismiss">×</button>'}</aside>`);
    if (forced && target!=='cart') document.querySelector(`[data-campaign="${id}"]`).scrollIntoView({block:'center'});
  }
  if (target==='cart' && format!=='popup') openCart();
  if (action==='flash') document.querySelector('[data-clock="flash"]').dataset.until=String(Date.now()+300000);
  if (format==='popup'||format==='corner') Brasa.update(state=>{state.campaigns[id]=true;});
  Brasa.record('Campanha exibida',{campaign:id,preview:forced});
  refreshCampaigns();
}

function refreshCampaigns() {
  const total = cartTotal();
  for (const node of document.querySelectorAll('[data-freight]')) {
    node.textContent = total>=80 ? 'Seu pedido tem frete grátis.' : `Faltam ${money(80-total)} para o frete grátis.`;
    node.nextElementSibling.value = total;
  }
  for (const node of document.querySelectorAll('[data-picks]')) {
    node.innerHTML = recommended().map(p=>`<button data-product="${p.id}">${p.name} · ${money(priceOf(p))}</button>`).join('');
  }
  const state = Brasa.read();
  const unread = state.messages.filter(message=>message.contact===state.contact && !message.read).length;
  document.querySelector('#messageCount').textContent = unread ? `(${unread})` : '';
}

function tick() {
  for (const clock of document.querySelectorAll('[data-clock]')) {
    const next = new Date();
    next.setHours(18,0,0,0);
    if (next.getTime()<=Date.now()) next.setDate(next.getDate()+1);
    const seconds = Math.max(0,Math.ceil(((Number(clock.dataset.until)||next.getTime())-Date.now())/1000));
    clock.textContent = seconds ? [Math.floor(seconds/3600),Math.floor(seconds/60)%60,seconds%60].map(n=>String(n).padStart(2,'0')).join(':') : 'Oferta encerrada';
    if (!seconds) clock.parentElement.querySelector('[data-engage="flash"]').disabled = true;
  }
}

dialog.addEventListener('pointermove',event=>{
  const scratch = event.target.closest('.scratch');
  if (!scratch || !event.buttons || scratch.disabled) return;
  const progress = Math.min(100,(Number(scratch.dataset.progress)||0)+4);
  scratch.dataset.progress = progress;
  scratch.style.setProperty('--scratch-progress',`${progress}%`);
  if (progress===100) scratch.click();
});

document.addEventListener('click',event=>{
  const button = event.target.closest('[data-engage]');
  if (!button) return;
  const container = button.closest('[data-campaign]');
  const campaign = container.dataset.campaign;
  const feedback = container.querySelector('.campaign-feedback');
  const {engage:action,value} = button.dataset;
  Brasa.record('Interação com campanha',{campaign,action,value});
  if (action==='dismiss') return container.remove();
  if (['coupon','flash','spin','scratch'].includes(action)) {
    if (action==='spin') container.querySelector('.wheel').classList.add('spun');
    if (action==='scratch') {
      button.textContent='BRASA10';
      button.style.setProperty('--scratch-progress','100%');
    }
    if (['spin','scratch'].includes(action)) button.disabled=true;
    useCoupon();
    feedback.textContent='BRASA10 disponível no carrinho.';
  } else if (action==='previous'||action==='next') {
    const carousel = button.closest('figure');
    const slides = [products[1],products[2],products[3]];
    const index = (Number(carousel.dataset.slide)+slides.length+(action==='next'?1:-1))%slides.length;
    carousel.dataset.slide=index;
    carousel.querySelector('img').src=slides[index].image;
    carousel.querySelector('img').alt=slides[index].name;
    carousel.querySelector('figcaption').textContent=slides[index].name;
  } else if (['nps','rating','survey','quiz'].includes(action)) {
    Brasa.record('Resposta registrada',{campaign,answer:button.textContent});
    feedback.textContent = action==='quiz' ? `Experimente ${products[[1,0,2][Number(value)]].name}.` : 'Obrigado. Sua resposta foi registrada.';
    for (const option of button.parentElement.querySelectorAll('button')) option.disabled=true;
  } else if (action==='watch') {
    Brasa.update(state=>{
      const profile = state.contact || 'visitante';
      state.watches[profile]=[...new Set([...(state.watches[profile]||[]),'brasa-duplo'])];
    });
    feedback.textContent='Aviso salvo para este perfil.';
  } else {
    if (dialog.open) dialog.close();
    if (action==='cart') openCart();
    else if (action==='help') document.querySelector('#entrega').scrollIntoView();
    else {
      document.querySelector(`.filter[data-filter="${action}"]`).click();
      document.querySelector('#cardapio').scrollIntoView();
    }
  }
});

dialog.addEventListener('submit',event=>{
  const form = event.target;
  if (!form.matches('[data-lead],#demoCheckout')) return;
  event.preventDefault();
  if (form.matches('[data-lead]')) {
    Brasa.update(state=>state.leads.push({email:form.querySelector('[type=email]').value,campaign:form.dataset.lead}));
    Brasa.record('Cadastro de campanha',{campaign:form.dataset.lead});
    useCoupon();
    form.replaceWith(Object.assign(document.createElement('p'),{textContent:'Cadastro local concluído. Cupom BRASA10 aplicado.'}));
    return;
  }
  const order = {id:Date.now().toString(36).toUpperCase(),contact:Brasa.read().contact,total:Number(form.dataset.total),mode:form.elements.mode.value};
  Brasa.update(state=>{state.orders.unshift(order); state.coupon='';});
  Brasa.record('Pedido demonstrativo confirmado',{order:order.id,total:order.total});
  cart={};
  saveCart();
  showDialog('Pedido registrado',`<p>Pedido de demonstração <strong>${order.id}</strong> · ${money(order.total)}</p><p>Nenhuma cobrança ou entrega é efetuada na demonstração.</p>`);
});

document.querySelector('#checkoutButton').addEventListener('click',()=>{
  closeCart();
  const subtotal = cartTotal();
  const discount = Brasa.read().coupon==='BRASA10' ? Math.round(subtotal*10)/100 : 0;
  const freight = subtotal>=80 ? 0 : 8;
  showDialog('Revise seu pedido',`<form id="demoCheckout" data-total="${(subtotal-discount+freight).toFixed(2)}"><label>Recebimento <select name="mode"><option value="entrega">Entrega</option><option value="retirada">Retirada</option></select></label><p>Subtotal ${money(subtotal)} · desconto ${money(discount)}</p><p id="demoOrderTotal"></p><button class="engage-button">Confirmar pedido de demonstração</button></form>`);
  const form = document.querySelector('#demoCheckout');
  function updateTotal() {
    const delivery = form.elements.mode.value==='entrega' ? freight : 0;
    form.dataset.total=(subtotal-discount+delivery).toFixed(2);
    document.querySelector('#demoOrderTotal').textContent=`Frete ${money(delivery)} · total ${money(Number(form.dataset.total))}`;
  }
  form.elements.mode.addEventListener('change',updateTotal);
  updateTotal();
});

document.querySelector('#messagesToggle').addEventListener('click',()=>{
  showDialog('Suas mensagens','<ul class="engage-list" id="messageList"></ul>');
  const state = Brasa.read();
  const list = document.querySelector('#messageList');
  const messages = state.messages.filter(message=>message.contact===state.contact);
  for (const message of messages) list.append(Object.assign(document.createElement('li'),{textContent:`${message.title} · ${message.channels.join(', ')} · ${new Date(message.at).toLocaleString('pt-BR')}`}));
  if (!messages.length) list.textContent='Nenhuma mensagem para este perfil.';
  Brasa.update(next=>next.messages.forEach(message=>{if(message.contact===state.contact)message.read=true;}));
  refreshCampaigns();
});

document.addEventListener('brasa:cart',refreshCampaigns);
window.addEventListener('storage',event=>{
  if (event.key===Brasa.key) {renderProducts();renderCart();refreshCampaigns();}
});
document.querySelector('#cartToggle').addEventListener('click',()=>{
  if (!currentCampaign && !document.querySelector('[data-freight]')) renderCampaign('free_delivery_bar');
});
document.querySelector('#cartClose').addEventListener('click',()=>{
  if (!currentCampaign && cartTotal()>0 && !cartNudgeShown) {
    cartNudgeShown=true;
    renderCampaign('exit_basket_save');
  }
});
if (currentCampaign) renderCampaign(currentCampaign,true);
else {
  renderCampaign('pick_inline');
  const variant = Brasa.read().campaigns.saleVariant || (Math.random()<.5?'a':'b');
  Brasa.update(state=>{state.campaigns.saleVariant=variant;});
  renderCampaign(`sale_ab_${variant}`);
  setTimeout(()=>renderCampaign('focus_popup'),5500);
  window.addEventListener('scroll',()=>{
    if (window.scrollY>850) renderCampaign('scroll_picks');
  },{passive:true});
  document.addEventListener('mouseleave',event=>{
    if (event.clientY<=0 && !Brasa.read().campaigns.focus_popup) renderCampaign('exit_picks');
  });
}
Brasa.record('Visita à loja');
refreshCampaigns();
tick();
setInterval(tick,1000);
