const products = [
  {id:'brasa-duplo',name:'Brasa Duplo',category:'burger',label:'Destaque',price:42.90,image:'assets/hero-burger.png',desc:'Dois burgers de 120g, cheddar, cebola caramelizada e molho da casa.'},
  {id:'classico',name:'Clássico da Casa',category:'burger',label:'Mais pedido',price:34.90,image:'assets/burger-classico.png',desc:'Burger de 160g, cheddar, alface, tomate, picles e molho especial.'},
  {id:'bacon-bbq',name:'Bacon & Brasa',category:'burger',price:39.90,image:'assets/burger-bacon.png',desc:'Dois burgers, bacon crocante, queijo e barbecue defumado.'},
  {id:'fritas',name:'Fritas da Casa',category:'acompanhamento',price:18.90,image:'assets/batata.png',desc:'Batatas crocantes, sal de ervas e maionese verde.'},
  {id:'smash',name:'Smash da Brasa',category:'burger',price:29.90,image:'assets/burger-bacon.png',desc:'Burger prensado, queijo, cebola tostada e picles no brioche.'},
  {id:'onion',name:'Onion Rings',category:'acompanhamento',price:21.90,image:'assets/batata.png',desc:'Anéis de cebola empanados com molho barbecue.'},
  {id:'cola',name:'Cola Artesanal',category:'bebida',price:12.00,image:'assets/hero-burger.png',desc:'Refrigerante artesanal de cola com limão-siciliano, 350 ml.'},
  {id:'brownie',name:'Brownie de Brasa',category:'sobremesa',price:22.90,image:'assets/burger-classico.png',desc:'Chocolate intenso, caramelo salgado e sorvete de baunilha.'}
];

let cart = JSON.parse(localStorage.getItem('brasa-cart') || '{}');
let favorites = new Set(JSON.parse(localStorage.getItem('brasa-favorites') || '[]'));
let activeFilter = 'todos';
let searchTerm = '';
const grid = document.querySelector('#productsGrid');
const emptyState = document.querySelector('#emptyState');
const money = value => value.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const priceOf = product => Brasa.read().prices[product.id] ?? product.price;
const cartTotal = () => products.reduce((total, product) => total + priceOf(product) * (cart[product.id] || 0), 0);

function productCard(product){
  return `<article class="product-card" data-name="${product.name.toLowerCase()}">
    <div class="product-image"><img src="${product.image}" alt="${product.name}" loading="lazy">${product.label?`<span class="product-tag">${product.label}</span>`:''}<button class="save-button ${favorites.has(product.id)?'saved':''}" data-save="${product.id}" aria-pressed="${favorites.has(product.id)}" aria-label="Favoritar ${product.name}">${favorites.has(product.id)?'♥':'♡'}</button></div>
    <div class="product-info"><span class="product-category">${categoryLabel(product.category)}</span><h3>${product.name}</h3><p class="product-desc">${product.desc}</p><div class="product-bottom"><span class="price">${money(priceOf(product))}</span><button class="add-button" data-product="${product.id}">Adicionar</button></div></div>
  </article>`;
}
function categoryLabel(category){return {burger:'Hambúrguer',acompanhamento:'Acompanhamento',bebida:'Bebida',sobremesa:'Sobremesa'}[category]}
function renderProducts(){
  const visible=products.filter(p=>(activeFilter==='todos'||p.category===activeFilter)&&(`${p.name} ${p.desc}`.toLowerCase().includes(searchTerm)));
  grid.innerHTML=visible.map(productCard).join(''); emptyState.hidden=visible.length>0;
}
function saveCart(){localStorage.setItem('brasa-cart',JSON.stringify(cart));renderCart();document.dispatchEvent(new Event('brasa:cart'))}
function addToCart(id){const p=products.find(item=>item.id===id);if(!p)return;cart[p.id]=(cart[p.id]||0)+1;saveCart();Brasa.record('Produto adicionado',{product:id});showToast(`${p.name} foi adicionado ao carrinho`)}
function renderCart(){
  const entries=Object.entries(cart).filter(([,q])=>q>0); const count=entries.reduce((s,[,q])=>s+q,0);
  document.querySelector('#cartCount').textContent=count;
  document.querySelector('#cartItems').innerHTML=entries.map(([id,qty])=>{const p=products.find(x=>x.id===id);return `<div class="cart-item"><img src="${p.image}" alt=""><div><h4>${p.name}</h4><p>${money(priceOf(p))}</p><div class="qty"><button data-qty="${id}" data-delta="-1" aria-label="Diminuir">−</button><span>${qty}</span><button data-qty="${id}" data-delta="1" aria-label="Aumentar">+</button></div></div><button class="remove" data-remove="${id}">Remover</button></div>`}).join('');
  document.querySelector('#cartSubtotal').textContent=money(cartTotal());
  document.querySelector('#cartEmpty').hidden=entries.length>0;document.querySelector('.cart-summary').hidden=entries.length===0;
}
function openCart(){document.querySelector('#cartDrawer').classList.add('open');document.querySelector('#backdrop').classList.add('open');document.querySelector('#cartDrawer').setAttribute('aria-hidden','false');document.body.classList.add('locked')}
function closeCart(){document.querySelector('#cartDrawer').classList.remove('open');document.querySelector('#backdrop').classList.remove('open');document.querySelector('#cartDrawer').setAttribute('aria-hidden','true');document.body.classList.remove('locked')}
let toastTimer;function showToast(text){const t=document.querySelector('#toast');t.textContent=text;t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),2400)}

document.addEventListener('click',e=>{
  const add=e.target.closest('[data-product]');if(add)addToCart(add.dataset.product);
  const heroAdd=e.target.closest('[data-add]');if(heroAdd)addToCart('brasa-duplo');
  const filter=e.target.closest('[data-filter]');if(filter){activeFilter=filter.dataset.filter;document.querySelectorAll('.filter').forEach(b=>b.classList.toggle('active',b===filter));renderProducts()}
  const save=e.target.closest('.save-button');if(save){
    const id=save.dataset.save;
    if(favorites.has(id)) favorites.delete(id); else favorites.add(id);
    localStorage.setItem('brasa-favorites',JSON.stringify([...favorites]));
    save.classList.toggle('saved',favorites.has(id));
    save.setAttribute('aria-pressed',String(favorites.has(id)));
    save.textContent=favorites.has(id)?'♥':'♡';
    Brasa.record('Favorito atualizado',{product:id});
    document.dispatchEvent(new Event('brasa:cart'));
  }
  const qty=e.target.closest('[data-qty]');if(qty){cart[qty.dataset.qty]=Math.max(0,(cart[qty.dataset.qty]||0)+Number(qty.dataset.delta));saveCart()}
  const remove=e.target.closest('[data-remove]');if(remove){delete cart[remove.dataset.remove];saveCart()}
});
document.querySelector('#cartToggle').addEventListener('click',openCart);document.querySelector('#cartClose').addEventListener('click',closeCart);document.querySelector('#backdrop').addEventListener('click',closeCart);
document.querySelector('#searchToggle').addEventListener('click',()=>{document.querySelector('#searchPanel').classList.add('open');document.querySelector('#searchToggle').setAttribute('aria-expanded','true');setTimeout(()=>document.querySelector('#searchInput').focus(),100)});
document.querySelector('#searchClose').addEventListener('click',()=>{document.querySelector('#searchPanel').classList.remove('open');document.querySelector('#searchToggle').setAttribute('aria-expanded','false')});
document.querySelector('#searchInput').addEventListener('input',e=>{searchTerm=e.target.value.trim().toLowerCase();renderProducts();if(searchTerm)document.querySelector('#cardapio').scrollIntoView({behavior:'smooth'})});
document.querySelector('#newsletterForm').addEventListener('submit',e=>{
  e.preventDefault();
  Brasa.update(state=>state.leads.push({email:e.target.querySelector('input').value,source:'newsletter'}));
  Brasa.record('Cadastro para novidades');
  document.querySelector('#newsletterStatus').textContent='Cadastro salvo neste navegador.';
  e.target.reset();
});
document.querySelector('#menuToggle').addEventListener('click',()=>{const nav=document.querySelector('.desktop-nav');nav.style.display=nav.style.display==='flex'?'none':'flex';nav.style.position='absolute';nav.style.top='72px';nav.style.left='0';nav.style.right='0';nav.style.background='#080808';nav.style.padding='24px';nav.style.flexDirection='column'});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeCart();document.querySelector('#searchPanel').classList.remove('open')}});
renderProducts();renderCart();
