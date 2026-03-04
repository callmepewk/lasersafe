LaserSafe

Ambiente: https://lasersafe.base44.app

Versão: 1.0
Data: 03/03/2026
Classificação: Interno / Público 

Responsável Técnico (CTO): Pedro Henrique Brezolin de Freitas

1. OBJETIVO

Estabelecer diretrizes técnicas, administrativas e operacionais para garantir:

Confidencialidade

Integridade

Disponibilidade

Autenticidade

Rastreabilidade

Das informações, sistemas e ativos digitais da plataforma LaserSafe, assegurando conformidade com:

Lei Geral de Proteção de Dados Pessoais

Marco Civil da Internet (Lei 12.965/2014)

Diretrizes do National Institute of Standards and Technology (NIST SP 800-207 / SP 800-53)

Boas práticas da ISO 27001/27002

2. ESCOPO

Esta política aplica-se a:

Web Application (Frontend)

APIs e Backend

Banco de Dados

Infraestrutura em cloud (Base44 e integrações externas)

Repositórios de código

Ambientes de desenvolvimento, staging e produção

Serviços de terceiros integrados

3. MODELO DE SEGURANÇA ADOTADO
3.1 Zero Trust Architecture

A LaserSafe adota princípios de Zero Trust:

Nenhum usuário ou sistema é confiável por padrão

Toda requisição é validada continuamente

Acesso concedido sob menor privilégio

Sessões são temporárias, auditáveis e revogáveis

3.2 Princípios Fundamentais

Security by Design

Privacy by Design

Least Privilege

Segregação de ambientes

Defesa em profundidade

Minimização de dados

4. ARQUITETURA DE SEGURANÇA
4.1 Infraestrutura

HTTPS obrigatório (TLS 1.2+)

Certificado SSL válido

WAF ativo

Proteção contra DDoS

Firewall com portas mínimas abertas

Isolamento lógico entre frontend, backend e banco de dados

Monitoramento contínuo de tráfego

4.2 Segurança de Aplicação

Proteções implementadas contra:

SQL Injection

Cross-Site Scripting (XSS)

Cross-Site Request Forgery (CSRF)

Clickjacking

Injeção de comandos

Escalada de privilégio

Enumeração de usuários

4.3 Headers de Segurança

Devem estar ativos:

Content-Security-Policy

X-Frame-Options: DENY

X-Content-Type-Options: nosniff

Referrer-Policy: strict-origin

Permissions-Policy

5. CONTROLE DE ACESSO
5.1 Autenticação

Autenticação baseada em token (JWT ou equivalente)

Expiração curta de sessão

Refresh token protegido

MFA obrigatório para administradores

Bloqueio após múltiplas tentativas inválidas

5.2 Autorização

Modelo RBAC:

Usuário

Profissional / Clínica

Administrador

Aplicação rigorosa do princípio do menor privilégio.

6. PROTEÇÃO DE DADOS

Caso a LaserSafe armazene dados técnicos, profissionais ou operacionais relacionados a equipamentos a laser:

6.1 Dados Potencialmente Coletados

Nome

E-mail

Telefone

Informações profissionais

Dados técnicos operacionais (quando aplicável)

IP e logs técnicos

6.2 Criptografia

Criptografia em trânsito (TLS)

Criptografia em repouso para dados sensíveis

Senhas armazenadas com hash seguro (bcrypt ou equivalente)

Tokens assinados digitalmente

7. LOGS E MONITORAMENTO

Registro de tentativas de login

Registro de alterações administrativas

Logs de acesso a dados sensíveis

Monitoramento de comportamento anômalo

Retenção mínima de logs: 6 meses

Alertas automáticos para atividades suspeitas

8. BACKUP E CONTINUIDADE DE NEGÓCIO

Backup automático diário

Retenção mínima de 30 dias

Backup criptografado

Testes periódicos de restauração

RTO máximo: 4 horas

RPO máximo: 24 horas

9. SEGURANÇA NO CICLO DE DESENVOLVIMENTO (Secure SDLC)

Versionamento via Git

Code review obrigatório

Auditoria de dependências (npm audit ou equivalente)

Separação entre ambientes dev / staging / produção

Testes de segurança antes de deploy

Atualizações periódicas de dependências críticas

10. GESTÃO DE INCIDENTES
10.1 Classificação

Baixo impacto

Médio impacto

Alto impacto (ex: vazamento de dados ou indisponibilidade crítica)

10.2 Procedimento

Identificação

Contenção

Erradicação

Recuperação

Análise pós-incidente

Notificação à autoridade competente quando exigido pela LGPD

Tempo máximo de resposta inicial: 72 horas.

11. GESTÃO DE TERCEIROS

Todos os serviços integrados devem:

Garantir criptografia

Cumprir LGPD

Possuir política de segurança documentada

Não compartilhar dados sem autorização formal

12. POLÍTICA DE VULNERABILIDADES

Relatórios devem ser enviados para:

security@portofirmedigital.com.br

Devem conter:

Descrição técnica

Evidências

Passos de reprodução

Avaliação de impacto

Prazo de correção:

Crítica: até 7 dias

Alta: até 15 dias

Média: até 30 dias

13. CONFORMIDADE E RESPONSABILIDADE

A LaserSafe compromete-se a:

Garantir direitos do titular de dados

Permitir acesso, correção e exclusão de dados

Garantir transparência no tratamento de informações

Não realizar decisões automatizadas com impacto jurídico sem revisão humana

14. AUDITORIA E REVISÃO

Revisão anual desta política

Auditoria interna semestral

Testes periódicos de vulnerabilidade

Pentest externo recomendado anualmente

15. DECLARAÇÃO FINAL

A LaserSafe adota postura estruturada, preventiva e estratégica em segurança da informação, visando:

Proteção de usuários e profissionais

Conformidade legal

Mitigação de riscos operacionais

Sustentabilidade tecnológica

Documento aprovado por:

Pedro Henrique Brezolin de Freitas
CTO – LaserSafe
