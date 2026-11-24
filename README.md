# Brasa Alta

E-commerce demonstrativo de restaurante focado em hambúrgueres artesanais. Todo o conteúdo está em português do Brasil e o site funciona localmente, sem backend.

## Como executar

No PowerShell, dentro desta pasta:

```powershell
.\start.ps1
```

Depois acesse `http://localhost:4173` no navegador.

O projeto usa Node.js e dispensa instalação de pacotes. Também é possível executar `node server.mjs` nesta pasta. Use sempre o mesmo endereço no navegador para que loja, Studio e console compartilhem os mesmos dados.

## Demonstração de engajamento

- **Engagement Studio** (`/operations.html`). Vincule um perfil, habilite o push simulado e dispare um momento do cliente. Consulte a caixa local no Studio ou no botão **Mensagens** da loja.
- **Experiências na loja**. Use os links do Studio para abrir as 37 prévias. Ao navegar pela loja normalmente, a oferta de entrada, as recomendações, a campanha A/B e os avisos de carrinho e rolagem aparecem conforme a interação.
- **Verification Console** (`/verify/index.html`). Consulta os endpoints locais por GET e mostra os registros do navegador. Abra pelo servidor Node.js para executar as verificações.
- **Pedidos**. O carrinho aceita o cupom BRASA10 obtido nas campanhas e simula a finalização com entrega ou retirada. Os dados ficam no navegador. Dengage, e-mail, push remoto e pagamentos não estão configurados.

## Recursos

- catálogo filtrável por categoria;
- busca por nome e descrição;
- carrinho lateral com quantidades e subtotal;
- persistência do carrinho no navegador;
- layout responsivo para desktop e celular;
- imagens autorais geradas para o projeto.
