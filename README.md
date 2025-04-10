# Bitwarden Vault Analyzer

![Bitwarden Vault Analyzer Logo](/public/favicon-32x32.png)

## 📋 Sobre o Projeto

O **Bitwarden Vault Analyzer** é uma ferramenta web para análise detalhada de exportações do gerenciador de senhas Bitwarden. A aplicação processa o arquivo JSON exportado do Bitwarden e gera análises detalhadas sobre a segurança das suas senhas e contas.

O aplicativo é projetado para funcionar inteiramente no navegador, garantindo que seus dados sensíveis não sejam enviados para servidores externos.

## ✨ Principais Funcionalidades

- **Análise de Força de Senhas**: Avaliação completa da força das senhas usando a biblioteca zxcvbn.
- **Detecção de Vazamentos**: Verificação de senhas em bases de dados de vazamentos (via Have I Been Pwned).
- **Identificação de Senhas Duplicadas**: Localiza senhas reutilizadas em diferentes contas.
- **Análise de Domínios**: Mapeamento de distribuição de contas por domínios.
- **Visualização em Gráficos**: Inclui gráficos de distribuição de força de senhas e nuvem de palavras.
- **Rastreamento de Idade das Senhas**: Identifica senhas que precisam ser atualizadas.
- **Suporte à 2FA**: Identifica contas que possuem ou não autenticação de dois fatores configurada.

## 🚀 Como Usar

1. **Exportar seus dados do Bitwarden**:

   - Faça login na sua conta Bitwarden.
   - Vá para "Ferramentas" > "Exportar Dados".
   - Escolha o formato JSON e exporte seu cofre.

2. **Utilizar o Bitwarden Vault Analyzer**:
   - Acesse a aplicação no navegador.
   - Faça upload do arquivo JSON exportado.
   - Aguarde a análise completa.
   - Navegue pelos diferentes painéis de análise.

## 🛠️ Tecnologias Utilizadas

- [Next.js 15](https://nextjs.org/) - Framework React com SSR.
- [React 19](https://react.dev/) - Biblioteca para interfaces.
- [TypeScript](https://www.typescriptlang.org/) - Tipagem estática.
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS.
- [Shadcn/ui](https://ui.shadcn.com/) - Componentes UI reutilizáveis.
- [Recharts](https://recharts.org/) - Biblioteca de visualização de dados.
- [Plotly.js](https://plotly.com/javascript/) - Gráficos interativos.
- [React WordCloud](https://github.com/chrisrzhou/react-wordcloud) - Nuvem de palavras.
- [zxcvbn](https://github.com/dropbox/zxcvbn) - Análise de força de senhas.
- [Jest](https://jestjs.io/) - Framework de testes.

## 🔒 Segurança e Privacidade

- **Processamento Local**: Todos os dados são processados localmente no navegador.
- **Sem Armazenamento**: Nenhum dado é armazenado permanentemente.
- **Consultas Seguras ao HIBP**: Verificações de vazamentos usam a API k-anonimity do Have I Been Pwned.
- **Código Aberto**: Você pode auditar o código para verificar a segurança.

## 🧩 Estrutura do Projeto

```bash
my-vault-analyzer/
├── src/
│   ├── app/              # Rotas e páginas da aplicação.
│   ├── components/       # Componentes React reutilizáveis.
│   │   ├── charts/       # Componentes de visualização/gráficos.
│   │   ├── layout/       # Componentes estruturais da UI.
│   │   └── ui/           # Componentes UI básicos (shadcn/ui).
│   ├── lib/              # Utilitários e lógica de negócios.
│   │   ├── analysis.ts   # Análise de senhas e dados do cofre.
│   │   ├── domainUtils.ts # Utilitários para processamento de domínios.
│   │   ├── hibpService.ts # Integração com Have I Been Pwned.
│   │   └── types.ts      # Tipos e interfaces TypeScript.
│   └── providers/        # Contextos React e provedores de estado.
├── public/               # Ativos estáticos.
└── __tests__/            # Testes unitários e de integração.
```

## 📊 Métricas de Segurança Analisadas

- **Força da Senha**: Baseada em análise heurística e criptográfica.
- **Tempo Estimado para Quebra**: Estimativa de tempo necessário para quebrar a senha por força bruta.
- **Vazamentos Conhecidos**: Número de ocorrências em vazamentos conhecidos.
- **Duplicação**: Identificação de senhas reutilizadas em diferentes contas.
- **Idade da Senha**: Tempo desde a última atualização.
- **Proteção 2FA**: Presença de autenticação de dois fatores.

## 💻 Desenvolvimento

### Pré-requisitos

- Node.js 18+.
- npm ou yarn.

### Configuração Local

```bash
# Clone o repositório
git clone https://github.com/bernardopg/vault_analyzer

# Instale as dependências
cd my-vault-analyzer
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

### Comandos Disponíveis

- `npm run dev` - Iniciar servidor de desenvolvimento.
- `npm run build` - Construir para produção.
- `npm run start` - Iniciar versão de produção.
- `npm run lint` - Executar linter.
- `npm run test` - Executar testes.
- `npm run test:coverage` - Executar testes com cobertura.

## 🤝 Contribuição

Contribuições são bem-vindas! Siga os passos abaixo para contribuir:

1. Faça um fork do projeto.
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`).
3. Commit suas alterações (`git commit -m 'Adiciona nova feature'`).
4. Envie para a branch principal (`git push origin feature/nova-feature`).
5. Abra um Pull Request.

## 📫 Contato

Se tiver dúvidas ou sugestões, entre em contato:

- **Email**: bernardo.gomes@bebitterbebetter.com.br
- **GitHub Issues**: [Issues](https://github.com/bernardopg/vault_analyzer/issues)

## 📄 Licença

Este projeto está licenciado sob a [Licença MIT](LICENSE) - veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🙏 Agradecimentos

- Ao projeto Bitwarden por fornecer um gerenciador de senhas open-source excelente.
- Ao serviço Have I Been Pwned por sua API pública para verificação de vazamentos.
