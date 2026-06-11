import type { Market } from "./locale";

export type StaticPageKind = "privacy" | "terms" | "contact" | "status";

export type StaticPageContent = {
  title: string;
  sections: { heading?: string; body: string }[];
};

const CONTENT: Record<Market, Record<StaticPageKind, StaticPageContent>> = {
  br: {
    privacy: {
      title: "Política de Privacidade",
      sections: [
        {
          body: "Última atualização: 11 de junho de 2026. Esta Política descreve como a Trackion coleta, usa, armazena e protege seus dados pessoais, em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018).",
        },
        {
          heading: "1. Controlador dos dados",
          body: "O controlador dos dados pessoais tratados nesta plataforma é o desenvolvedor independente titular da Trackion, operando o serviço em trackion.app e app.trackion.app. Para assuntos de privacidade e LGPD: dpo@trackion.app.",
        },
        {
          heading: "2. Dados que coletamos",
          body: "2.1. Dados de cadastro: nome, e-mail, senha (armazenada apenas em formato hash), idioma preferido e data de aceite dos Termos e desta Política.\n\n2.2. Dados de uso: logs de acesso, dispositivo, IP, páginas visitadas, preferências de onboarding e interações com funcionalidades do app.\n\n2.3. Dados de trading: operações importadas manualmente ou via API read-only (símbolo, preço, quantidade, data, PnL, taxas, exchange de origem, notas e tags que você adiciona).\n\n2.4. Dados de assinatura: plano contratado, status de pagamento, identificadores de cliente Stripe (não armazenamos número completo de cartão — o Stripe processa pagamentos diretamente).\n\n2.5. Dados de afiliados/parceiros: código de referência ou cupom, quando aplicável no cadastro.",
        },
        {
          heading: "3. Como usamos seus dados",
          body: "Utilizamos os dados para: (a) criar e gerenciar sua conta; (b) sincronizar e exibir seu histórico de trades; (c) gerar dashboards, relatórios e métricas de performance; (d) processar trial, assinaturas e cobranças; (e) enviar e-mails transacionais (confirmação, acesso, alertas de conta); (f) prevenir fraudes e abusos; (g) cumprir obrigações legais; (h) melhorar o produto com base em uso agregado e anonimizado.",
        },
        {
          heading: "4. Bases legais (LGPD)",
          body: "O tratamento se fundamenta em: execução de contrato (prestação do serviço SaaS); consentimento (cadastro, comunicações opcionais e integrações que você autoriza); legítimo interesse (segurança, melhoria do serviço e prevenção de fraudes, sempre respeitando seus direitos); e cumprimento de obrigação legal ou regulatória quando aplicável.",
        },
        {
          heading: "5. Integração via API (exchanges)",
          body: "Se você conecta exchanges, utilizamos chaves de API com permissão de leitura para importar dados de execução. Não solicitamos, armazenamos ou utilizamos permissões de saque, transferência ou execução de ordens. As chaves são armazenadas com criptografia e você pode revogá-las na exchange ou remover a conexão no app a qualquer momento.",
        },
        {
          heading: "6. Compartilhamento com terceiros",
          body: "Compartilhamos dados apenas com provedores essenciais à operação do serviço, sob contratos que exigem proteção adequada:\n\n• Stripe — processamento de pagamentos e gestão de assinaturas.\n• Resend (ou provedor de e-mail equivalente) — envio de e-mails transacionais.\n• Hospedagem e infraestrutura em nuvem — armazenamento e execução da plataforma.\n• FirstPromoter (quando aplicável) — atribuição de afiliados.\n\nNão vendemos seus dados pessoais. Não compartilhamos dados de trading com corretoras, exchanges ou terceiros para fins de marketing.",
        },
        {
          heading: "7. Retenção e eliminação",
          body: "Mantemos seus dados enquanto sua conta estiver ativa ou conforme necessário para prestar o serviço. Após cancelamento, você pode exportar dados de trading por 30 dias; depois desse prazo, os dados podem ser eliminados permanentemente dos servidores, salvo obrigação legal de retenção (ex.: registros financeiros). Logs de segurança podem ser mantidos por período limitado para auditoria.",
        },
        {
          heading: "8. Segurança",
          body: "Adotamos medidas técnicas e organizacionais como: senhas com hash bcrypt, comunicação HTTPS, controle de acesso por conta, criptografia de credenciais de API, rate limiting em endpoints sensíveis e backups periódicos. Nenhum sistema é 100% seguro; em caso de incidente relevante, notificaremos você e a ANPD quando exigido por lei.",
        },
        {
          heading: "9. Cookies e tecnologias similares",
          body: "Utilizamos cookies e armazenamento local essenciais para manter sua sessão autenticada, preferências de idioma e segurança. Não utilizamos cookies de publicidade de terceiros. Você pode limpar cookies no navegador, mas isso pode exigir novo login.",
        },
        {
          heading: "10. Transferência internacional",
          body: "Alguns provedores (Stripe, Resend, infraestrutura em nuvem) podem processar dados fora do Brasil. Nesses casos, exigimos cláusulas contratuais e medidas de proteção compatíveis com a LGPD.",
        },
        {
          heading: "11. Seus direitos (LGPD)",
          body: "Você pode solicitar: confirmação de tratamento; acesso aos dados; correção de dados incompletos ou desatualizados; anonimização, bloqueio ou eliminação de dados desnecessários; portabilidade; informação sobre compartilhamentos; revogação de consentimento; e oposição a tratamentos baseados em legítimo interesse, quando aplicável.\n\nEnvie solicitações a dpo@trackion.app. Responderemos em prazo razoável, conforme a LGPD. Você também pode registrar reclamação à Autoridade Nacional de Proteção de Dados (ANPD).",
        },
        {
          heading: "12. Menores de idade",
          body: "O Trackion não é destinado a menores de 18 anos. Não coletamos intencionalmente dados de menores. Se identificarmos cadastro de menor, a conta será encerrada e os dados eliminados.",
        },
        {
          heading: "13. Alterações nesta Política",
          body: "Podemos atualizar esta Política para refletir mudanças legais ou no serviço. Notificaremos por e-mail ou aviso no app. O uso continuado após a atualização implica aceite da nova versão.",
        },
        {
          heading: "14. Contato",
          body: "Encarregado de Proteção de Dados (DPO): dpo@trackion.app\nSuporte geral: support@trackion.app\n\nSão Paulo/SP, Brasil — 11 de junho de 2026.",
        },
      ],
    },
    terms: {
      title: "Termos e Condições de Uso",
      sections: [
        {
          body: "Plataforma de Análise e Gestão de Dados de Trading — 11 de junho de 2026.",
        },
        {
          heading: "1. Definições e Partes",
          body: "Estes Termos e Condições de Uso (\"Termos\") regem a utilização da plataforma Trackion, um software como serviço (SaaS) destinado à análise de dados de trading. De um lado, o DESENVOLVEDOR, pessoa física independente e titular dos direitos de propriedade intelectual da plataforma, e de outro, o USUÁRIO, pessoa física ou jurídica que acessa e utiliza as funcionalidades da ferramenta.",
        },
        {
          heading: "2. Aceitação dos Termos",
          body: "2.1. Ao realizar o cadastro e utilizar a Trackion, o Usuário declara ter lido, compreendido e aceitado integralmente estes Termos. Caso não concorde com qualquer disposição, o Usuário deve abster-se de utilizar a plataforma.\n\n2.2. O Usuário declara ser maior de 18 (dezoito) anos e possuir plena capacidade civil para contratar os serviços oferecidos.\n\n2.3. Caráter Profissional: O Usuário declara e garante que utiliza a Plataforma Trackion como ferramenta de apoio ao exercício de sua atividade profissional, comercial ou de gestão de investimentos próprios com fins econômicos, não se caracterizando como destinatário final fático ou econômico do serviço para fins de aplicação do Código de Defesa do Consumidor.",
        },
        {
          heading: "3. Acesso e Cadastro",
          body: "3.1. Para utilizar as funcionalidades da Trackion, o Usuário deverá realizar um cadastro fornecendo informações verídicas e atualizadas. O acesso é pessoal e intransferível, sendo o Usuário o único responsável pela guarda e sigilo de suas credenciais de acesso.\n\n3.2. O Desenvolvedor reserva-se o direito de suspender ou cancelar contas que apresentem informações falsas ou que sejam utilizadas em violação a estes Termos.",
        },
        {
          heading: "4. Isenção de Responsabilidade Financeira e de Investimento",
          body: "4.1. Natureza da Ferramenta: A Trackion é uma ferramenta estritamente analítica e técnica. O Desenvolvedor não presta serviços de assessoria de investimentos, consultoria financeira, gestão de carteiras ou intermediação de valores mobiliários.\n\n4.2. Decisões de Investimento: Todas as decisões de compra, venda ou manutenção de ativos financeiros são de responsabilidade exclusiva e soberana do Usuário. O Desenvolvedor não se responsabiliza por quaisquer perdas, danos, lucros cessantes ou prejuízos financeiros decorrentes das operações realizadas pelo Usuário, ainda que baseadas em dados ou indicadores visualizados na plataforma.\n\n4.3. Ausência de Garantia de Ganhos: O desempenho passado de qualquer estratégia ou ativo não é garantia de resultados futuros. A Trackion não promete, em hipótese alguma, rentabilidade ou sucesso financeiro.",
        },
        {
          heading: "5. Funcionalidades e Importação de Dados",
          body: "5.1. A plataforma permite a importação de arquivos de histórico de operações, geração de dashboards estatísticos e visualização de indicadores técnicos.\n\n5.2. O Usuário é o único responsável pela integridade e veracidade dos dados importados. O Desenvolvedor não realiza auditoria sobre os dados fornecidos pelo Usuário ou por terceiros.",
        },
        {
          heading: "6. Integração via API",
          body: "6.1. Caso o Usuário utilize chaves de API para integração com corretoras ou exchanges, este declara estar ciente de que o Desenvolvedor não tem acesso às senhas de saque ou movimentação de fundos, limitando-se a plataforma à leitura de dados de execução.\n\n6.2. É dever do Usuário configurar corretamente as permissões de suas chaves de API, recomendando-se a ativação exclusiva da permissão de \"Leitura\" (Read-only).",
        },
        {
          heading: "7. Propriedade Intelectual",
          body: "7.1. Todos os direitos de propriedade intelectual sobre a plataforma Trackion, incluindo código-fonte, design, logotipos, algoritmos e textos, pertencem exclusivamente ao Desenvolvedor.\n\n7.2. O Usuário recebe uma licença de uso limitada, revogável, não exclusiva e intransferível, válida apenas durante o período de vigência de sua assinatura.",
        },
        {
          heading: "8. Modelo Freemium, Pagamento e Reajuste",
          body: "8.1. A Trackion opera em modelo freemium, oferecendo um período de teste gratuito (Trial) de 14 (quatorze) dias.\n\n8.2. Após o período de teste, a continuidade do uso das funcionalidades premium dependerá da contratação de um Plano Pago.\n\n8.3. O Usuário tem o direito de arrependimento e reembolso integral em até 7 (sete) dias após a primeira contratação de um Plano Pago.\n\n8.4. O atraso no pagamento superior a 5 (cinco) dias implicará na suspensão do acesso às funcionalidades premium. Após 30 (trinta) dias de inadimplência, a conta poderá ser bloqueada.\n\n8.5. Reajuste de Preços: Os valores dos Planos Pagos poderão ser reajustados anualmente, ou na menor periodicidade permitida por lei, com base na variação acumulada do IPCA/IBGE (Índice Nacional de Preços ao Consumidor Amplo) do período ou, na sua falta, por outro índice oficial que o substitua, mediante comunicação prévia ao Usuário com antecedência mínima de 30 (trinta) dias.",
        },
        {
          heading: "9. Privacidade e Proteção de Dados (LGPD)",
          body: "9.1. O Desenvolvedor coleta e trata dados pessoais estritamente necessários para a prestação do serviço, conforme detalhado na Política de Privacidade.\n\n9.2. O Usuário poderá exercer seus direitos de acesso, retificação e exclusão de dados através do contato com o Encarregado de Proteção de Dados (DPO) pelo e-mail: dpo@trackion.app.",
        },
        {
          heading: "10. Obrigações e Proibições",
          body: "10.1. O Usuário compromete-se a não utilizar a plataforma para fins ilícitos, não realizar engenharia reversa, não utilizar robôs de extração de dados (scraping) e não compartilhar sua conta com terceiros.",
        },
        {
          heading: "11. Limitação de Responsabilidade",
          body: "11.1. O Desenvolvedor não garante que a plataforma estará disponível de forma ininterrupta ou livre de erros técnicos. Manutenções preventivas ou corretivas podem ocorrer.\n\n11.2. Em nenhuma circunstância a responsabilidade total do Desenvolvedor perante o Usuário por danos diretos excederá o valor total pago pelo Usuário nos últimos 12 (doze) meses ou o montante fixo de R$ 1.000,00 (mil reais), o que for menor.",
        },
        {
          heading: "12. Suspensão e Rescisão",
          body: "12.1. O Usuário poderá cancelar sua assinatura a qualquer momento através das configurações da plataforma, mantendo o acesso até o fim do período já pago.\n\n12.2. O Desenvolvedor poderá rescindir este contrato em caso de violação destes Termos ou por descontinuidade da plataforma, mediante aviso prévio de 30 (trinta) dias.",
        },
        {
          heading: "13. Exportação de Dados",
          body: "13.1. Em caso de cancelamento ou encerramento da conta, o Usuário terá o prazo de 30 (trinta) dias corridos para exportar seus dados de trading através das ferramentas disponíveis na plataforma. Após este prazo, os dados poderão ser excluídos permanentemente dos servidores.",
        },
        {
          heading: "14. Modificações nos Termos",
          body: "14.1. O Desenvolvedor poderá alterar estes Termos a qualquer momento para refletir melhorias ou mudanças legais. O Usuário será notificado por e-mail ou aviso na plataforma. A continuidade do uso após a alteração implica aceitação da nova versão.",
        },
        {
          heading: "15. Foro e Legislação Aplicável",
          body: "15.1. Estes Termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o Foro Central da Comarca de São Paulo/SP para dirimir quaisquer controvérsias oriundas deste documento, com renúncia expressa a qualquer outro.",
        },
        {
          heading: "16. Contato e Suporte",
          body: "16.1. Para suporte técnico ou dúvidas sobre estes Termos, o Usuário deverá entrar em contato através do canal oficial de atendimento disponível no site ou pelo e-mail do Encarregado de Dados: dpo@trackion.app.\n\nLocal e data: São Paulo/SP, 11 de junho de 2026.\n\nTRACKION — DESENVOLVEDOR INDEPENDENTE.\n\nDocumento elaborado em 11 de junho de 2026. As informações contidas são de responsabilidade do solicitante.",
        },
      ],
    },
    contact: {
      title: "Contato",
      sections: [
        {
          body: "Suporte e dúvidas gerais:",
        },
        {
          body: "E-mail: support@trackion.app",
        },
        {
          body: "Respondemos em dias úteis, normalmente em até 48 horas.",
        },
      ],
    },
    status: {
      title: "Status do serviço",
      sections: [
        {
          body: "● Todos os sistemas operacionais",
        },
        {
          heading: "App web",
          body: "Online — trackion.app",
        },
        {
          heading: "Sync de exchanges",
          body: "MEXC, Binance e Bitget: operacionais. Bybit e OKX: em desenvolvimento (Q1 2026).",
        },
      ],
    },
  },
  us: {
    privacy: {
      title: "Privacy Policy",
      sections: [
        {
          body: "Last updated: June 11, 2026. This Policy describes how Trackion collects, uses, stores, and protects your personal data.",
        },
        {
          heading: "1. Data controller",
          body: "The data controller is the independent developer operating Trackion at trackion.app and app.trackion.app. Privacy and data protection inquiries: dpo@trackion.app.",
        },
        {
          heading: "2. Data we collect",
          body: "2.1. Registration: name, email, password (stored as hash only), language preference, and date of acceptance of Terms and this Policy.\n\n2.2. Usage data: access logs, device, IP, pages visited, onboarding preferences, and feature interactions.\n\n2.3. Trading data: trades imported manually or via read-only API (symbol, price, quantity, date, PnL, fees, source exchange, notes and tags you add).\n\n2.4. Subscription data: plan, payment status, Stripe customer identifiers (we do not store full card numbers — Stripe processes payments directly).\n\n2.5. Affiliate data: referral code or coupon when applicable at signup.",
        },
        {
          heading: "3. How we use your data",
          body: "We use data to: (a) create and manage your account; (b) sync and display your trade history; (c) generate dashboards, reports, and performance metrics; (d) process trials, subscriptions, and billing; (e) send transactional emails; (f) prevent fraud and abuse; (g) comply with legal obligations; (h) improve the product using aggregated, anonymized usage data.",
        },
        {
          heading: "4. Legal bases",
          body: "Processing is based on: contract performance (SaaS service); consent (signup, optional communications, integrations you authorize); legitimate interest (security, service improvement, fraud prevention); and legal obligation when applicable.",
        },
        {
          heading: "5. API integration (exchanges)",
          body: "If you connect exchanges, we use read-only API keys to import execution data. We do not request, store, or use withdrawal, transfer, or order execution permissions. Keys are stored encrypted and you can revoke them on the exchange or remove the connection in the app at any time.",
        },
        {
          heading: "6. Sharing with third parties",
          body: "We share data only with essential service providers under appropriate protection:\n\n• Stripe — payment processing and subscription management.\n• Resend (or equivalent email provider) — transactional email.\n• Cloud hosting — storage and platform operation.\n• FirstPromoter (when applicable) — affiliate attribution.\n\nWe do not sell your personal data. We do not share trading data with brokers, exchanges, or third parties for marketing.",
        },
        {
          heading: "7. Retention and deletion",
          body: "We retain your data while your account is active or as needed to provide the service. After cancellation, you may export trading data for 30 days; after that period, data may be permanently deleted from servers, except where legal retention applies. Security logs may be kept for a limited audit period.",
        },
        {
          heading: "8. Security",
          body: "We use bcrypt password hashing, HTTPS, per-account access control, encrypted API credentials, rate limiting on sensitive endpoints, and periodic backups. No system is 100% secure; if a relevant incident occurs, we will notify you and authorities when required by law.",
        },
        {
          heading: "9. Cookies",
          body: "We use essential cookies and local storage for authenticated sessions, language preferences, and security. We do not use third-party advertising cookies. Clearing cookies may require signing in again.",
        },
        {
          heading: "10. International transfers",
          body: "Some providers (Stripe, Resend, cloud infrastructure) may process data outside your country. We require contractual clauses and safeguards consistent with applicable data protection law.",
        },
        {
          heading: "11. Your rights",
          body: "You may request: confirmation of processing; access; correction; anonymization, blocking, or deletion of unnecessary data; portability; information on sharing; withdrawal of consent; and objection to legitimate-interest processing where applicable.\n\nContact dpo@trackion.app. We will respond within a reasonable timeframe. You may also lodge a complaint with your data protection authority.",
        },
        {
          heading: "12. Minors",
          body: "Trackion is not intended for users under 18. We do not knowingly collect data from minors. If we identify a minor's account, it will be terminated and data deleted.",
        },
        {
          heading: "13. Changes to this Policy",
          body: "We may update this Policy for legal or service changes. We will notify you by email or in-app notice. Continued use after updates implies acceptance.",
        },
        {
          heading: "14. Contact",
          body: "Data Protection Officer: dpo@trackion.app\nGeneral support: support@trackion.app\n\nSão Paulo/SP, Brazil — June 11, 2026.",
        },
      ],
    },
    terms: {
      title: "Terms and Conditions of Use",
      sections: [
        {
          body: "Trading Data Analysis and Management Platform — June 11, 2026.",
        },
        {
          heading: "1. Definitions and Parties",
          body: "These Terms and Conditions of Use (\"Terms\") govern the use of the Trackion platform, a software-as-a-service (SaaS) tool for trading data analysis. On one side, the DEVELOPER, an independent individual and holder of the platform's intellectual property rights, and on the other, the USER, an individual or legal entity that accesses and uses the tool's features.",
        },
        {
          heading: "2. Acceptance of Terms",
          body: "2.1. By registering and using Trackion, the User declares that they have read, understood, and fully accepted these Terms. If the User disagrees with any provision, they must refrain from using the platform.\n\n2.2. The User declares that they are at least 18 (eighteen) years old and have full legal capacity to contract the services offered.\n\n2.3. Professional Use: The User declares and guarantees that they use the Trackion Platform as a support tool for their professional, commercial activity or management of their own investments for economic purposes, and does not qualify as the final factual or economic recipient of the service for purposes of consumer protection law.",
        },
        {
          heading: "3. Access and Registration",
          body: "3.1. To use Trackion's features, the User must register by providing truthful and up-to-date information. Access is personal and non-transferable, and the User is solely responsible for safeguarding their login credentials.\n\n3.2. The Developer reserves the right to suspend or cancel accounts that contain false information or are used in violation of these Terms.",
        },
        {
          heading: "4. Financial and Investment Liability Disclaimer",
          body: "4.1. Nature of the Tool: Trackion is a strictly analytical and technical tool. The Developer does not provide investment advisory, financial consulting, portfolio management, or securities brokerage services.\n\n4.2. Investment Decisions: All decisions to buy, sell, or hold financial assets are the sole and exclusive responsibility of the User. The Developer is not liable for any losses, damages, lost profits, or financial harm arising from operations performed by the User, even if based on data or indicators displayed on the platform.\n\n4.3. No Guarantee of Profits: Past performance of any strategy or asset is not a guarantee of future results. Trackion does not promise, under any circumstances, profitability or financial success.",
        },
        {
          heading: "5. Features and Data Import",
          body: "5.1. The platform allows import of trade history files, generation of statistical dashboards, and visualization of technical indicators.\n\n5.2. The User is solely responsible for the integrity and accuracy of imported data. The Developer does not audit data provided by the User or third parties.",
        },
        {
          heading: "6. API Integration",
          body: "6.1. If the User uses API keys to integrate with brokers or exchanges, they acknowledge that the Developer has no access to withdrawal passwords or fund movement credentials; the platform is limited to reading execution data.\n\n6.2. It is the User's duty to correctly configure API key permissions, with exclusive \"Read-only\" permission recommended.",
        },
        {
          heading: "7. Intellectual Property",
          body: "7.1. All intellectual property rights over the Trackion platform, including source code, design, logos, algorithms, and text, belong exclusively to the Developer.\n\n7.2. The User receives a limited, revocable, non-exclusive, and non-transferable license to use, valid only during the subscription period.",
        },
        {
          heading: "8. Freemium Model, Payment, and Price Adjustment",
          body: "8.1. Trackion operates on a freemium model, offering a 14 (fourteen) day free trial period.\n\n8.2. After the trial period, continued use of premium features depends on subscribing to a Paid Plan.\n\n8.3. The User has the right to withdraw and receive a full refund within 7 (seven) days after the first Paid Plan subscription.\n\n8.4. Payment delay exceeding 5 (five) days will result in suspension of access to premium features. After 30 (thirty) days of default, the account may be blocked.\n\n8.5. Price Adjustments: Paid Plan prices may be adjusted annually, or at the minimum frequency permitted by law, based on the accumulated variation of Brazil's IPCA/IBGE index for the period or, if unavailable, another official index that replaces it, with prior notice to the User at least 30 (thirty) days in advance.",
        },
        {
          heading: "9. Privacy and Data Protection",
          body: "9.1. The Developer collects and processes personal data strictly necessary to provide the service, as detailed in the Privacy Policy.\n\n9.2. The User may exercise rights of access, rectification, and deletion of data by contacting the Data Protection Officer (DPO) at: dpo@trackion.app.",
        },
        {
          heading: "10. Obligations and Prohibitions",
          body: "10.1. The User agrees not to use the platform for unlawful purposes, not to reverse engineer, not to use data extraction bots (scraping), and not to share their account with third parties.",
        },
        {
          heading: "11. Limitation of Liability",
          body: "11.1. The Developer does not guarantee that the platform will be available uninterrupted or free of technical errors. Preventive or corrective maintenance may occur.\n\n11.2. Under no circumstances shall the Developer's total liability to the User for direct damages exceed the total amount paid by the User in the last 12 (twelve) months or the fixed amount of R$ 1,000.00 (one thousand reais), whichever is lower.",
        },
        {
          heading: "12. Suspension and Termination",
          body: "12.1. The User may cancel their subscription at any time through the platform settings, retaining access until the end of the already paid period.\n\n12.2. The Developer may terminate this agreement in case of violation of these Terms or discontinuation of the platform, with 30 (thirty) days prior notice.",
        },
        {
          heading: "13. Data Export",
          body: "13.1. Upon account cancellation or termination, the User will have 30 (thirty) calendar days to export their trading data through the tools available on the platform. After this period, data may be permanently deleted from servers.",
        },
        {
          heading: "14. Changes to Terms",
          body: "14.1. The Developer may change these Terms at any time to reflect improvements or legal changes. The User will be notified by email or platform notice. Continued use after the change implies acceptance of the new version.",
        },
        {
          heading: "15. Jurisdiction and Applicable Law",
          body: "15.1. These Terms are governed by the laws of Brazil. The Central Court of the District of São Paulo/SP is elected to resolve any disputes arising from this document, with express waiver of any other.",
        },
        {
          heading: "16. Contact and Support",
          body: "16.1. For technical support or questions about these Terms, the User should contact the official support channel available on the website or the Data Officer email: dpo@trackion.app.\n\nPlace and date: São Paulo/SP, June 11, 2026.\n\nTRACKION — INDEPENDENT DEVELOPER.\n\nDocument prepared on June 11, 2026.",
        },
      ],
    },
    contact: {
      title: "Contact",
      sections: [
        {
          body: "Support and general inquiries:",
        },
        {
          body: "Email: support@trackion.app",
        },
        {
          body: "We respond on business days, typically within 48 hours.",
        },
      ],
    },
    status: {
      title: "Service status",
      sections: [
        {
          body: "● All systems operational",
        },
        {
          heading: "Web app",
          body: "Online — trackion.app",
        },
        {
          heading: "Exchange sync",
          body: "MEXC, Binance and Bitget: operational. Bybit and OKX: in development (Q1 2026).",
        },
      ],
    },
  },
};

export function getStaticPageContent(market: Market, kind: StaticPageKind): StaticPageContent {
  return CONTENT[market][kind];
}

export function resolveStaticPage(pathname: string): StaticPageKind | null {
  const p = pathname.replace(/\/$/, "").toLowerCase();
  const map: Record<string, StaticPageKind> = {
    "/privacidade": "privacy",
    "/privacy": "privacy",
    "/termos": "terms",
    "/terms": "terms",
    "/contato": "contact",
    "/contact": "contact",
    "/status": "status",
  };
  return map[p] ?? null;
}
