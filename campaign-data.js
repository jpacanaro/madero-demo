(() => {
  const rows = [
    ['focus_popup','popup','10% no primeiro pedido','Receba o cupom BRASA10 para experimentar a casa.','lead'],
    ['free_delivery_bar','bar','Quanto falta para o frete grátis?','Confira o progresso do seu carrinho.','freight','cart'],
    ['exit_basket_save','popup','Seu pedido ainda está aqui','Volte ao carrinho para continuar.','cart','cart'],
    ['size_guide_inline','inline','Qual tamanho pedir?','Uma carne para a fome do dia. Duas para quem quer reforçar.','menu'],
    ['size_back_inline','inline','O duplo voltou','O Brasa Duplo está de volta ao cardápio.','watch'],
    ['sale_ab_a','inline','10% para experimentar','Use BRASA10 no carrinho.','coupon'],
    ['sale_ab_b','inline','Seu hambúrguer com desconto','Monte seu pedido e aplique BRASA10.','coupon'],
    ['drop_countdown','inline','A próxima fornada','O especial da casa entra no cardápio às 18h.','clock'],
    ['category_offer_band','inline','Complete seu hambúrguer','Escolha uma porção para acompanhar.','sides'],
    ['spin_wheel','popup','Roleta da Brasa','Gire para revelar um cupom de demonstração.','spin'],
    ['scratch_card','popup','Raspadinha da casa','Raspe o cartão para revelar o cupom.','scratch'],
    ['sale_picture_popup','popup','Favoritos da grelha','Conheça o nosso Brasa Duplo.','menu',null,'hero-burger'],
    ['collect_popup','popup','Retire no balcão','Escolha retirada na etapa de revisão do pedido.','cart','cart'],
    ['new_season_video','popup','Especial da temporada','Veja os destaques da temporada em uma sequência de fotos.','carousel'],
    ['promise_bar','bar','Da grelha para sua mesa','Pão tostado, carne fresca e embalagem térmica.','menu'],
    ['sale_sticky_bar','bar','Oferta da casa','Use BRASA10 no carrinho.','coupon'],
    ['delivery_image_bar','bar','Entrega Brasa Alta','Frete grátis em pedidos a partir de R$ 80.','freight','cart','batata'],
    ['signup_popup','popup','Novidades da casa','Cadastre-se para acompanhar lançamentos e ofertas.','lead'],
    ['beauty_edit_popup','popup','Hambúrgueres da casa','Conheça os favoritos da grelha.','burgers',null,'burger-classico'],
    ['sale_alerts_popup','popup','Alerta de ofertas','Receba novidades sobre os itens da casa.','lead'],
    ['nps_lead_popup','popup','Conte como foi sua visita','Qual a chance de recomendar a Brasa Alta?','nps'],
    ['visit_rating_popup','popup','Como foi sua visita?','Avalie sua experiência no restaurante.','rating'],
    ['nps_popup','popup','Você recomendaria a Brasa Alta?','Dê uma nota de 0 a 10.','nps'],
    ['order_rating_popup','popup','Avalie seu pedido','Como foi sua experiência com a entrega?','rating'],
    ['why_today_popup','popup','O que trouxe você hoje?','Escolha o motivo da sua visita.','survey'],
    ['flash_clock_popup','popup','Oferta por tempo limitado','Use BRASA10 antes do fim da contagem.','flash'],
    ['sale_carousel_popup','popup','Escolhas da casa','Passe pelas fotos e descubra seu próximo pedido.','carousel'],
    ['gift_edit_inline','inline','Para dividir à mesa','Escolha seus hambúrgueres e acompanhamentos.','sides'],
    ['pick_inline','inline','Escolhido para você','Sugestões baseadas no seu carrinho e nos seus favoritos.','picks'],
    ['promises_inline','inline','Peça do seu jeito','Entrega em casa ou retirada no balcão.','cart','#entrega'],
    ['story_rail','inline','Da nossa cozinha','Veja de perto os favoritos da Brasa.','carousel'],
    ['welcome_offer','popup','Bem-vindo à Brasa Alta','Experimente a casa com 10% de desconto.','coupon'],
    ['style_quiz','popup','Encontre seu hambúrguer','Qual tipo de hambúrguer você prefere?','quiz'],
    ['scroll_picks','corner','Uma sugestão da casa','Veja os hambúrgueres favoritos.','burgers'],
    ['help_nudge','corner','Precisa de ajuda com seu pedido?','Consulte as opções de entrega e retirada.','help'],
    ['low_stock_inline','inline','Especial em pequenas fornadas','Ative um aviso para acompanhar a disponibilidade.','watch'],
    ['exit_picks','popup','Antes de ir','Conheça os favoritos da casa.','burgers']
  ];
  const groups = {
    'Conta':['Boas-vindas'],
    'Pedidos':['Pedido confirmado','Em preparo','Embalado','Saiu para entrega','Entregue','Problema na entrega'],
    'Retirada':['Pronto para retirada','Retirado'],
    'Restaurante':['Visita ao restaurante','Check-in','Compra no balcão','Código escaneado','Disponível na unidade'],
    'Cardápio':['Preço baixou','Voltou ao cardápio','Tamanho disponível','Estoque baixo','Lançamento'],
    'Cancelamentos':['Solicitação recebida','Reembolso emitido'],
    'Atendimento':['Ligação de atendimento','Intenção no chatbot','Reclamação aberta','Reclamação resolvida'],
    'Relacionamento':['Hora de pedir novamente','Assinatura cancelada']
  };
  const defaults = {contact:'',push:false,events:[],messages:[],prices:{},watches:{},leads:[],orders:[],coupon:'',campaigns:{},profiles:{}};
  const key = 'brasa-engagement-v1';
  function read() {
    try { return {...defaults,...JSON.parse(localStorage.getItem(key) || '{}')}; }
    catch { return structuredClone(defaults); }
  }
  function update(change) {
    const state = read();
    change(state);
    localStorage.setItem(key,JSON.stringify(state));
    return state;
  }
  function record(name, details = {}) {
    return update(state => {
      state.events.unshift({name,contact:state.contact,at:new Date().toISOString(),...details});
      state.events = state.events.slice(0,300);
    });
  }
  window.Brasa = {rows,groups,read,update,record,key};
})();
